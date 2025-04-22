import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const googleApiKey = process.env.GOOGLE_AI_API_KEY;
const geminiModelName = 'gemini-2.0-flash';
const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelName}:generateContent?key=${googleApiKey}`;

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) { console.error("CRITICAL: Upstash Redis environment variables missing."); }
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL || '', token: process.env.UPSTASH_REDIS_REST_TOKEN || '' });
const CACHE_TTL_SECONDS = 6 * 3600;

if (!googleApiKey) { console.error("CRITICAL: GOOGLE_AI_API_KEY missing."); }

interface SafetyRating { category: string; probability: string; }
interface GeminiPart { text: string; }
interface GeminiContent { parts: GeminiPart[]; role: string; }
interface GeminiCandidate { content: GeminiContent; finishReason: string; index: number; safetyRatings: SafetyRating[]; }
interface GeminiApiResponse { candidates: GeminiCandidate[]; promptFeedback?: unknown; error?: { code: number; message: string; status: string }; }

function buildTranslationPrompt(sourceTexts: Record<string, string>, targetLangCode: string, sourceLangCode: string = 'en'): string {
    const sourceJsonString = JSON.stringify(sourceTexts);
    return `
TASK: Translate the string values within the following JSON object from the source language "${sourceLangCode}" to the target language "${targetLangCode}".
INSTRUCTIONS:
1. Identify ALL string values in the INPUT JSON provided below.
2. Translate ONLY these string values to the target language: ${targetLangCode}. Retain original HTML tags or placeholders like {{variable}} if present.
3. Keep ALL original keys EXACTLY the same.
4. Maintain the original JSON structure precisely.
5. Output ONLY the complete, valid JSON object containing the translated values.
6. DO NOT include any introductory text, explanations, concluding remarks, or markdown formatting like \`\`\`json before or after the JSON object in your response. Just the raw JSON.
INPUT JSON:
${sourceJsonString}
TRANSLATED JSON OUTPUT:
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
        const errorStatus = geminiResponse.status;
        const errorData = await geminiResponse.json().catch(() => ({ message: "Failed to parse error response" }));
        console.error(`Gemini API Error on batch ${batchNumber} (${errorStatus}) for lang ${targetLanguage}:`, JSON.stringify(errorData));
        if(errorStatus === 429) { console.warn(`Gemini Rate Limit hit on batch ${batchNumber} for ${targetLanguage}.`); }
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
        const batchTranslatedObject: Record<string, string> = JSON.parse(cleanedJsonString);
        if (typeof batchTranslatedObject !== 'object' || batchTranslatedObject === null) {
             throw new Error(`Parsed batch ${batchNumber} result is not an object.`);
        }
        console.log(`Successfully processed batch ${batchNumber} for ${targetLanguage}.`);
        return batchTranslatedObject;
    } catch (parseError) {
         console.error(`Failed to parse JSON response from Gemini for batch ${batchNumber} (${targetLanguage}). Error:`, parseError);
         console.error("Gemini Raw Response Text (Batch):", generatedText.substring(0, 500));
         throw new Error(`JSON parsing failed for batch ${batchNumber}`);
    }
}

export async function POST(request: NextRequest) {
    if (!googleApiKey || !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.error("Missing necessary environment variables for Google AI or Upstash Redis.");
        return NextResponse.json({ error: 'Translator or Cache service not configured on server.' }, { status: 500 });
    }

    let body;
    try {
        body = await request.json();
        const { texts, targetLanguage } = body;
        const sourceLanguage = 'en';

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

        console.log(`Cache miss for ${targetLanguage}. Calling Gemini API in parallel batches...`);
        const sourceEntries = Object.entries(texts);
        const batchSize = 40;
        const batches: Record<string, string>[] = [];
        for (let i = 0; i < sourceEntries.length; i += batchSize) { batches.push(Object.fromEntries(sourceEntries.slice(i, i + batchSize)) as Record<string, string>); }
        const batchPromises = batches.map((batchTexts, index) => translateBatch(batchTexts, targetLanguage, sourceLanguage, index + 1));
        const results = await Promise.allSettled(batchPromises);

        let finalTranslatedObject: Record<string, string> = {};
        let overallSuccess = true;

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                finalTranslatedObject = { ...finalTranslatedObject, ...(result.value as Record<string, string>) };
            } else {
                console.error(`Batch ${index + 1} failed:`, result.reason);
                overallSuccess = false;
            }
        });

        const responseHeaders = new Headers();
        responseHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`);
        responseHeaders.set('X-Translation-Cache', 'MISS');

        if (overallSuccess) {
            console.log(`Gemini parallel batch translation for ${targetLanguage} completed successfully.`);
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
            console.error(`Gemini parallel batch translation failed for ${targetLanguage}. Returning fallback.`);
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