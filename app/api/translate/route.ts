import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Azure Credentials & Custom Model ID
const azureSubscriptionKey = process.env.AZURE_TRANSLATOR_KEY;
const azureEndpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
const azureLocation = process.env.AZURE_TRANSLATOR_REGION;
const twiCustomCategoryID = process.env.AZURE_CUSTOM_TWI_CATEGORY_ID; // Get Twi Category ID

if (!azureSubscriptionKey || !azureEndpoint || !azureLocation) {
    console.error("Azure Translator environment variables (KEY, ENDPOINT, REGION) are not set.");
}
// Warn if Twi category ID is missing but might be needed
if (!twiCustomCategoryID) {
     console.warn("AZURE_CUSTOM_TWI_CATEGORY_ID is not set. Twi translation will attempt to use the Azure general model if supported, or may fail.");
}

export async function POST(request: NextRequest) {
    // Basic check for essential Azure config on handler start
    if (!azureSubscriptionKey || !azureEndpoint || !azureLocation) {
        return NextResponse.json({ error: 'Translator service not configured on server.' }, { status: 500 });
    }

    try {
        const body = await request.json();
        // Ensure 'texts' is part of the body from the context fetch call
        const { texts, targetLanguage } = body;
        const sourceLanguage = 'en'; // Assume source is always English

        if (!texts || typeof texts !== 'object' || Object.keys(texts).length === 0 || !targetLanguage) {
            return NextResponse.json({ error: 'Invalid request body: Missing or invalid texts object or targetLanguage' }, { status: 400 });
        }

        // Languages supported by this Azure setup
        const supportedLanguages = ['en', 'fr', 'es', 'ar', 'tw'];
        if (!supportedLanguages.includes(targetLanguage)) {
             console.warn(`Unsupported target language requested: ${targetLanguage}`);
             return NextResponse.json({ error: `Unsupported target language: ${targetLanguage}` }, { status: 400 });
        }

        // No translation needed if target is English
        if (targetLanguage === 'en') {
            console.log("Target is English, returning original texts.");
            return NextResponse.json(texts);
        }

        const sourceKeys = Object.keys(texts);
        const requestBody = Object.values(texts).map(textValue => ({ Text: String(textValue) }));

        // --- Build Azure API Request ---
        const params = new URLSearchParams({
            'api-version': '3.0',
            'from': sourceLanguage,
            'to': targetLanguage
        });

        // *** Add Category ID for Twi Custom Model ***
        if (targetLanguage === 'tw' && twiCustomCategoryID) {
            params.append('category', twiCustomCategoryID);
            console.log(`Using Azure Custom Translator category ${twiCustomCategoryID} for Twi.`);
        } else if (targetLanguage === 'tw' && !twiCustomCategoryID) {
             console.warn("Attempting Twi translation with Azure's general model as AZURE_CUSTOM_TWI_CATEGORY_ID is not set.");
        }

        const translateUrl = `${azureEndpoint}translate?${params.toString()}`;
        const headers = {
            'Ocp-Apim-Subscription-Key': azureSubscriptionKey,
            'Ocp-Apim-Subscription-Region': azureLocation,
            'Content-type': 'application/json',
            'X-ClientTraceId': uuidv4().toString()
        };

        // --- Make the API Call ---
        console.log(`Translating to ${targetLanguage} via Azure...`);
        const azureResponse = await fetch(translateUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
        });

        // --- Process Response ---
        let translatedObject: Record<string, string> = {};

        if (!azureResponse.ok) {
            const errorStatus = azureResponse.status;
            const errorText = await azureResponse.text();
            console.error(`Azure API Error (${errorStatus}) for lang ${targetLanguage}: ${errorText}`);

            // Specific error handling
            if (errorStatus === 429) { console.warn(`Azure Rate Limit hit for ${targetLanguage}.`); }
            else if (errorText.includes("400036") || errorText.includes("target language is not valid")) { console.warn(`Azure reports target language ${targetLanguage} is invalid (maybe custom model issue?).`); }
            else if (errorText.includes("400077") || errorText.includes("Invalid Category ID")) { console.error(`Azure Error: Invalid Custom Translator Category ID '${twiCustomCategoryID}'.`); }

            // Graceful fallback: Return original English texts on error
            console.warn(`Azure translation failed for ${targetLanguage}, falling back to English texts.`);
            translatedObject = texts;

        } else {
            const azureResult = await azureResponse.json();
            if (!Array.isArray(azureResult) || azureResult.length !== requestBody.length) {
               console.error('Mismatch between request and Azure result count');
               translatedObject = texts; // Fallback
            } else {
                azureResult.forEach((item: any, index: number) => {
                    const originalKey = sourceKeys[index];
                    // Fallback to original English text if translation is missing for a specific item
                    translatedObject[originalKey] = item?.translations?.[0]?.text ?? texts[originalKey];
                });
            }
        }
        console.log(`Azure translation to ${targetLanguage} complete (or fell back).`);

        // --- Caching Header (Optional but recommended for production) ---
        const responseHeaders = new Headers();
        // Cache on CDN/browser for 1 hour, allow stale for a day while revalidating
        responseHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
        responseHeaders.set('CDN-Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Vercel specific

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
