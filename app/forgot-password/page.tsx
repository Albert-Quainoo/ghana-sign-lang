"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/language-context';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/config'; 
import { LoadingSpinner } from '@/components/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from 'lucide-react'; 

const fallbacks = {
  title: "Forgot Password",
  subtitle: "Enter your email to receive reset instructions",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  resetButton: "Send Reset Link",
  backToSignIn: "Back to Sign In",
  successTitle: "Check Your Email",
  successMessage: "If an account exists for this email, a password reset link has been sent.",
  errorTitle: "Error",
  errorMessage: "Failed to send reset link. Please check the email address and try again.",
};

export default function ForgotPasswordPage() {
  const { t, isLoading: isLangLoading } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Clear previous message
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      // Always show success for security, even if email doesn't exist
      setMessage({ type: 'success', text: t('auth.forgotPassword.successMessage') ?? fallbacks.successMessage });
    } catch (error: unknown) {
      console.error("Password Reset Error:", error);
      // Show generic error
       setMessage({ type: 'error', text: t('auth.forgotPassword.errorMessage') ?? fallbacks.errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center content-bg-1 px-4 py-8">
      <div className="max-w-md w-full mx-auto p-8 space-y-8 card-standard glass-card-content subtle-shadow rounded-xl">
        <div className="text-center mb-6">
          <h2 className="mt-2 heading-2 gradient-text-heading">{isLangLoading ? fallbacks.title : <span suppressHydrationWarning>{t("auth.forgotPassword.title") ?? fallbacks.title}</span>}</h2>
          {!message?.text && ( // Hide subtitle if message is shown
            <p className="mt-2 text-sm text-muted-foreground text-enhanced">{isLangLoading ? fallbacks.subtitle : <span suppressHydrationWarning>{t("auth.forgotPassword.subtitle") ?? fallbacks.subtitle}</span>}</p>
          )}
        </div>

        {/* Display Success/Error Message */}
        {message && (
          <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-500 bg-red-50 text-red-800'}>
             {message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
             <AlertTitle>{message.type === 'success' ? (t('auth.forgotPassword.successTitle') ?? fallbacks.successTitle) : (t('auth.forgotPassword.errorTitle') ?? fallbacks.errorTitle)}</AlertTitle>
             <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {!message?.text || message?.type === 'error' ? ( // Only show form if no success message or on error
          <form className="mt-6 space-y-6" onSubmit={handlePasswordReset}>
            <div className="space-y-2 purple-accent pl-2">
              <Label htmlFor="email" className="block text-sm font-medium text-foreground purple-highlight">{isLangLoading ? fallbacks.emailLabel : <span suppressHydrationWarning>{t("auth.forgotPassword.emailLabel") ?? fallbacks.emailLabel}</span>}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={isLangLoading? fallbacks.emailPlaceholder : t('auth.emailPlaceholder') ?? fallbacks.emailPlaceholder}
                className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Button type="submit" className="w-full btn-gradient rounded-full" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" className="mr-2"/> : null}
                {isLoading ? 'Sending...' : (isLangLoading ? fallbacks.resetButton : <span suppressHydrationWarning>{t("auth.forgotPassword.button") ?? fallbacks.resetButton}</span>)}
              </Button>
            </div>
          </form>
        ) : null}


        <div className="mt-6 text-center">
          <Link href="/sign-in" className="text-sm font-medium text-purple-600 hover:text-purple-500">
             ← {isLangLoading ? fallbacks.backToSignIn : <span suppressHydrationWarning>{t("auth.forgotPassword.backToSignIn") ?? fallbacks.backToSignIn}</span>}
          </Link>
        </div>
      </div>
    </div>
  );
}