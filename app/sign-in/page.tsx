"use client"

import Link from "next/link";
import { useState } from "react"; 
import { useRouter } from "next/navigation"; // Use navigation for App Router
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider 
} from "firebase/auth";
import { auth } from "@/lib/config"; 

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" {...props}> <title>Google</title> <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path> <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path> <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path> <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path> <path fill="none" d="M0 0h48v48H0z"></path> </svg> );
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}> <title>Facebook</title> <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="currentColor"/> </svg> );

const fallbacks = {
    title: "Sign In",
    subtitle: "Welcome back! Sign in to your account",
    email: "Email",
    password: "Password",
    emailPlaceholder: "you@example.com",
    forgotPassword: "Forgot password?",
    signInButton: "Sign In",
    orContinueWith: "Or continue with",
    noAccount: "Don't have an account?",
    signupLink: "Sign Up",
    errorMessage: "Invalid email or password.", // Generic error
    googleError: "Could not sign in with Google.",
    facebookError: "Could not sign in with Facebook.",
};

export default function SignInPage() {
  const { t, isLoading: isLangLoading } = useLanguage(); // Renamed to avoid conflict
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission

  // --- Email/Password Sign In Handler ---
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully');
      router.push('/learn'); // Redirect to learn page or dashboard
    } catch (err: unknown) {
      console.error("Email Sign-In Error:", err);
      // Provide a generic error message for security
      setError(t('auth.signin.errorMessage') ?? fallbacks.errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Google Sign In Handler ---
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log('Google Sign-In Success');
      router.push('/learn'); // Redirect
    } catch (err: unknown) {
      console.error("Google Sign-In Error:", err);
      setError(t('auth.signin.googleError') ?? fallbacks.googleError);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Facebook Sign In Handler (Optional) ---
  const handleFacebookSignIn = async () => {
      setError(null);
      setIsLoading(true);
      const provider = new FacebookAuthProvider(); 
      try {
          await signInWithPopup(auth, provider);
          console.log('Facebook Sign-In Success');
          router.push('/learn'); // Redirect
      } catch (err: unknown) {
          console.error("Facebook Sign-In Error:", err);
          setError(t('auth.signin.facebookError') ?? fallbacks.facebookError);
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center content-bg-1 px-4 py-8">
      <div className="max-w-md w-full mx-auto p-8 space-y-8 card-standard glass-card-content subtle-shadow rounded-xl">
        <div className="text-center mb-6 pb-4 border-b border-purple-200/30">
          <h2 className="mt-2 heading-2 gradient-text-heading">{isLangLoading ? fallbacks.title : <span suppressHydrationWarning>{t("auth.signin.title") ?? fallbacks.title}</span>}</h2>
          <p className="mt-2 text-sm text-muted-foreground text-enhanced">{isLangLoading ? fallbacks.subtitle : <span suppressHydrationWarning>{t("auth.signin.subtitle") ?? fallbacks.subtitle}</span>}</p>
        </div>

        {/* Display Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleEmailSignIn}>
          <div className="space-y-5">
            <div className="purple-accent pl-2">
              <Label htmlFor="email" className="block text-sm font-medium text-foreground purple-highlight">{isLangLoading ? fallbacks.email : <span suppressHydrationWarning>{t("auth.signin.email") ?? fallbacks.email}</span>}</Label>
              <div className="mt-1">
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
            </div>
            <div className="purple-accent pl-2">
              <Label htmlFor="password" className="block text-sm font-medium text-foreground purple-highlight">{isLangLoading ? fallbacks.password : <span suppressHydrationWarning>{t("auth.signin.password") ?? fallbacks.password}</span>}</Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="********"
                  className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
               </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div /> 
            <Link href="/forgot-password" className="text-sm font-medium text-purple-600 hover:text-purple-500">
              {isLangLoading ? fallbacks.forgotPassword : <span suppressHydrationWarning>{t("auth.signin.forgotPassword") ?? fallbacks.forgotPassword}</span>}
            </Link>
          </div>
          <div>
            <Button type="submit" className="w-full btn-gradient rounded-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : (isLangLoading ? fallbacks.signInButton : <span suppressHydrationWarning>{t("auth.signin.button") ?? fallbacks.signInButton}</span>)}
            </Button>
          </div>
        </form>
        <div className="mt-8">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-purple-200/30"></div>
            <div className="px-4 text-sm text-muted-foreground text-enhanced">{isLangLoading ? fallbacks.orContinueWith : <span suppressHydrationWarning>{t("auth.signin.orContinueWith") ?? fallbacks.orContinueWith}</span>}</div>
            <div className="flex-grow border-t border-purple-200/30"></div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button type="button" className="btn-gradient rounded-full" onClick={handleGoogleSignIn} disabled={isLoading}>
             <GoogleIcon className="h-4 w-4" /><span className="ml-2.5">Google</span>
          </Button>
          <Button type="button" className="btn-gradient rounded-full" onClick={handleFacebookSignIn} disabled={isLoading}>
             <FacebookIcon className="h-4 w-4" /><span className="ml-2.5">Facebook</span>
           </Button>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground text-enhanced">
           {isLangLoading ? fallbacks.noAccount : <span suppressHydrationWarning>{t("auth.signin.noAccount") ?? fallbacks.noAccount}</span>}
          <Link href="/sign-up" className="font-medium text-purple-600 hover:text-purple-500 ml-1">{isLangLoading ? fallbacks.signupLink : <span suppressHydrationWarning>{t("auth.signin.signup") ?? fallbacks.signupLink}</span>}</Link>
        </p>
      </div>
    </div>
  )
}