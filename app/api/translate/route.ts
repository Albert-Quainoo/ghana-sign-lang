import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// --- Google AI Gemini Configuration ---
const googleApiKey = process.env.GOOGLE_AI_API_KEY;
const geminiModelName = 'gemini-2.0-flash';
const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelName}:generateContent?key=${googleApiKey}`;
// --- End Google AI Configuration ---

// --- Upstash Redis Configuration ---
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error("CRITICAL: Upstash Redis environment variables missing. Caching disabled.");
}
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});
const CACHE_TTL_SECONDS = 6 * 3600;
// --- End Upstash Configuration ---


if (!googleApiKey) { console.error("CRITICAL: GOOGLE_AI_API_KEY missing."); }

// --- Type definitions ---
interface SafetyRating { category: string; probability: string; }
interface GeminiPart { text: string; }
interface GeminiContent { parts: GeminiPart[]; role: string; }
interface GeminiCandidate { content: GeminiContent; finishReason: string; index: number; safetyRatings: SafetyRating[]; }
interface GeminiApiResponse { candidates: GeminiCandidate[]; promptFeedback?: unknown; error?: { code: number; message: string; status: string }; }

// --- Prompt Builder ---
function buildTranslationPrompt(sourceTexts: Record<string, string>, targetLangCode: string, sourceLangCode: string = 'en'): string {
    const sourceJsonString = JSON.stringify(sourceTexts);
    // Keep prompt concise
    return `TASK: Translate string values in JSON from ${sourceLangCode} to ${targetLangCode}. Maintain keys and structure. Output ONLY valid JSON. INPUT JSON: ${sourceJsonString} TRANSLATED JSON OUTPUT:`;
}

// --- Single Batch Translation Function ---
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
        const errorStatus = geminiResponse.status;
        const errorData = await geminiResponse.json().catch(() => ({ message: "Failed to parse error response" }));
        console.error(`Gemini API Error on batch ${batchNumber} (${errorStatus}) for lang ${targetLanguage}:`, JSON.stringify(errorData));
        if(errorStatus === 429) { console.warn(`Gemini Rate Limit hit on batch ${batchNumber} for ${targetLanguage}. Consider delay or larger batches.`); }
        throw new Error(`Batch ${batchNumber} failed: ${errorStatus}`);
    }

    const geminiResult: GeminiApiResponse = await geminiResponse.json();

    if (geminiResult.error) {
       console.error(`Gemini API returned error on batch ${batchNumber} for ${targetLanguage}:`, JSON.stringify(geminiResult.error));
       throw new Error(`Gemini functional error on batch ${batchNumber}: ${geminiResult.error.message}`);
    }
    if (!geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) {
       console.error(`Invalid Gemini response structure on batch ${batchNumber}:`, JSON.stringify(geminiResult).substring(0, 500));
       throw new Error(`Invalid response structure on batch ${batchNumber}`);
    }

    const generatedText = geminiResult.candidates[0].content.parts[0].text;
    const cleanedJsonString = generatedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    try {
        const batchTranslatedObject = JSON.parse(cleanedJsonString);
        if (typeof batchTranslatedObject !== 'object' || batchTranslatedObject === null) {
             throw new Error(`Parsed batch ${batchNumber} result is not an object.`);
        }
        console.log(`Successfully processed batch ${batchNumber} for ${targetLanguage}.`);
        return batchTranslatedObject as Record<string, string>;
    } catch (parseError) {
         console.error(`Failed to parse JSON response from Gemini for batch ${batchNumber} (${targetLanguage}). Error:`, parseError);
         console.error("Gemini Raw Response Text (Batch):", generatedText.substring(0, 500));
         throw new Error(`JSON parsing failed for batch ${batchNumber}`);
    }
}

// --- Main POST Handler ---
export async function POST(request: NextRequest) {
    // Check required env vars first
    if (!googleApiKey || !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return NextResponse.json({ error: 'Translator or Cache service not configured on server.' }, { status: 500 });
    }

    let body;
    try {
        body = await request.json();
        const { texts, targetLanguage } = body;
        const sourceLanguage = 'en';

        // Validate input
        if (!texts || typeof texts !== 'object' || Object.keys(texts).length === 0 || !targetLanguage) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        const supportedLanguages = ['en', 'fr', 'es', 'ar', 'tw'];
        if (!supportedLanguages.includes(targetLanguage)) {
             return NextResponse.json({ error: `Unsupported target language: ${targetLanguage}` }, { status: 400 });
        }
        if (targetLanguage === 'en') {
            return NextResponse.json(texts);
        }

        // Check Upstash Cache
        const cacheKey = `gemini_translation:${sourceLanguage}:${targetLanguage}`;
        try {
            console.log(`Checking Upstash cache for key: ${cacheKey}`);
            const cachedResult = await redis.get<Record<string, string>>(cacheKey);
            if (cachedResult) {
                console.log(`Returning cached Upstash result for ${targetLanguage}`);
                const headers = new Headers();
                headers.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`);
                headers.set('X-Translation-Cache', 'HIT');
                return NextResponse.json(cachedResult, { headers });
            }
        } catch (redisError) {
             console.error(`Upstash Redis get error for key ${cacheKey}:`, redisError);
        }

        // --- Sequential Batching Logic ---
        console.log(`Cache miss for ${targetLanguage}. Calling Gemini API sequentially...`);
        const sourceEntries = Object.entries(texts);
        const batchSize = 40; 
        let finalTranslatedObject: Record<string, string> = {};
        let overallSuccess = true;
        const totalBatches = Math.ceil(sourceEntries.length / batchSize);

        for (let i = 0; i < sourceEntries.length; i += batchSize) {
            const batchEntries = sourceEntries.slice(i, i + batchSize);
            const batchSourceTexts = Object.fromEntries(batchEntries);
            const batchNumber = Math.floor(i / batchSize) + 1;

            console.log(`Starting batch ${batchNumber}/${totalBatches} for ${targetLanguage}...`);
            try {
                const batchResult = await translateBatch(batchSourceTexts as Record<string, string>, targetLanguage, sourceLanguage, batchNumber);
                finalTranslatedObject = { ...finalTranslatedObject, ...batchResult };


            } catch (batchError) {
                console.error(`Stopping translation due to error in batch ${batchNumber} for ${targetLanguage}:`, batchError);
                overallSuccess = false;
                break;
            }
        } // End sequential loop
        // --- End Sequential Batching Logic ---

        const responseHeaders = new Headers();
        responseHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`);
        responseHeaders.set('X-Translation-Cache', 'MISS');

        if (overallSuccess) {
            console.log(`Sequential batch translation for ${targetLanguage} completed successfully.`);
             if (Object.keys(finalTranslatedObject).length < sourceEntries.length * 0.9) {
                  console.warn(`Potential key loss during batch translation for ${targetLanguage}.`);
             }
             try {
                 console.log(`Storing result for ${targetLanguage} in Upstash Redis (TTL: ${CACHE_TTL_SECONDS}s)...`);
                 await redis.set(cacheKey, JSON.stringify(finalTranslatedObject), { ex: CACHE_TTL_SECONDS });
                 console.log(`Stored batched Gemini result for ${targetLanguage} in Upstash.`);
             } catch(redisSetError) {
                 console.error(`Upstash Redis set error for key ${cacheKey}:`, redisSetError);
             }
            return NextResponse.json(finalTranslatedObject, { headers: responseHeaders });
        } else {
            console.error(`Sequential batch translation failed for ${targetLanguage}. Returning fallback.`);
            return NextResponse.json(texts, { status: 500, headers: responseHeaders });
        }

    } catch (error) {
        console.error('API Route general error:', error);
         if (error instanceof SyntaxError) { return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 }); }
        return NextResponse.json({ error: 'Translation failed due to internal server error' }, { status: 500 });
    }
}

export async function GET() {
  return NextResponse.json({ message: 'Google AI Gemini Translate API route active. Use POST.' });
}