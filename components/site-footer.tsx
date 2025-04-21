"use client"

import Link from "next/link";
import { Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { useState } from "react";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><title>Facebook</title><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> );
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><title>Twitter</title><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg> );
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} role="img" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><title>Instagram</title><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg> );

const fallbacks = {
    brandName: "Lending A Helping Ear",
    description: "Making Ghanaian Sign Language accessible to everyone through interactive online learning.",
    learn: "Learn",
    lessons: "Lessons",
    practice: "Practice",
    dictionary: "GSL Dictionary",
    resources: "Resources",
    family: "Family Orientation",
    community: "Community",
    careers: "Careers",
    tools: "Tools",
    translator: "Translator",
    company: "Company",
    about: "About Us",
    contact: "Contact",
    privacy: "Privacy Policy",
    connect: "Connect",
    rights: "All rights reserved."
};

export function SiteFooter({ className }: { className?: string }) {
  const { t, isLoading } = useLanguage();
  const [currentYear] = useState<number>(new Date().getFullYear());

  return (
    <footer className={cn("border-t border-border/40 bg-background", className)}>
      <div className="container flex flex-col gap-6 py-8 md:flex-row md:gap-8 md:py-10 px-4 md:px-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-3 md:w-1/3">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Headphones className="h-6 w-6 text-pink-500" />
            <span className="font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent" suppressHydrationWarning>
              {isLoading ? fallbacks.brandName : t("nav.brand") ?? fallbacks.brandName}
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
             {isLoading ? fallbacks.description : <span suppressHydrationWarning>{t("footer.description") ?? fallbacks.description}</span>}
           </p>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
           <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{isLoading ? fallbacks.learn : <span suppressHydrationWarning>{t("footer.learn") ?? fallbacks.learn}</span>}</h3>
              <ul className="space-y-2">
                <li><Link href="/learn?tab=lessons#lessons" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{isLoading ? fallbacks.lessons : <span suppressHydrationWarning>{t("footer.lessons") ?? fallbacks.lessons}</span>}</Link></li>
                <li><Link href="/learn?tab=practice#practice" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{isLoading ? fallbacks.practice : <span suppressHydrationWarning>{t("footer.practice") ?? fallbacks.practice}</span>}</Link></li>
                <li><Link href="/learn?tab=dictionary#dictionary" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{isLoading ? fallbacks.dictionary : <span suppressHydrationWarning>{t("footer.dictionary") ?? fallbacks.dictionary}</span>}</Link></li>
              </ul>
            </div>
           <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{isLoading ? fallbacks.resources : <span suppressHydrationWarning>{t("footer.resources") ?? fallbacks.resources}</span>}</h3>
              <ul className="space-y-2">
                <li><Link href="/family-orientation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{isLoading ? fallbacks.family : <span suppressHydrationWarning>{t("footer.family") ?? fallbacks.family}</span>}</Link></li>
                <li><Link href="/message-board" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{isLoading ? fallbacks.community : <span suppressHydrationWarning>{t("footer.community") ?? fallbacks.community}</span>}</Link></li>
                <li><Link href="/careers-scholarships" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{isLoading ? fallbacks.careers : <span suppressHydrationWarning>{t("footer.careers") ?? fallbacks.careers}</span>}</Link></li>
              </ul>
            </div>
           <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{isLoading ? fallbacks.tools : <span suppressHydrationWarning>{t("footer.tools") ?? fallbacks.tools}</span>}</h3>
              <ul className="space-y-2">
                <li><Link href="/translator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{isLoading ? fallbacks.translator : <span suppressHydrationWarning>{t("footer.translator") ?? fallbacks.translator}</span>}</Link></li>
              </ul>
            </div>
           <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{isLoading ? fallbacks.company : <span suppressHydrationWarning>{t("footer.company") ?? fallbacks.company}</span>}</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{isLoading ? fallbacks.about : <span suppressHydrationWarning>{t("footer.about") ?? fallbacks.about}</span>}</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{isLoading ? fallbacks.contact : <span suppressHydrationWarning>{t("footer.contact") ?? fallbacks.contact}</span>}</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{isLoading ? fallbacks.privacy : <span suppressHydrationWarning>{t("footer.privacy") ?? fallbacks.privacy}</span>}</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
               <h3 className="text-sm font-semibold text-foreground">{isLoading ? fallbacks.connect : <span suppressHydrationWarning>{t("footer.connect") ?? fallbacks.connect}</span>}</h3>
               <div className="flex gap-3">
                 <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-foreground"><FacebookIcon className="h-5 w-5" /></Link>
                 <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground"><TwitterIcon className="h-5 w-5" /></Link>
                 <Link href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground"><InstagramIcon className="h-5 w-5" /></Link>
               </div>
             </div>
        </div>
      </div>

      <div className="border-t border-border/40 py-4">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row px-4 md:px-6 max-w-screen-2xl mx-auto">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Lending A Helping Ear. {isLoading ? fallbacks.rights : <span suppressHydrationWarning>{t("footer.rights") ?? fallbacks.rights}</span>}
          </p>
        </div>
      </div>
    </footer>
  )
}