import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// --- Config ---
const googleApiKey = process.env.GOOGLE_AI_API_KEY;
const geminiModelName = 'gemini-2.0-flash';
const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelName}:generateContent?key=${googleApiKey}`;

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) { console.error("CRITICAL: Upstash Redis environment variables missing."); }
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL || '', token: process.env.UPSTASH_REDIS_REST_TOKEN || '' });
const CACHE_TTL_SECONDS = 6 * 3600; 

const TEXT_BATCH_SIZE = 30; 
const PARALLEL_CHUNK_SIZE = 3; 
const DELAY_BETWEEN_CHUNKS_MS = 15000; 

if (!googleApiKey) { console.error("CRITICAL: GOOGLE_AI_API_KEY missing."); }

// --- Types and Helpers ---
interface SafetyRating { category: string; probability: string; }
interface GeminiPart { text: string; }
interface GeminiContent { parts: GeminiPart[]; role: string; }
interface GeminiCandidate { content: GeminiContent; finishReason: string; index: number; safetyRatings: SafetyRating[]; }
interface GeminiApiResponse { candidates: GeminiCandidate[]; promptFeedback?: unknown; error?: { code: number; message: string; status: string }; }

function buildTranslationPrompt(sourceTexts: Record<string, string>, targetLangCode: string, sourceLangCode: string = 'en'): string {
    return `You are a translation assistant. Translate the following JSON object from ${sourceLangCode} to ${targetLangCode}. Only return a valid JSON object mapping the same keys to their translations, with no extra text or comments.

