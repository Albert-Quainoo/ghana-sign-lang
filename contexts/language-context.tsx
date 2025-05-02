"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from "react"

export type Language = "en" | "fr" | "es" | "tw" | "ar"
export type TranslationData = Record<string, string>

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoading: boolean
  isLanguageAvailable: boolean
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  isLoading: true,
  isLanguageAvailable: true,
})

import enTranslations from "../locales/en.json"

const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') {
        return 'en';
    }
    try {
        const storedLang = localStorage.getItem("preferredLanguage") as Language;
        if (storedLang && ["en", "fr", "es", "tw", "ar"].includes(storedLang)) {
            console.log("Initial language read from localStorage:", storedLang);
            return storedLang;
        }
        const browserLang = navigator.language.split("-")[0];
        if (["fr", "es", "ar", "tw", "ak"].includes(browserLang)) {
             const detectedLang = browserLang === "ak" ? "tw" : browserLang as Language;
             console.log("Initial language determined from browser:", detectedLang);
             return detectedLang;
        }
    } catch (e) {
        console.error("Error detecting initial language:", e);
    }
    console.log("Initial language falling back to 'en'.");
    return 'en';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [translations, setTranslations] = useState<TranslationData>(enTranslations);
  const [isLoading, setIsLoading] = useState<boolean>(() => language !== 'en');
  const [isLanguageAvailable, setIsLanguageAvailable] = useState(true);

  const loadTranslations = useCallback(
    async (lang: Language) => {
      console.log(`Request to load translations for: ${lang}`);
      if (lang === "en") {
        setTranslations(enTranslations);
        setIsLanguageAvailable(true);
        setIsLoading(false);
        return;
      }

      console.log(`Fetching translations for ${lang} via API route...`);
      setIsLoading(true);
      setIsLanguageAvailable(true);

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetLanguage: lang }),
        });

        if (!response.ok) {
             console.error(`API route fetch failed for ${lang} with status: ${response.status}`);
             let errorMsg = `API error (${response.status})`;
             try { const errorBody = await response.json(); errorMsg = errorBody.error || errorMsg; } catch {}
             throw new Error(errorMsg);
         }

        const data: TranslationData = await response.json();
        const isEffectivelyEnglish = data["nav.home"] === enTranslations["nav.home"];

        if (isEffectivelyEnglish) {
            console.warn(`API returned English fallback data for ${lang}. Marking as potentially unavailable.`);
            setIsLanguageAvailable(false);
        } else {
             setIsLanguageAvailable(true);
        }
        setTranslations(data);
        console.log(`Translation processed for ${lang}. Is Available (non-English content): ${isLanguageAvailable}`);

      } catch (error) {
        console.error(`Failed to fetch/parse translations for language "${lang}" from API route:`, error);
        setTranslations(enTranslations);
        setIsLanguageAvailable(false);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (language) {
      console.log(`Language state is now ${language}, running effect.`);
      try {
        localStorage.setItem("preferredLanguage", language);
        console.log(`Saved "${language}" to localStorage.`);
      } catch (e) {
          console.error("Failed to save language to localStorage:", e);
      }
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      if (language === 'en') {
          setTranslations(enTranslations);
          setIsLoading(false);
          setIsLanguageAvailable(true);
      } else {
          loadTranslations(language);
      }
    }
  }, [language, loadTranslations]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "preferredLanguage" &&
        e.newValue &&
        ["en", "fr", "es", "tw", "ar"].includes(e.newValue as Language)
      ) {
        const newLang = e.newValue as Language;
        if (newLang !== language) {
          console.log(`Storage changed externally, setting language to ${newLang}`);
          setLanguageState(newLang);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [language]);

  const t = useCallback(
    (key: string): string => {
      const currentLangData = translations as Record<string, string>;
      const resolvedValue = currentLangData?.[key];
      if (resolvedValue) {
        return resolvedValue;
      }
      const englishFallbackData = enTranslations as Record<string, string>;
      if (englishFallbackData && Object.prototype.hasOwnProperty.call(englishFallbackData, key)) {
        return englishFallbackData[key];
      }
      if (process.env.NODE_ENV === "development" && !isLoading) {
         console.warn(`Key "${key}" missing for ${language} and English.`);
      }
      return key;
    },
    [translations, language, isLoading],
  );

  const setLanguage = useCallback((lang: Language) => {
      console.log("<<< CONTEXT DEBUG: setLanguage called with:", lang);
      if (["en", "fr", "es", "tw", "ar"].includes(lang)) {
        setLanguageState(lang);
      } else {
        console.error("<<< CONTEXT DEBUG: Attempted to set invalid language:", lang);
      }
  }, []);

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      isLoading,
      isLanguageAvailable,
    }),
    [language, setLanguage, t, isLoading, isLanguageAvailable],
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}