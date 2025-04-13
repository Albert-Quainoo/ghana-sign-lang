"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"

export type Language = "en" | "fr" | "es" | "tw" | "ar"
type TranslationData = Record<string, string>;

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  isLoading: true,
})

// Adjust path if needed & ENSURE THIS FILE IS COMPLETE
import enTranslations from '../locales/en.json';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [language, setLanguageState] = useState<Language>("en")
  const [translations, setTranslations] = useState<TranslationData>(enTranslations)

  // Function to load translations - checks cache first
  const loadTranslations = useCallback(async (lang: Language) => {
    if (lang === 'en') {
        setTranslations(enTranslations);
        setIsLoading(false);
        return;
    }

    const cacheKey = `translations_${lang}`;
    if (typeof window !== 'undefined') {
        try {
            const cachedData = sessionStorage.getItem(cacheKey);
            if (cachedData) {
                console.log(`Using cached translations for ${lang}`);
                setTranslations(JSON.parse(cachedData));
                setIsLoading(false);
                return;
            }
        } catch (e) { console.error("Error reading from sessionStorage:", e); }
    }

    console.log(`Fetching translations for ${lang} via API route...`);
    setIsLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
             texts: enTranslations,
             targetLanguage: lang
         }),
      });

      if (!response.ok) {
         const errorBody = await response.text();
         console.error(`API route /api/translate failed for lang "${lang}" with status ${response.status}: ${errorBody}`);
         throw new Error(`API route request failed: ${response.status}`);
      }
      const data: TranslationData = await response.json();
      if (typeof data !== 'object' || data === null || Object.keys(data).length === 0) {
          console.error(`Received invalid data from API route for lang "${lang}". Falling back.`);
          throw new Error('Invalid translation data received');
      }
      setTranslations(data);

       if (typeof window !== 'undefined') {
            try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); console.log(`Cached translations for ${lang}`); }
            catch (e) { console.error("Error writing to sessionStorage:", e); }
       }
    } catch (error) {
      console.error(`Failed to load/parse translations for language "${lang}" from API route:`, error);
       if (language !== 'en') { setTranslations(enTranslations); }
    } finally { setIsLoading(false); }
  }, [language]); // Depend on language to potentially re-fetch if cache fails differently per lang

  // --- Effects (Initial Load, Language Change Side Effects, Storage Sync - same as before) ---
  useEffect(() => { // Initial Load
    let selectedLang: Language = "en";
    const storedLang = localStorage.getItem("preferredLanguage") as Language;
    if (storedLang && ["en", "fr", "es", "tw", "ar"].includes(storedLang)) { selectedLang = storedLang; }
    else { try { const browserLang = navigator.language.split("-")[0]; if (browserLang === "fr") selectedLang = "fr"; else if (browserLang === "es") selectedLang = "es"; else if (browserLang === "ar") selectedLang = "ar"; else if (browserLang === 'ak' || browserLang === 'tw') selectedLang = "tw"; } catch (e) { console.error("Browser language detection failed:", e); } }
    setLanguageState(selectedLang);
    // Let the language change effect handle the loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { // Side Effects on Language Change
       if (language) { // Run when language state is set (including initially)
            localStorage.setItem("preferredLanguage", language);
            document.documentElement.lang = language;
            document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
            console.log(`Language changed to ${language}, attempting loadTranslations.`); // Debug log
            loadTranslations(language); // Trigger load (will check cache first)
       }
   }, [language, loadTranslations]); // Rerun when language changes

  useEffect(() => { // Storage Sync
    const handleStorageChange = (e: StorageEvent) => { if (e.key === "preferredLanguage" && e.newValue && ["en", "fr", "es", "tw", "ar"].includes(e.newValue as Language)) { const newLang = e.newValue as Language; if (newLang !== language) { setLanguageState(newLang); } } }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [language]);

  // t function (No changes needed here)
  const t = (key: string): string => { if (isLoading && typeof window !== 'undefined') { const englishValueDuringLoad = (enTranslations as Record<string, string>)[key]; return englishValueDuringLoad ?? key; } const currentLangData = translations as Record<string, string>; if (currentLangData && Object.prototype.hasOwnProperty.call(currentLangData, key)) { return currentLangData[key]; } const englishFallbackData = enTranslations as Record<string, string>; if (englishFallbackData && Object.prototype.hasOwnProperty.call(englishFallbackData, key)) { if (process.env.NODE_ENV === 'development') { console.warn(`Translation key "${key}" not found for language "${language}". Falling back to English.`); } return englishFallbackData[key]; } if (process.env.NODE_ENV === 'development') { console.warn(`Translation key "${key}" not found for language "${language}" or in English fallbacks.`); } return key; }

  const contextValue = { language, setLanguage: setLanguageState, t, isLoading };

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

// Custom hook
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) { throw new Error("useLanguage must be used within a LanguageProvider") }
  return context
}
