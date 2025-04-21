import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollToTop } from "@/components/scroll-to-top";
import { LanguageProvider } from "@/contexts/language-context";
import { SiteHeader } from "@/components/site-header"; 
import { SiteFooter } from "@/components/site-footer"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Signed-in", // Updated site name
    template: "%s | Signed-in",
  },
  description: "Learn Ghanaian Sign Language online through interactive lessons and practice exercises.",
  openGraph: {
    title: "Signed-in",
    description: "Learn Ghanaian Sign Language online",
    siteName: "Signed-in",
    // Add images, url etc.
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Responsive viewport meta tag for scaling */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Grammarly Hydration Fix Script */}
        <Script id="hydration-fix" strategy="beforeInteractive">
          {`
            (function() {
              function removeGrammarlyAttributes() {
                if (typeof document === 'undefined') return;
                document.querySelectorAll('[data-gr-ext-installed],[data-new-gr-c-s-check-loaded],[grammarly-shadow-root]').forEach(el => {
                  el.removeAttribute('data-gr-ext-installed');
                  el.removeAttribute('data-new-gr-c-s-check-loaded');
                  if(el.shadowRoot && el.tagName.toLowerCase() === 'grammarly-shadow-root') {
                    el.remove();
                  }
                });
              }
              removeGrammarlyAttributes();
              if (typeof MutationObserver !== 'undefined') {
                var observer = new MutationObserver(removeGrammarlyAttributes);
                var observerConfig = { attributes: true, childList: true, subtree: true, attributeFilter: ['data-gr-ext-installed', 'data-new-gr-c-s-check-loaded']};
                // Observe documentElement instead of body initially, as body might not exist yet
                 if(document.documentElement) {
                     observer.observe(document.documentElement, observerConfig);
                 }
              }
            })();
          `}
        </Script>
      </head>
      <body
        className={`${inter.className} flex flex-col min-h-screen w-full noise-bg`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* LanguageProvider wraps the main content */}
          <LanguageProvider>
            <SiteHeader className="glass-card" /> 
            <main className="flex-1">
              {children}
            </main>
            <ScrollToTop /> {/* Component for handling scroll */}
            <SiteFooter /> {/* Removed potentially conflicting class */}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}