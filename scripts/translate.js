const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load .env from root

const sourceLanguage = 'en';
// Define target languages and their Azure API codes
const targetLanguages = [
    { code: 'fr', azureCode: 'fr' }, // French
    { code: 'es', azureCode: 'es' }, // Spanish
    { code: 'ar', azureCode: 'ar' }  // Arabic
];

const localesDir = path.resolve(__dirname, '../locales');
const sourceFile = path.join(localesDir, `${sourceLanguage}.json`);

// --- Azure Credentials ---
const azureKey = process.env.AZURE_TRANSLATOR_KEY;
const azureEndpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
const azureRegion = process.env.AZURE_TRANSLATOR_REGION;

if (!azureKey || !azureEndpoint || !azureRegion) {
    console.error("❌ Error: Azure Translator environment variables (AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_ENDPOINT, AZURE_TRANSLATOR_REGION) must be set in the .env file.");
    process.exit(1);
}

// --- Helper Function to Translate Text ---
async function translateText(text, targetLangAzureCode) {
    // Avoid translating empty strings or placeholders potentially
    if (!text || typeof text !== 'string' || text.trim() === '' || text.startsWith('// TODO')) {
        return text; // Return original if invalid or placeholder
    }
    try {
        const response = await axios({
            baseURL: azureEndpoint,
            url: '/translate',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': azureKey,
                'Ocp-Apim-Subscription-Region': azureRegion,
                'Content-type': 'application/json',
                'X-ClientTraceId': generateUUID() // Helpful for debugging with Azure
            },
            params: {
                'api-version': '3.0',
                'from': sourceLanguage,
                'to': targetLangAzureCode
            },
            data: [{ 'text': text }],
            responseType: 'json',
            timeout: 10000 // Add a timeout (10 seconds)
        });

        // Check for successful translation
        if (response.data && response.data[0] && response.data[0].translations && response.data[0].translations[0]) {
            return response.data[0].translations[0].text;
        } else {
            console.warn(`   ⚠️ Warning: Unexpected API response for text "${text.substring(0,20)}..." to ${targetLangAzureCode}. Keeping original.`);
            return text; // Fallback to original text if structure is unexpected
        }
    } catch (error) {
        const errMsg = error.response?.data?.error?.message || error.message || 'Unknown error';
        console.error(`   ❌ Error translating text "${text.substring(0, 20)}..." to ${targetLangAzureCode}: ${errMsg}`);
        // Optional: Check for specific error codes (e.g., 429 Too Many Requests)
        if (error.response?.status === 429) {
            console.warn("   Rate limit likely hit. Consider increasing delay.");
        }
        return text; // Fallback to original text on error
    }
}

// Helper to generate UUIDs for tracing
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


// --- Main Translation Function ---
async function runTranslations() {
    console.log(`\n🔄 Starting translation process from ${sourceFile}...`);

    let englishTranslations;
    try {
        englishTranslations = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
        console.log(`   ✅ Loaded ${Object.keys(englishTranslations).length} keys from ${sourceLanguage}.json.`);
    } catch (err) {
        console.error(`❌ Error reading source file ${sourceFile}:`, err);
        process.exit(1);
    }

    // Create locales directory if it doesn't exist
    if (!fs.existsSync(localesDir)) {
        fs.mkdirSync(localesDir, { recursive: true });
        console.log(`   📁 Created directory: ${localesDir}`);
    }

    for (const langInfo of targetLanguages) {
        const targetLangCode = langInfo.code;
        const targetAzureCode = langInfo.azureCode;
        const targetFile = path.join(localesDir, `${targetLangCode}.json`);
        console.log(`\n   ➡️ Translating to ${targetLangCode.toUpperCase()} (Azure code: ${targetAzureCode})...`);

        const translatedLangObj = {};
        const keys = Object.keys(englishTranslations);
        const totalKeys = keys.length;
        let translatedCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < totalKeys; i++) {
            const key = keys[i];
            const value = englishTranslations[key];

            // Simple progress update
            const progress = Math.round(((i + 1) / totalKeys) * 100);
            process.stdout.write(`      Processing key ${i + 1}/${totalKeys} (${progress}%) - ${key.substring(0, 40)}\r`);

            const translatedValue = await translateText(value, targetAzureCode);
            translatedLangObj[key] = translatedValue;

            if (translatedValue !== value) {
                translatedCount++;
            } else if (value && typeof value === 'string' && value.trim() !== '' && !value.startsWith('// TODO')) {
                skippedCount++; // Count as skipped if fallback was used for non-empty, non-placeholder text
            }

            // Add delay to prevent rate limiting - adjust as needed (e.g., 50ms-100ms)
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        process.stdout.write("\n"); // New line after progress indicator

        try {
            fs.writeFileSync(targetFile, JSON.stringify(translatedLangObj, null, 2), 'utf8');
            console.log(`   ✅ Successfully wrote ${targetLangCode}.json (${translatedCount} translated, ${skippedCount} potentially skipped/failed)`);
        } catch (err) {
            console.error(`   ❌ Error writing target file ${targetFile}:`, err);
        }
    }

    console.log('\n🏁 Translation process complete.');
}

runTranslations();