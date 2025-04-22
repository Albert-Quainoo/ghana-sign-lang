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
    sourceLanguage: string = 'en',
    batchNumber: number
): Promise<Record<string, string>> {
    console.log(`Processing batch ${batchNumber} for ${targetLanguage} with Gemini...`);
    const prompt = buildTranslationPrompt(batchTexts, targetLanguage, sourceLanguage);
    const geminiRequestBody = { contents: [{ parts: [{ text: prompt }] }] };

    const geminiResponse = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequestBody),
    });

    if (!geminiResponse.ok) {
        // ... existing error handling ...
         const errorStatus = geminiResponse.status;
         const errorData = await geminiResponse.json().catch(() => ({ message: "Failed to parse error response" }));
         console.error(`Gemini API Error on batch ${batchNumber} (${errorStatus}) for lang ${targetLanguage}:`, JSON.stringify(errorData));
         if(errorStatus === 429) { console.warn(`Gemini Rate Limit hit on batch ${batchNumber} for ${targetLanguage}.`); }
         throw new Error(`Batch ${batchNumber} failed: ${errorStatus}`);
    }

    const geminiResult: GeminiApiResponse = await geminiResponse.json();

    if (geminiResult.error) {}
    if (!geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) {}

    const generatedText = geminiResult.candidates[0].content.parts[0].text;

    try {
        const jsonStart = generatedText.indexOf('{');
        const jsonEnd = generatedText.lastIndexOf('}');

        if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
            console.error(`Could not find valid JSON object delimiters '{' and '}' in Gemini response for batch ${batchNumber} (${targetLanguage}).`);
            console.error("Gemini Raw Response Text (Batch):", generatedText.substring(0, 500));
            throw new Error(`Valid JSON object not found in response for batch ${batchNumber}`);
        }

        const potentialJson = generatedText.substring(jsonStart, jsonEnd + 1);

        const batchTranslatedObject = JSON.parse(potentialJson);

        if (typeof batchTranslatedObject !== 'object' || batchTranslatedObject === null) {
             throw new Error(`Parsed batch ${batchNumber} result is not an object.`);
        }
        console.log(`Successfully processed batch ${batchNumber} for ${targetLanguage}.`);
        return batchTranslatedObject as Record<string, string>;
    } catch (parseError) {
         console.error(`Failed to parse potential JSON from Gemini for batch ${batchNumber} (${targetLanguage}). Error:`, parseError);
         console.error("Gemini Raw Response Text (Batch):", generatedText.substring(0, 500)); 
         throw new Error(`JSON parsing failed for batch ${batchNumber}`);
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
            if (cachedResult) {}
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
