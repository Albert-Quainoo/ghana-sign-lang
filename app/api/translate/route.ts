// --- START OF FILE app/api/translate/route.ts ---
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// --- Upstash Redis Configuration ---
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error("CRITICAL: Upstash Redis environment variables missing.");
}
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});
// --- End Upstash Configuration ---

// --- Import base English translations for fallback ---
import enTranslations from '../../../locales/en.json'; 

export async function POST(request: NextRequest) {
    // Check Redis config
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.error("Redis client not configured properly in this instance.");
        return NextResponse.json(enTranslations, { status: 500, headers: {'X-Translation-Source': 'Fallback (Redis Config Error)'} });
    }

    let body;
    try {
        body = await request.json();
        const { targetLanguage } = body;

        // Basic validation
        if (!targetLanguage) {
            return NextResponse.json({ error: 'Invalid request body: targetLanguage missing' }, { status: 400 });
        }
        const supportedLanguages = ['en', 'fr', 'es', 'ar', 'tw'];
        if (!supportedLanguages.includes(targetLanguage)) {
             return NextResponse.json({ error: `Unsupported target language: ${targetLanguage}` }, { status: 400 });
        }

        if (targetLanguage === 'en') {
            return NextResponse.json(enTranslations, { headers: {'X-Translation-Source': 'Direct (English)'} });
        }
        if (targetLanguage === 'tw') {
            console.warn("Returning English fallback for Twi request.");
            return NextResponse.json(enTranslations, { headers: {'X-Translation-Source': 'Fallback (Twi)'} });
        }

        const cacheKey = `translations:${targetLanguage}`;
        let translationData: Record<string, string> | null = null;
        let cacheStatus: 'HIT' | 'MISS' | 'ERROR' = 'MISS';

        try {
            console.log(`Checking Upstash cache for key: ${cacheKey}`);
            const cachedString = await redis.get<string>(cacheKey);

            if (cachedString) {
                try {
                    translationData = JSON.parse(cachedString); // Parse JSON from Redis
                    if (typeof translationData === 'object' && translationData !== null) {
                        console.log(`Returning cached Upstash result for ${targetLanguage}`);
                        cacheStatus = 'HIT';
                    } else {
                         console.error(`Invalid JSON structure in cache for ${cacheKey}.`);
                         translationData = null; 
                         cacheStatus = 'MISS';
                    }
                } catch (parseError) {
                     console.error(`Failed to parse cached JSON for ${cacheKey}:`, parseError);
                     translationData = null;
                     cacheStatus = 'MISS';
                }
            } else {
                 console.warn(`Cache MISS for ${targetLanguage} (Key: ${cacheKey}). Returning English fallback.`);
                 cacheStatus = 'MISS';
            }
        } catch (redisError) {
             console.error(`Upstash Redis get error for key ${cacheKey}:`, redisError);
             cacheStatus = 'ERROR';
      
        }
        // --- End Cache Check ---

        // --- Determine Response ---
        const responseData = translationData ?? enTranslations; 
        const responseStatus = translationData ? 200 : 503; 
        const responseHeaders = new Headers();
        if (cacheStatus === 'HIT') {
             responseHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache hit longer
        } else {
             responseHeaders.set('Cache-Control', 'public, max-age=60, s-maxage=60'); // Cache miss/error shorter
        }
        responseHeaders.set('X-Translation-Cache', cacheStatus);

        return NextResponse.json(responseData, { status: responseStatus, headers: responseHeaders });

    } catch (error) {
        console.error('API Route general error:', error);
         if (error instanceof SyntaxError) { return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 }); }
        return NextResponse.json(enTranslations, { status: 500, headers: {'X-Translation-Cache': 'ERROR'} });
    }
}

export async function GET() {
  return NextResponse.json({ message: 'Static Translation (Redis Cache) API route active. Use POST.' });
}