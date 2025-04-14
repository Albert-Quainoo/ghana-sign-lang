// --- START OF FILE app/api/translate/route.ts ---

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import NodeCache from 'node-cache'; // Import node-cache

const translationCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
// --- End Cache Initialization ---


// Azure Credentials & Custom Model ID
const azureSubscriptionKey = process.env.AZURE_TRANSLATOR_KEY;
const azureEndpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
const azureLocation = process.env.AZURE_TRANSLATOR_REGION;
const twiCustomCategoryID = process.env.AZURE_CUSTOM_TWI_CATEGORY_ID;

// Initial check for essential config
if (!azureSubscriptionKey || !azureEndpoint || !azureLocation) {
    console.error("CRITICAL: Azure Translator environment variables (KEY, ENDPOINT, REGION) are not set.");
}
if (!twiCustomCategoryID) {
     console.warn("AZURE_CUSTOM_TWI_CATEGORY_ID is not set. Twi translation will attempt general model.");
}

// Define expected Azure response structure
interface AzureTranslationResultItem {
  translations?: { text: string; to: string; }[];
}

export async function POST(request: NextRequest) {
    if (!azureSubscriptionKey || !azureEndpoint || !azureLocation) {
        return NextResponse.json({ error: 'Translator service not configured on server.' }, { status: 500 });
    }

    try {
        const body = await request.json();
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
            return NextResponse.json(texts); // No translation needed
        }

        // --- Check Server-Side Cache ---
        const cacheKey = `translation_${sourceLanguage}_${targetLanguage}`;
        const cachedResult = translationCache.get<Record<string, string>>(cacheKey);
        if (cachedResult) {
            console.log(`Returning cached result for ${targetLanguage}`);
            // Optional: Still set CDN caching headers for cached responses
             const responseHeaders = new Headers();
             responseHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
             responseHeaders.set('CDN-Cache-Control', 'public, max-age=3600, s-maxage=3600');
            return NextResponse.json(cachedResult, { headers: responseHeaders });
        }
        // --- End Cache Check ---


        // --- If not cached, proceed with Azure API Call ---
        console.log(`Cache miss for ${targetLanguage}. Calling Azure API...`);
        const sourceKeys = Object.keys(texts);
        const requestBody = Object.values(texts).map(textValue => ({ Text: String(textValue) }));

        const params = new URLSearchParams({
            'api-version': '3.0',
            'from': sourceLanguage,
            'to': targetLanguage
        });

        if (targetLanguage === 'tw' && twiCustomCategoryID) {
            params.append('category', twiCustomCategoryID);
            console.log(`Using Azure Custom Category ${twiCustomCategoryID} for Twi.`);
        } else if (targetLanguage === 'tw') {
             console.warn("Attempting Twi translation with Azure's general model (no Category ID).");
        }

        const translateUrl = `${azureEndpoint}translate?${params.toString()}`;
        const headers = {
            'Ocp-Apim-Subscription-Key': azureSubscriptionKey,
            'Ocp-Apim-Subscription-Region': azureLocation,
            'Content-type': 'application/json',
            'X-ClientTraceId': uuidv4().toString()
        };

        const azureResponse = await fetch(translateUrl, {
            method: 'POST', headers: headers, body: JSON.stringify(requestBody),
        });

        let translatedObject: Record<string, string> = {};
        let translationSuccessful = false; // Flag to check if we should cache

        if (!azureResponse.ok) {
            const errorStatus = azureResponse.status;
            const errorText = await azureResponse.text();
            console.error(`Azure API Error (${errorStatus}) for lang ${targetLanguage}: ${errorText}`);
            if (errorStatus === 429) { console.warn(`Azure Rate Limit hit for ${targetLanguage}.`); }
             // Fallback to English on error
            translatedObject = texts;
            translationSuccessful = false; // Don't cache the fallback
        } else {
            const azureResult = await azureResponse.json();
            const typedAzureResult = azureResult as AzureTranslationResultItem[];

            if (!Array.isArray(typedAzureResult) || typedAzureResult.length !== requestBody.length) {
               console.error('Mismatch between request and Azure result count');
               translatedObject = texts; // Fallback
               translationSuccessful = false;
            } else {
                typedAzureResult.forEach((item: AzureTranslationResultItem, index: number) => {
                    const originalKey = sourceKeys[index];
                    translatedObject[originalKey] = item?.translations?.[0]?.text ?? texts[originalKey];
                });
                translationSuccessful = true; // Mark as successful
            }
        }
        console.log(`Azure translation fetch for ${targetLanguage} complete (Success: ${translationSuccessful}).`);

        // --- Store in Server-Side Cache ONLY if successful ---
        if (translationSuccessful) {
            translationCache.set(cacheKey, translatedObject);
            console.log(`Stored result for ${targetLanguage} in server cache.`);
        }
        // --- End Cache Store ---


        // Set CDN/Browser caching headers
        const responseHeaders = new Headers();
        responseHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
        responseHeaders.set('CDN-Cache-Control', 'public, max-age=3600, s-maxage=3600');

        return NextResponse.json(translatedObject, { headers: responseHeaders });

    } catch (error) {
        console.error('API Route general error:', error);
        return NextResponse.json({ error: 'Translation failed due to server error' }, { status: 500 });
    }
}

// GET handler
export async function GET() {
  return NextResponse.json({ message: 'Azure Translate API route active. Use POST.' });
}
