import { NextRequest, NextResponse } from 'next/server';
import NodeCache from 'node-cache';

// Cache Initialization
const translationCache = new NodeCache({ stdTTL: 21600, checkperiod: 3600 });

// --- Google AI Gemini Configuration ---
const googleApiKey = process.env.GOOGLE_AI_API_KEY;
const geminiModelName = 'gemini-2.0-flash'; 
const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelName}:generateContent?key=${googleApiKey}`;
// --- End Google AI Configuration ---

// Initial check for essential config
if (!googleApiKey) {
    console.error("CRITICAL: GOOGLE_AI_API_KEY environment variable is not set.");
}

// Define expected Gemini response structure
interface SafetyRating {
    category: string;
    probability: string; 
}

interface GeminiPart { text: string; }
interface GeminiContent { parts: GeminiPart[]; role: string; }
interface GeminiCandidate {
    content: GeminiContent;
    finishReason: string;
    index: number;
    safetyRatings: SafetyRating[]; 
}
interface GeminiApiResponse {
    candidates: GeminiCandidate[];
    promptFeedback?: unknown; 
    error?: { code: number; message: string; status: string };
}
// Function to build the prompt for Gemini
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

// --- Main POST Handler ---
export async function POST(request: NextRequest) {
    if (!googleApiKey) {
        return NextResponse.json({ error: 'Translator service not configured on server.' }, { status: 500 });
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

        // --- Check Server-Side Cache ---
        const cacheKey = `gemini_translation_${sourceLanguage}_${targetLanguage}`;
        const cachedResult = translationCache.get<Record<string, string>>(cacheKey);
        if (cachedResult) {
            console.log(`Returning cached Gemini result for ${targetLanguage}`);
            const cacheHeaders = new Headers();
            cacheHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
            cacheHeaders.set('X-Translation-Cache', 'HIT');
            return NextResponse.json(cachedResult, { headers: cacheHeaders });
        }
        // --- End Cache Check ---


        // --- Batching Logic ---
        console.log(`Cache miss for ${targetLanguage}. Calling Gemini API in batches...`);
        const sourceEntries = Object.entries(texts);
        const batchSize = 40;
        let finalTranslatedObject: Record<string, string> = {};
        let overallSuccess = true;

        for (let i = 0; i < sourceEntries.length; i += batchSize) {
            const batchEntries = sourceEntries.slice(i, i + batchSize);
            const batchSourceTexts = Object.fromEntries(
                batchEntries.map(([k, v]) => [k, String(v)])
            ) as Record<string, string>;
            const batchNumber = Math.floor(i / batchSize) + 1;

            console.log(`Processing batch ${batchNumber} for ${targetLanguage} (Keys ${i + 1}-${Math.min(i + batchSize, sourceEntries.length)})...`);
            const prompt = buildTranslationPrompt(batchSourceTexts, targetLanguage, sourceLanguage);
            const geminiRequestBody = { contents: [{ parts: [{ text: prompt }] }] };

            try {
                const geminiResponse = await fetch(geminiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(geminiRequestBody),
                });

                if (!geminiResponse.ok) {
                    const errorStatus = geminiResponse.status;
                    const errorData = await geminiResponse.json().catch(() => ({})); 
                    console.error(`Gemini API Error on batch ${batchNumber} (${errorStatus}) for lang ${targetLanguage}:`, JSON.stringify(errorData));
                    if (errorStatus === 429) { console.warn(`Gemini Rate Limit hit on batch ${batchNumber} for ${targetLanguage}.`); }
                    throw new Error(`Batch ${batchNumber} failed: ${errorStatus}`);
                }

                const geminiResult: GeminiApiResponse = await geminiResponse.json();

                if (geminiResult.error) {
                    console.error(`Gemini API returned error on batch ${batchNumber} for ${targetLanguage}:`, JSON.stringify(geminiResult.error));
                    throw new Error(`Gemini functional error on batch ${batchNumber}`);
                 }

                if (!geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) {
                    console.error(`Invalid Gemini response structure on batch ${batchNumber}:`, JSON.stringify(geminiResult).substring(0, 500));
                    throw new Error(`Invalid response structure on batch ${batchNumber}`);
                }

                const generatedText = geminiResult.candidates[0].content.parts[0].text;
                const cleanedJsonString = generatedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');

                // Attempt to parse the JSON from this batch
                const batchTranslatedObject = JSON.parse(cleanedJsonString);

                if (typeof batchTranslatedObject !== 'object' || batchTranslatedObject === null) {
                     throw new Error(`Parsed batch ${batchNumber} result is not an object.`);
                }

                // Merge batch results into the final object
                finalTranslatedObject = { ...finalTranslatedObject, ...batchTranslatedObject };
                 console.log(`Successfully processed batch ${batchNumber} for ${targetLanguage}.`);


            } catch (batchError) {
                console.error(`Error processing batch ${batchNumber} for ${targetLanguage}:`, batchError);
                overallSuccess = false;
                break; 
            }
        } 
        // --- End Batching Logic ---

        const responseHeaders = new Headers();
        responseHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        responseHeaders.set('X-Translation-Cache', 'MISS');

        if (overallSuccess) {
            console.log(`Gemini batch translation for ${targetLanguage} completed successfully.`);
             if (Object.keys(finalTranslatedObject).length < sourceEntries.length * 0.9) { 
                  console.warn(`Potential key loss during batch translation for ${targetLanguage}. Expected ~${sourceEntries.length}, Got ${Object.keys(finalTranslatedObject).length}`);
             }
            translationCache.set(cacheKey, finalTranslatedObject);
            console.log(`Stored batched Gemini result for ${targetLanguage} in server cache.`);
            return NextResponse.json(finalTranslatedObject, { headers: responseHeaders });
        } else {
            console.error(`Gemini batch translation for ${targetLanguage} failed. Returning fallback.`);
            return NextResponse.json(texts, { status: 500, headers: responseHeaders });
        }

    } catch (error) {
        console.error('API Route general error:', error);
         if (error instanceof SyntaxError) { return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 }); }
        return NextResponse.json({ error: 'Translation failed due to internal server error' }, { status: 500 });
    }
}

// GET handler
export async function GET() {
  return NextResponse.json({ message: 'Google AI Gemini Translate API route active. Use POST.' });
}