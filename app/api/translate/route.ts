import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// --- Upstash Redis Configuration ---
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
    console.error("CRITICAL: Upstash Redis environment variables UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN are missing.");
}
const redis = new Redis({
  url: redisUrl || '',
  token: redisToken || '',
});
// --- End Upstash Configuration ---

// --- Import base English translations for fallback ---
import enTranslations from '../../../locales/en.json'; 

export async function POST(request: NextRequest) {
     if (!redisUrl || !redisToken) {
        console.error("Redis environment variables not available in this function execution. Returning fallback.");
        return NextResponse.json(enTranslations, { status: 503, headers: {'X-Translation-Cache': 'DISABLED'} });
    }

    // --- Define Cache TTL INSIDE the handler ---
    const CACHE_TTL_SECONDS = 6 * 3600; // 6 hours TTL
    // ---

    let body;
    try {
        body = await request.json();
        const { targetLanguage } = body;
        const sourceLanguage = 'en';

        // Validate input
        if (!targetLanguage) { return NextResponse.json({ error: 'Invalid request body: targetLanguage missing' }, { status: 400 }); }
        const supportedLanguages = ['en', 'fr', 'es', 'ar', 'tw'];
        if (!supportedLanguages.includes(targetLanguage)) { return NextResponse.json({ error: `Unsupported target language: ${targetLanguage}` }, { status: 400 }); }

        if (targetLanguage === 'en') { return NextResponse.json(enTranslations, { headers: {'X-Translation-Source': 'Direct (English)'} }); }
        if (targetLanguage === 'tw') { console.warn("Returning English fallback for Twi request."); return NextResponse.json(enTranslations, { headers: {'X-Translation-Source': 'Fallback (Twi)'} }); }

        // Check Upstash Cache
        const cacheKey = `translations:${targetLanguage}`;
        let translationData: Record<string, string> | null = null;
        let cacheStatus: 'HIT' | 'MISS' | 'ERROR' = 'MISS';

        try {
            console.log(`Checking Upstash cache for key: ${cacheKey}`);
            const cachedData = await redis.get<unknown>(cacheKey);

            if (cachedData !== null && cachedData !== undefined) {
                if (typeof cachedData === 'string') {
                    console.log(`Parsing string found in cache for ${targetLanguage}...`);
                    try {
                        translationData = JSON.parse(cachedData);
                        if (typeof translationData === 'object' && translationData !== null) {
                             cacheStatus = 'HIT';
                        } else {
                             console.error(`Parsed data for ${cacheKey} is not a valid object.`);
                             translationData = null;
                             cacheStatus = 'ERROR';
                        }
                    } catch (parseError) {
                        console.error(`Failed to parse cached JSON string for ${cacheKey}:`, parseError);
                        cacheStatus = 'ERROR';
                        translationData = null;
                    }
                } else if (typeof cachedData === 'object') {
                     console.warn(`Data from cache for ${cacheKey} was already an object. Using directly.`);
                     if (cachedData !== null && Object.keys(cachedData).length > 0) {
                        translationData = cachedData as Record<string, string>;
                        cacheStatus = 'HIT';
                     } else {
                         console.error(`Cached object for ${cacheKey} is null or empty.`);
                         translationData = null;
                         cacheStatus = 'ERROR';
                     }
                } else {
                    console.error(`Unexpected data type found in cache for ${cacheKey}: ${typeof cachedData}`);
                    cacheStatus = 'ERROR';
                    translationData = null;
                }
            } else {
                 console.warn(`Cache MISS for ${targetLanguage} (Key: ${cacheKey}). Returning English fallback.`);
                 cacheStatus = 'MISS';
            }
        } catch (redisError) {
             console.error(`Upstash Redis get error for key ${cacheKey}:`, redisError);
             cacheStatus = 'ERROR';
        }
        const responseHeaders = new Headers();
        responseHeaders.set('X-Translation-Cache', cacheStatus);

        if (cacheStatus === 'HIT' && translationData) {
             console.log(`Returning valid cached result for ${targetLanguage}`);
             responseHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`);
             return NextResponse.json(translationData, { headers: responseHeaders });
        } else {
             console.log(`Cache status is ${cacheStatus}. Returning English fallback for ${targetLanguage}.`);
             responseHeaders.set('Cache-Control', 'public, max-age=60, s-maxage=60');
             const status = (cacheStatus === 'ERROR') ? 503 : 200;
             return NextResponse.json(enTranslations, { headers: responseHeaders, status: status });
        }

    } catch (error) {
        console.error('API Route general error:', error);
         const headers = new Headers({'X-Translation-Cache': 'ERROR'});
         if (error instanceof SyntaxError) { return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400, headers }); }
        return NextResponse.json(enTranslations, { status: 500, headers });
    }
}

export async function GET() {
  return NextResponse.json({ message: 'Static Translation (Redis Cache) API route active. Use POST.' });
}