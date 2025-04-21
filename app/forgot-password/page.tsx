"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";

const fallbacks = {
  title: "Forgot Password",
  subtitle: "Enter your email and we'll send you a reset link.",
  email: "Email",
  emailPlaceholder: "you@example.com",
  sendButton: "Reset Password",
  backToSignIn: "Back to Sign In",
};

export default function ForgotPasswordPage() {
  const { t, isLoading } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center content-bg-1 px-4 py-8">
      <div className="max-w-md w-full mx-auto p-8 space-y-8 card-standard glass-card-content subtle-shadow rounded-xl">
        <div className="text-center mb-6 pb-4 border-b border-purple-200/30">
          <h2 className="mt-2 heading-2 gradient-text-heading">
            {isLoading ? fallbacks.title : <span suppressHydrationWarning>{t("auth.forgotPassword.title") ?? fallbacks.title}</span>}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-enhanced">
            {isLoading ? fallbacks.subtitle : <span suppressHydrationWarning>{t("auth.forgotPassword.subtitle") ?? fallbacks.subtitle}</span>}
          </p>
        </div>
        <form className="mt-6 space-y-6">
          <div className="space-y-5">
            <div className="purple-accent pl-2">
              <Label htmlFor="email" className="block text-sm font-medium text-foreground purple-highlight">
                {isLoading ? fallbacks.email : <span suppressHydrationWarning>{t("auth.forgotPassword.email") ?? fallbacks.email}</span>}
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={isLoading ? fallbacks.emailPlaceholder : t("auth.forgotPassword.emailPlaceholder") ?? fallbacks.emailPlaceholder}
                  className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
                />
              </div>
            </div>
          </div>
          <div>
            <Button type="submit" className="w-full btn-gradient rounded-full">
              {isLoading ? fallbacks.sendButton : <span suppressHydrationWarning>{t("auth.forgotPassword.sendButton") ?? fallbacks.sendButton}</span>}
            </Button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-muted-foreground text-enhanced">
          <Link href="/sign-in" className="font-medium text-purple-600 hover:text-purple-500">
            {isLoading ? fallbacks.backToSignIn : <span suppressHydrationWarning>{t("auth.forgotPassword.backToSignIn") ?? fallbacks.backToSignIn}</span>}
          </Link>
        </p>
      </div>
    </div>
  );
}
