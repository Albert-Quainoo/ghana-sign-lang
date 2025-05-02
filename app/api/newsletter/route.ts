import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/config'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';


function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = body.email?.trim();

        if (!email || typeof email !== 'string' || !isValidEmail(email)) {
            return NextResponse.json({ message: 'Invalid email address provided.' }, { status: 400 });
        }

        // Use email as document ID to prevent duplicates naturally
        const docRef = doc(db, "newsletter_subscriptions", email);

        await setDoc(docRef, {
            email: email,
            subscribedAt: serverTimestamp()
        }, { merge: true }); // Use merge: true in case they resubscribe

        console.log(`Newsletter subscription added for: ${email}`);
        return NextResponse.json({ message: 'Subscription successful!' }, { status: 201 }); // 201 Created

    } catch (error) {
        console.error("Newsletter subscription error:", error);
        if (error instanceof SyntaxError) {
             return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Could not subscribe. Please try again.' }, { status: 500 });
    }
}