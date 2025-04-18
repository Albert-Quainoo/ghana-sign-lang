"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"

// Simple SVG Icon Components
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" {...props}> <title>Google</title> <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path> <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path> <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path> <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path> <path fill="none" d="M0 0h48v48H0z"></path> </svg> )
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}> <title>Facebook</title> <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="currentColor"/> </svg> )

// Fallback Texts
const fallbacks = {
    title: "Sign In",
    subtitle: "Welcome back! Sign in to your account",
    email: "Email",
    password: "Password",
    emailPlaceholder: "you@example.com",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    signInButton: "Sign In",
    orContinueWith: "Or continue with",
    noAccount: "Don't have an account?",
    signup: "Sign Up"
};

export default function SignInPage() {
  const { t, isLoading } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center content-bg-1 px-4 py-8">
      <div className="max-w-md w-full mx-auto p-8 space-y-8 card-standard glass-card-content subtle-shadow rounded-xl">
        <div className="text-center mb-6 pb-4 border-b border-purple-200/30">
          <h2 className="mt-2 heading-2 gradient-text-heading">
             {isLoading ? fallbacks.title : <span suppressHydrationWarning>{t("auth.signin.title") ?? fallbacks.title}</span>}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-enhanced">
             {isLoading ? fallbacks.subtitle : <span suppressHydrationWarning>{t("auth.signin.subtitle") ?? fallbacks.subtitle}</span>}
          </p>
        </div>
        <form className="mt-6 space-y-6">
          <div className="space-y-5">
            <div className="purple-accent pl-2">
              <Label htmlFor="email" className="block text-sm font-medium text-foreground purple-highlight">
                 {isLoading ? fallbacks.email : <span suppressHydrationWarning>{t("auth.signin.email") ?? fallbacks.email}</span>}
              </Label>
              <div className="mt-1">
                <Input id="email" name="email" type="email" autoComplete="email" required placeholder={isLoading? fallbacks.emailPlaceholder : t('auth.emailPlaceholder') ?? fallbacks.emailPlaceholder} className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"/>
              </div>
            </div>
            <div className="purple-accent pl-2">
              <Label htmlFor="password" className="block text-sm font-medium text-foreground purple-highlight">
                 {isLoading ? fallbacks.password : <span suppressHydrationWarning>{t("auth.signin.password") ?? fallbacks.password}</span>}
              </Label>
              <div className="mt-1">
                <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="********" className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"/>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Input type="checkbox" id="remember-me" className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded cursor-pointer"/>
              <Label htmlFor="remember-me" className="ml-2 block text-sm text-foreground cursor-pointer">
                 {isLoading ? fallbacks.rememberMe : <span suppressHydrationWarning>{t("auth.signin.rememberMe") ?? fallbacks.rememberMe}</span>}
              </Label>
            </div>
            <Link href="/forgot-password" className="text-sm font-medium text-purple-600 hover:text-purple-500">
               {isLoading ? fallbacks.forgotPassword : <span suppressHydrationWarning>{t("auth.signin.forgotPassword") ?? fallbacks.forgotPassword}</span>}
            </Link>
          </div>
          <div>
            <Button type="submit" className="w-full btn-primary rounded-full">
              {isLoading ? fallbacks.signInButton : <span suppressHydrationWarning>{t("auth.signin.button") ?? fallbacks.signInButton}</span>}
            </Button>
          </div>
        </form>
        <div className="mt-8">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-purple-200/30"></div>
            <div className="px-4 text-sm text-muted-foreground text-enhanced">
               {isLoading ? fallbacks.orContinueWith : <span suppressHydrationWarning>{t("auth.signin.orContinueWith") ?? fallbacks.orContinueWith}</span>}
            </div>
            <div className="flex-grow border-t border-purple-200/30"></div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button type="button" className="w-full btn-gradient rounded-full"><GoogleIcon className="h-4 w-4" /><span className="ml-2.5">Google</span></Button>
          <Button type="button" className="w-full btn-gradient rounded-full"><FacebookIcon className="h-4 w-4" /><span className="ml-2.5">Facebook</span></Button>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground text-enhanced">
           {isLoading ? fallbacks.noAccount : <span suppressHydrationWarning>{t("auth.signin.noAccount") ?? fallbacks.noAccount}</span>}
          <Link href="/sign-up" className="font-medium text-purple-600 hover:text-purple-500 ml-1">
            {isLoading ? fallbacks.signup : <span suppressHydrationWarning>{t("auth.signin.signup") ?? fallbacks.signup}</span>}
          </Link>
        </p>
      </div>
    </div>
  )
}