import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ScrollToTop } from "@/components/scroll-to-top"
import { LanguageProvider } from "@/contexts/language-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Suspense } from "react"
import Loading from "./loading"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lending a Helping Ear - Learn Ghanaian Sign Language",
  description: "Learn Ghanaian Sign Language online through interactive lessons and practice exercises.",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="hydration-fix" strategy="beforeInteractive">
          {`
            (function() {
              function removeGrammarlyAttributes() {
                if (typeof document !== 'undefined') {
                  var elements = document.querySelectorAll('[data-gr-ext-installed], [data-new-gr-c-s-check-loaded]');
                  for (var i = 0; i < elements.length; i++) {
                    elements[i].removeAttribute('data-gr-ext-installed');
                    elements[i].removeAttribute('data-new-gr-c-s-check-loaded');
                  }
                }
              }
              
              // Run immediately
              removeGrammarlyAttributes();
              
              // Set up observer to run on DOM changes
              if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
                var observer = new MutationObserver(removeGrammarlyAttributes);
                if (document.body) {
                  observer.observe(document.body, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                    attributeFilter: ['data-gr-ext-installed', 'data-new-gr-c-s-check-loaded']
                  });
                }
              }
            })();
          `}
        </Script>
      </head>
      <body 
        className={`${inter.className} flex flex-col min-h-screen noise-bg`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            <SiteHeader className="glass-card" />
            <main className="flex-1">
              {children}
            </main>
            <ScrollToTop />
            <SiteFooter className="glass-card" />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
