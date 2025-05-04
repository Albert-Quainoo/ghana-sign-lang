import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { TranslationServiceClient } from '@google-cloud/translate';
import enTranslations from '../../../locales/en.json';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const location = 'global';
const CACHE_TTL_SECONDS = 6 * 3600;

let redis: Redis | null = null;
if (redisUrl && redisToken) {
    redis = new Redis({ url: redisUrl, token: redisToken });
} else {
    console.warn("Redis environment variables missing. Translation caching disabled.");
}

if (!projectId) {
    console.error("CRITICAL: GOOGLE_CLOUD_PROJECT environment variable not found.");
}
const translateClient = new TranslationServiceClient();

const supportedLanguagesMap: Record<string, string> = {
    en: 'en', fr: 'fr', es: 'es', ar: 'ar', tw: 'ak',
};
const supportedInternalLanguages = Object.keys(supportedLanguagesMap);

export async function POST(request: NextRequest) {
    let body;
    let receivedTargetLanguage: string | null = null;

    try {
        body = await request.json();
        receivedTargetLanguage = body.targetLanguage;
        console.log(`Received request for targetLanguage: "${receivedTargetLanguage}" (Type: ${typeof receivedTargetLanguage})`);

        let isSupported = false;
        if (typeof receivedTargetLanguage === 'string') {
            isSupported = supportedInternalLanguages.includes(receivedTargetLanguage.trim());
            console.log(`DEBUG: Checking internal code "${receivedTargetLanguage}". Is supported: ${isSupported}`);
        } else {
            console.error(`Validation failed: targetLanguage is not a string (Type: ${typeof receivedTargetLanguage})`);
        }

        if (!isSupported) {
            console.error(`Validation failed: Explicitly returning 400 for "${receivedTargetLanguage}"`);
            return NextResponse.json({ error: `Invalid or unsupported targetLanguage: ${receivedTargetLanguage}` }, { status: 400 });
        }

        if (receivedTargetLanguage === 'en') {
            console.log(`[en] Returning direct English.`);
            return NextResponse.json(enTranslations, { headers: { 'X-Translation-Source': 'Direct (English)' } });
        }

        const googleTargetLang = supportedLanguagesMap[receivedTargetLanguage!];
        const cacheKey = `translations:${receivedTargetLanguage}`;
        let cacheStatus: 'HIT' | 'MISS' | 'DISABLED' | 'ERROR' = redis ? 'MISS' : 'DISABLED';
        let translationData: Record<string, string> | null = null;
        const responseHeaders = new Headers();

        if (redis) {
             console.log(`[${receivedTargetLanguage}] Attempting Redis GET for key: ${cacheKey}`);
             try {
                const cachedData = await redis.get<string | null>(cacheKey);
                 console.log(`[${receivedTargetLanguage}] Redis GET completed. Data found: ${!!cachedData}`);
                if (cachedData) {
                    try {
                        const parsedData = JSON.parse(cachedData);
                        if (typeof parsedData === 'object' && parsedData !== null) {
                            translationData = parsedData as Record<string, string>;
                            cacheStatus = 'HIT';
                            console.log(`[${receivedTargetLanguage}] Cache HIT.`);
                            responseHeaders.set('X-Translation-Source', 'Cache');
                            responseHeaders.set('X-Translation-Cache', cacheStatus);
                            responseHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`);
                            return NextResponse.json(translationData, { headers: responseHeaders });
                        } else { console.error(`[${receivedTargetLanguage}] Invalid data structure in cache.`); cacheStatus = 'ERROR'; }
                    } catch (parseError){ console.error(`[${receivedTargetLanguage}] Failed to parse cached JSON:`, parseError); cacheStatus = 'ERROR'; }
                } else { cacheStatus = 'MISS'; console.log(`[${receivedTargetLanguage}] Cache MISS.`);}
            } catch (redisError) {
                 console.error(`[${receivedTargetLanguage}] Redis GET error caught:`, redisError);
                 cacheStatus = 'ERROR';
            }
        } else {
             console.log(`[${receivedTargetLanguage}] Redis client not available. Cache DISABLED.`);
             cacheStatus = 'DISABLED';
        }

        console.log(`[${receivedTargetLanguage}] Cache status: ${cacheStatus}. Translating to Google Code: ${googleTargetLang}.`);
        responseHeaders.set('X-Translation-Cache', cacheStatus);

        const sourceTexts = Object.values(enTranslations);
        const sourceKeys = Object.keys(enTranslations);

        if (!projectId || sourceKeys.length === 0) {
             console.error("Missing Project ID or empty source translations.");
             responseHeaders.set('X-Translation-Source', 'Fallback (Config Error)');
             return NextResponse.json(enTranslations, { status: 500, headers: responseHeaders });
        }

        try {
            console.log(`[${receivedTargetLanguage}] Attempting Google API Call for target '${googleTargetLang}' with ${sourceTexts.length} texts...`);

            const [response] = await translateClient.translateText({
                parent: `projects/${projectId}/locations/${location}`,
                contents: sourceTexts,
                mimeType: 'text/plain',
                sourceLanguageCode: 'en',
                targetLanguageCode: googleTargetLang,
            });

            console.log(`[${receivedTargetLanguage}] Google API Call SUCCEEDED for '${googleTargetLang}'. Response length: ${response.translations?.length ?? 'undefined'}`);

             if (!response.translations || response.translations.length === 0) {
                 console.error(`Google Translate API returned NO translations for ${googleTargetLang}. Falling back.`);
                 throw new Error('Translation failed: No translations returned from API.');
             }
             if (response.translations.length !== sourceTexts.length) {
                 console.warn(`Google Translate API response length mismatch for ${googleTargetLang}. Expected ${sourceTexts.length}, got ${response.translations.length}.`);
                 throw new Error('Translation failed: Response length mismatch.');
             }
             if (receivedTargetLanguage === 'tw') {
                 console.log(`[tw] DEBUG: Raw API 'ak' translations (first 5):`, JSON.stringify(response.translations.slice(0, 5)));
             }

             console.log(`[${receivedTargetLanguage}] Processing ${response.translations.length} translations...`);
             const reconstructedData: Record<string, string> = {};
             let englishFallbackCount = 0;
             response.translations.forEach((translation, index) => {
                 const originalKey = sourceKeys[index];
                 const sourceText = sourceTexts[index];
                 const translatedText = translation.translatedText?.replace(/'/g, "'").replace(/"/g, '"').trim();

                 if (originalKey) {
                     if (!translatedText || (receivedTargetLanguage !== 'en' && translatedText === sourceText)) {
                         if (!translatedText) console.warn(`[${receivedTargetLanguage}] Missing translation for key: ${originalKey}, index: ${index}`);
                         else if (receivedTargetLanguage !== 'en') console.warn(`[${receivedTargetLanguage}] Translation for key ${originalKey} identical to source English.`);
                         reconstructedData[originalKey] = sourceText;
                         englishFallbackCount++;
                     } else {
                         reconstructedData[originalKey] = translatedText;
                     }
                 } else {
                      console.warn(`[${receivedTargetLanguage}] Missing original key for index ${index}.`);
                 }
             });

             translationData = reconstructedData;
             console.log(`[${receivedTargetLanguage}] Successfully processed translations. English fallbacks used: ${englishFallbackCount}/${sourceKeys.length}.`);

             if (redis && translationData && Object.keys(translationData).length > 0) {
                 console.log(`[${receivedTargetLanguage}] Attempting to write ${Object.keys(translationData).length} keys to cache key: ${cacheKey}. Redis client exists: ${!!redis}`);
                 try {
                     const dataToCache = JSON.stringify(translationData);
                     console.log(`[${receivedTargetLanguage}] Stringified data successfully (length: ${dataToCache.length}). Attempting redis.set...`);
                     await redis.set(cacheKey, dataToCache, { ex: CACHE_TTL_SECONDS });
                     console.log(`[${receivedTargetLanguage}] Successfully cached.`);
                 } catch (redisSetError) {
                     console.error(`[${receivedTargetLanguage}] Redis SET error caught for key ${cacheKey}:`, redisSetError);
                      if (redisSetError instanceof Error) {
                        console.error(`[${receivedTargetLanguage}] Redis SET Error Name: ${redisSetError.name}`);
                        console.error(`[${receivedTargetLanguage}] Redis SET Error Message: ${redisSetError.message}`);
                      }
                 }
             } else {
                  console.warn(`[${receivedTargetLanguage}] Cache Write SKIPPED. Redis valid: ${!!redis}, translationData valid: ${!!translationData}, Key count: ${translationData ? Object.keys(translationData).length : 'N/A'}`);
             }

             responseHeaders.set('X-Translation-Source', 'API');
             responseHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`);
             return NextResponse.json(translationData ?? enTranslations, { headers: responseHeaders });

        } catch (translateError) {
            console.error(`[${receivedTargetLanguage}] Error during translation/processing caught:`, translateError);
            responseHeaders.set('X-Translation-Source', 'Fallback (API/Processing Error)');
            return NextResponse.json(enTranslations, { status: 502, headers: responseHeaders });
        }

    } catch (error) {
        console.error(`[${receivedTargetLanguage ?? 'unknown'}] API Route general processing error caught:`, error);
        const headers = new Headers({'X-Translation-Cache': 'ERROR'});
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400, headers });
        }
        headers.set('X-Translation-Source', 'Fallback (Internal Error)');
        return NextResponse.json(enTranslations, { status: 500, headers });
    }
}

export async function GET() {
  return NextResponse.json({ message: 'Dynamic Translation (Google Cloud + Redis Cache) API route active. Use POST.' });
}