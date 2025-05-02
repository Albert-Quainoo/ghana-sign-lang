"use client"

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  getAdditionalUserInfo,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/config";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react"; // Import Check for success alert
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" {...props}> <title>Google</title> <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path> <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path> <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path> <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path> <path fill="none" d="M0 0h48v48H0z"></path> </svg> );
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}> <title>Facebook</title> <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="currentColor"/> </svg> );

const fallbacks = {
    title: "Sign Up",
    subtitle: "Create your account to get started",
    name: "Full Name",
    namePlaceholder: "John Doe",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    emailPlaceholder: "you@example.com",
    signupButton: "Sign Up",
    orContinueWith: "Or continue with",
    haveAccount: "Already have an account?",
    signinLink: "Sign In",
    passwordMismatch: "Passwords do not match.",
    passwordLengthError: "Password must be at least 6 characters long.",
    emailExistsError: "An account already exists with this email address.",
    nameRequiredError: "Please enter your name.",
    signupError: "Failed to create account. Please try again.",
    googleError: "Could not sign up with Google.",
    facebookError: "Could not sign up with Facebook.",
    verificationSent: "Verification email sent! Please check your inbox.",
};

export default function SignUpPage() {
  const { t, isLoading: isLangLoading } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Save User Data to Firestore ---
  const saveUserData = async (userId: string, userEmail: string | null, userName: string | null, photoUrl?: string | null) => { // Added photoUrl
     if (!userId || !userEmail) return;
     try {
       const userRef = doc(db, "users", userId);
       await setDoc(userRef, {
         uid: userId,
         email: userEmail,
         name: userName || '',
         createdAt: serverTimestamp(),
         role: 'user',
         photoURL: photoUrl || null, // Save photoURL from social provider if available
       }, { merge: true });
       console.log("User data saved/merged in Firestore for:", userId);
     } catch (err) {
       console.error("Error saving user data to Firestore:", err);
     }
   };

  // --- Email/Password Sign Up ---
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) { setError(t('auth.signup.nameRequiredError') ?? fallbacks.nameRequiredError); return; }
    if (password !== confirmPassword) { setError(t('auth.signup.passwordMismatch') ?? fallbacks.passwordMismatch); return; }
    if (password.length < 6) { setError(t('auth.signup.passwordLengthError') ?? fallbacks.passwordLengthError); return; }

    setIsLoading(true);
    try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
            setError(t('auth.signup.emailExistsError') ?? fallbacks.emailExistsError);
            setIsLoading(false);
            return;
        }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      console.log('User signed up:', newUser);

      // Update Auth profile name immediately
      await updateProfile(newUser, { displayName: name.trim() });
      console.log("Auth profile display name updated.");

      // Save data to Firestore
      await saveUserData(newUser.uid, newUser.email, name.trim());

      // Send verification email
      await sendEmailVerification(newUser);
      console.log('Verification email sent.');
      setSuccessMessage(t('auth.signup.verificationSent') ?? fallbacks.verificationSent);

      setTimeout(() => router.push('/learn'), 3000); // Redirect after 3s

    } catch (err: unknown) {
      console.error("Email Sign-Up Error:", err);
      setError(t('auth.signup.signupError') ?? fallbacks.signupError);
      setIsLoading(false); // Ensure loading stops on error
    }
   
  };

  // --- Social Sign In/Up ---
  const handleSocialSignIn = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
      setError(null);
      setSuccessMessage(null);
      setIsLoading(true);
      try {
          const result = await signInWithPopup(auth, provider);
          const additionalInfo = getAdditionalUserInfo(result);
          console.log('Social Sign-In/Up Success:', result.user);

          if (additionalInfo?.isNewUser) {
              console.log("New user via social sign-in.");
              await saveUserData(result.user.uid, result.user.email, result.user.displayName, result.user.photoURL); // Pass photoURL
          }
          router.push('/learn');
      } catch (err: unknown) {
          console.error("Social Sign-In Error:", err);
          if (
            typeof err === "object" &&
            err !== null &&
            "code" in err &&
            (err as { code?: string }).code === 'auth/account-exists-with-different-credential'
          ) {
               setError(`An account already exists with this email using a different sign-in method. Try signing in with that method.`);
          } else {
               const providerName = provider.providerId.includes('google') ? 'Google' : 'Facebook';
               setError(`Could not sign up with ${providerName}. Please try again.`);
          }
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center content-bg-1 px-4 py-8">
      <div className="max-w-md w-full mx-auto p-8 space-y-6 card-standard glass-card-content subtle-shadow rounded-xl">
        <div className="text-center mb-6 pb-4 border-b border-purple-200/30">
          <h2 className="mt-2 heading-2 gradient-text-heading">{isLangLoading ? fallbacks.title : <span suppressHydrationWarning>{t("auth.signup.title") ?? fallbacks.title}</span>}</h2>
          <p className="mt-2 text-sm text-muted-foreground text-enhanced">{isLangLoading ? fallbacks.subtitle : <span suppressHydrationWarning>{t("auth.signup.subtitle") ?? fallbacks.subtitle}</span>}</p>
        </div>

        {/* Display Messages */}
        {error && ( <Alert variant="destructive" className="text-sm"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Signup Failed</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> )}
        {successMessage && !error && ( <Alert variant="default" className="text-sm border-green-500 bg-green-50 text-green-800"> <Check className="h-4 w-4 text-green-600" /> <AlertTitle>Success</AlertTitle> <AlertDescription>{successMessage}</AlertDescription> </Alert> )}

        <form className="space-y-5" onSubmit={handleEmailSignUp}>
           {/* Input Fields */}
           <div className="purple-accent pl-2"> <Label htmlFor="name" className="block text-sm font-medium text-foreground purple-highlight">{isLangLoading ? fallbacks.name : <span suppressHydrationWarning>{t("auth.signup.name") ?? fallbacks.name}</span>}</Label> <div className="mt-1"><Input id="name" name="name" type="text" autoComplete="name" required placeholder={isLangLoading ? fallbacks.namePlaceholder : t('auth.namePlaceholder') ?? fallbacks.namePlaceholder} className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 rounded-md" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} /></div> </div>
           <div className="purple-accent pl-2"> <Label htmlFor="email" className="block text-sm font-medium text-foreground purple-highlight">{isLangLoading ? fallbacks.email : <span suppressHydrationWarning>{t("auth.signup.email") ?? fallbacks.email}</span>}</Label> <div className="mt-1"><Input id="email" name="email" type="email" autoComplete="email" required placeholder={isLangLoading ? fallbacks.emailPlaceholder : t('auth.emailPlaceholder') ?? fallbacks.emailPlaceholder} className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 rounded-md" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} /></div> </div>
           <div className="purple-accent pl-2"> <Label htmlFor="password" className="block text-sm font-medium text-foreground purple-highlight">{isLangLoading ? fallbacks.password : <span suppressHydrationWarning>{t("auth.signup.password") ?? fallbacks.password}</span>}</Label> <div className="mt-1"><Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="********" className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 rounded-md" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} /></div> </div>
           <div className="purple-accent pl-2"> <Label htmlFor="confirm-password" className="block text-sm font-medium text-foreground purple-highlight">{isLangLoading ? fallbacks.confirmPassword : <span suppressHydrationWarning>{t("auth.signup.confirmPassword") ?? fallbacks.confirmPassword}</span>}</Label> <div className="mt-1"><Input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required placeholder="********" className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 rounded-md" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} /></div> </div>
           {/* Submit Button */}
           <div className="pt-2"> <Button type="submit" className="w-full btn-gradient rounded-full" disabled={isLoading}> {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null} {isLoading ? 'Signing Up...' : (isLangLoading ? fallbacks.signupButton : <span suppressHydrationWarning>{t("auth.signup.button") ?? fallbacks.signupButton}</span>)} </Button> </div>
        </form>

        {/* Social Sign Up Separator and Buttons */}
        <div className="mt-6"> <div className="relative flex items-center"> <div className="flex-grow border-t border-purple-200/30"></div> <div className="px-4 text-sm text-muted-foreground text-enhanced">{isLangLoading ? fallbacks.orContinueWith : <span suppressHydrationWarning>{t("auth.signin.orContinueWith") ?? fallbacks.orContinueWith}</span>}</div> <div className="flex-grow border-t border-purple-200/30"></div> </div> <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"> <Button type="button" className="btn-gradient rounded-full" onClick={() => handleSocialSignIn(new GoogleAuthProvider())} disabled={isLoading}> <GoogleIcon className="h-4 w-4" /><span className="ml-2.5">Google</span> </Button> <Button type="button" className="btn-gradient rounded-full" onClick={() => handleSocialSignIn(new FacebookAuthProvider())} disabled={isLoading}> <FacebookIcon className="h-4 w-4" /><span className="ml-2.5">Facebook</span> </Button> </div> </div>

        {/* Link to Sign In */}
        <p className="mt-6 text-center text-sm text-muted-foreground text-enhanced"> {isLangLoading ? fallbacks.haveAccount : <span suppressHydrationWarning>{t("auth.signup.haveAccount") ?? fallbacks.haveAccount}</span>} <Link href="/sign-in" className="font-medium text-purple-600 hover:text-purple-500 ml-1">{isLangLoading ? fallbacks.signinLink : <span suppressHydrationWarning>{t("auth.signup.signin") ?? fallbacks.signinLink}</span>}</Link> </p>
      </div>
    </div>
  )
}