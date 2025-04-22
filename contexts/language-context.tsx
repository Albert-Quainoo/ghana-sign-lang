"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from "react";

export type Language = "en" | "fr" | "es" | "tw" | "ar"
export type TranslationData = Record<string, string>;

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoading: boolean
  isLanguageAvailable: boolean // Indicates if API returned non-English data
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  isLoading: true, // Start true until initial determination
  isLanguageAvailable: true,
});

import enTranslations from '../locales/en.json';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<TranslationData>(enTranslations);
  const [isLoading, setIsLoading] = useState(true); // Manage loading state
  const [isLanguageAvailable, setIsLanguageAvailable] = useState(true);


  const loadTranslations = useCallback(async (lang: Language) => {
    console.log(`Request to load translations for: ${lang}`);

    if (lang === 'en') {
        setTranslations(enTranslations);
        setIsLanguageAvailable(true);
        setIsLoading(false);
        return;
    }
    if (lang === 'tw') {
        setTranslations(enTranslations);
        setIsLanguageAvailable(false);
        setIsLoading(false);
        return;
    }

    const cacheKey = `translations_${lang}`; // sessionStorage key
    if (typeof window !== 'undefined') {
        try {
            const cachedData = sessionStorage.getItem(cacheKey);
            if (cachedData) {
                console.log(`Using cached translations for ${lang} from sessionStorage.`);
                setTranslations(JSON.parse(cachedData));
                setIsLanguageAvailable(true); 
                setIsLoading(false);
                return;
            }
        } catch (e) { console.error("Error reading from sessionStorage:", e); }
    }

    console.log(`Fetching potentially cached translations for ${lang} via API route...`);
    setIsLoading(true);


    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLanguage: lang, texts: {} }), 
      });

      const data: TranslationData = await response.json();

      if (typeof data !== 'object' || data === null || Object.keys(data).length === 0) {
          console.error(`Received invalid data structure from API route for lang "${lang}". Using English.`);
          setTranslations(enTranslations);
          setIsLanguageAvailable(false);
      } else {

          const isEnglishFallback = data["nav.home"] === enTranslations["nav.home"]; 

          setTranslations(data);
          setIsLanguageAvailable(!isEnglishFallback); 

          console.log(`Translation loaded for ${lang}. Is Available: ${!isEnglishFallback}`);

   
          if (!isEnglishFallback && typeof window !== 'undefined') {
                try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); }
                catch (e) { console.error("Error writing to sessionStorage:", e); }
           }
      }
    } catch (error) {
      console.error(`Failed to fetch/parse translations for language "${lang}" from API route:`, error);
       setTranslations(enTranslations); 
       setIsLanguageAvailable(false); 
    } finally {
        setIsLoading(false); 
    }
  }, [language]); 

  // --- Effects ---
  useEffect(() => { 
    let initialLang: Language = "en";
    const storedLang = typeof window !== 'undefined' ? localStorage.getItem("preferredLanguage") as Language : null;
     if (storedLang && ["en", "fr", "es", "tw", "ar"].includes(storedLang)) { initialLang = storedLang; }
     else if (typeof navigator !== 'undefined') { try { const browserLang = navigator.language.split("-")[0]; if (["fr", "es", "ar", "tw", "ak"].includes(browserLang)) initialLang = browserLang as Language; if(browserLang === 'ak') initialLang = 'tw'; } catch (e) {} }
     console.log("Initial language determined as:", initialLang);
     setLanguageState(initialLang); 
     if(initialLang === 'en') setIsLoading(false); 
  }, []);

  useEffect(() => { 
       if (language) {
            localStorage.setItem("preferredLanguage", language);
            document.documentElement.lang = language;
            document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
            loadTranslations(language);
       }
   }, [language, loadTranslations]);

  useEffect(() => { // Storage Sync
    const handleStorageChange = (e: StorageEvent) => { if (e.key === "preferredLanguage" && e.newValue && ["en", "fr", "es", "tw", "ar"].includes(e.newValue as Language)) { const newLang = e.newValue as Language; if (newLang !== language) { setLanguageState(newLang); } } }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [language]);

  // t function 
  const t = useCallback((key: string): string => { if (isLoading && language !== 'en') { const enVal = (enTranslations as Record<string,string>)[key]; return enVal ?? key; } const currentLangData = translations as Record<string, string>; if (currentLangData && Object.prototype.hasOwnProperty.call(currentLangData, key) && currentLangData[key]) { return currentLangData[key]; } const englishFallbackData = enTranslations as Record<string, string>; if (englishFallbackData && Object.prototype.hasOwnProperty.call(englishFallbackData, key)) { if (process.env.NODE_ENV === 'development' && language !== 'en' && !isLoading) { /* console.warn(`Key "${key}" missing for ${language}, using English.`); */ } return englishFallbackData[key]; } if (process.env.NODE_ENV === 'development' && !isLoading) { console.warn(`Key "${key}" missing for ${language} and English.`); } return key; }, [translations, language, isLoading]);

  // Context value
  const contextValue = useMemo(() => ({
    language,
    setLanguage: setLanguageState, // Expose direct state setter
    t,
    isLoading,
    isLanguageAvailable
  }), [language, setLanguageState, t, isLoading, isLanguageAvailable]); // Use direct setter

  return (<LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>);
}

export function useLanguage() { const context = useContext(LanguageContext); if (context === undefined) { throw new Error("useLanguage must be used within a LanguageProvider") } return context; }