${JSON.stringify(sourceTexts, null, 2)}
`;
}
async function translateBatch(
    batchTexts: Record<string, string>,
    targetLanguage: string,
    sourceLanguage: string,
    batchNumber: number
): Promise<Record<string, string>> {
    // Build the prompt for Gemini API
    const prompt = buildTranslationPrompt(batchTexts, targetLanguage, sourceLanguage);

    const requestBody = {
        contents: [
            {
                parts: [{ text: prompt }],
                role: "user"
            }
        ]
    };

    try {
        const response = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            console.error(`Gemini API batch ${batchNumber} failed:`, response.status, await response.text());
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data: GeminiApiResponse = await response.json();

        if (data.error) {
            console.error(`Gemini API batch ${batchNumber} error:`, data.error);
            throw new Error(data.error.message);
        }

        const candidate = data.candidates && data.candidates[0];
        if (!candidate || !candidate.content || !candidate.content.parts || !candidate.content.parts[0].text) {
            throw new Error('Invalid Gemini API response structure');
        }

        let translations: Record<string, string> = {};
        try {
            translations = JSON.parse(candidate.content.parts[0].text);
        } catch (parseError) {
            console.error('Failed to parse Gemini translation response:', candidate.content.parts[0].text);
            throw parseError;
        }

        return translations;
    } catch (error) {
        console.error(`translateBatch error (batch ${batchNumber}):`, error);
        throw error;
    }
}
// --- End Types and Helpers ---

// --- Main POST Handler ---
export async function POST(request: NextRequest) {
    if (!googleApiKey || !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return NextResponse.json({ error: 'Translator or Cache service not configured on server.' }, { status: 500 });
    }

    let body;
    try {
        body = await request.json();
        const { texts, targetLanguage } = body;
        const sourceLanguage = 'en';

        // Input validation
        if (!texts || typeof texts !== 'object' || Object.keys(texts).length === 0 || !targetLanguage) { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }
        const supportedLanguages = ['en', 'fr', 'es', 'ar', 'tw'];
        if (!supportedLanguages.includes(targetLanguage)) { return NextResponse.json({ error: `Unsupported target language: ${targetLanguage}` }, { status: 400 }); }
        if (targetLanguage === 'en') { return NextResponse.json(texts); }

        // Check Cache
        const cacheKey = `gemini_translation:${sourceLanguage}:${targetLanguage}`;
        try {
            const cachedResult = await redis.get<Record<string, string>>(cacheKey);
            if (cachedResult) { /* ... return cached result ... */ }
        } catch (redisError) { console.error(`Upstash Redis get error for key ${cacheKey}:`, redisError); }


        // --- Throttled Parallel Batching ---
        console.log(`Cache miss for ${targetLanguage}. Calling Gemini API in throttled parallel batches...`);
        const sourceEntries = Object.entries(texts);
        let finalTranslatedObject: Record<string, string> = {};
        let overallSuccess = true;

        for (let i = 0; i < sourceEntries.length; i += (TEXT_BATCH_SIZE * PARALLEL_CHUNK_SIZE)) {
            const chunkStartIdx = i;
            const chunkEndIdx = Math.min(i + (TEXT_BATCH_SIZE * PARALLEL_CHUNK_SIZE), sourceEntries.length);
            const currentChunkEntries = sourceEntries.slice(chunkStartIdx, chunkEndIdx);

            const chunkBatches: Record<string, string>[] = [];
            for (let j = 0; j < currentChunkEntries.length; j += TEXT_BATCH_SIZE) {
                chunkBatches.push(Object.fromEntries(currentChunkEntries.slice(j, j + TEXT_BATCH_SIZE)) as Record<string, string>);
            }

            if (chunkBatches.length === 0) continue; 

            console.log(`Processing chunk starting at index ${chunkStartIdx} (${chunkBatches.length} parallel batches) for ${targetLanguage}...`);

            const batchPromises = chunkBatches.map((batchTexts, batchIndex) =>
                translateBatch(
                    batchTexts,
                    targetLanguage,
                    sourceLanguage,
                    Math.floor(chunkStartIdx / TEXT_BATCH_SIZE) + batchIndex + 1
                )
            );

            const results = await Promise.allSettled(batchPromises);

            results.forEach((result, batchIndex) => {
                 const globalBatchNumber = Math.floor(chunkStartIdx / TEXT_BATCH_SIZE) + batchIndex + 1;
                 if (result.status === 'fulfilled') {
                     const value = result.value;
                     if (typeof value === 'object' && value !== null) {
                         finalTranslatedObject = { ...finalTranslatedObject, ...value };
                     } else {
                         console.error(`Chunk Batch ${globalBatchNumber} fulfilled but invalid value:`, value);
                         overallSuccess = false;
                     }
                 } else {
                     console.error(`Chunk Batch ${globalBatchNumber} failed:`, result.reason);
                     overallSuccess = false;
                 }
             });

            if (!overallSuccess) {
                console.error(`Stopping further processing due to failure in chunk starting at index ${chunkStartIdx}.`);
                break;
            }


            if (chunkEndIdx < sourceEntries.length) {
                console.log(`Chunk completed. Waiting ${DELAY_BETWEEN_CHUNKS_MS}ms before next chunk...`);
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CHUNKS_MS));
            }

        } 

        const responseHeaders = new Headers();
        responseHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`);
        responseHeaders.set('X-Translation-Cache', 'MISS');

        if (overallSuccess) {
            console.log(`Throttled batch translation for ${targetLanguage} completed successfully.`);
            if (Object.keys(finalTranslatedObject).length < sourceEntries.length * 0.9) {
                 console.warn(`Potential key loss during batch translation for ${targetLanguage}.`);
            }
            try {
                 await redis.set(cacheKey, JSON.stringify(finalTranslatedObject), { ex: CACHE_TTL_SECONDS });
                 console.log(`Stored result for ${targetLanguage} in Upstash.`);
            } catch(redisSetError) { console.error(`Upstash Redis set error:`, redisSetError); }
            return NextResponse.json(finalTranslatedObject, { headers: responseHeaders });
        } else {
            console.error(`Throttled batch translation failed for ${targetLanguage}. Returning fallback.`);
            return NextResponse.json(texts, { status: 500, headers: responseHeaders });
        }

    } catch (error) { 
        console.error('API Route general error:', error);
         if (error instanceof SyntaxError) { return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 }); }
        return NextResponse.json({ error: 'Translation failed due to internal server error' }, { status: 500 });
    }
}

export async function GET() { return NextResponse.json({ message: 'Google AI Gemini Translate API route active. Use POST.' }); }
