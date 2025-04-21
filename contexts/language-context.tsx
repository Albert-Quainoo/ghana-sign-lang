"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from "react"; // Added useMemo

export type Language = "en" | "fr" | "es" | "tw" | "ar"
type TranslationData = Record<string, string>;

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoading: boolean
  // isLanguageAvailable was not in the deployed version provided, so removing it
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  isLoading: true, // Starts loading
});

// Adjust path if needed & ENSURE THIS FILE IS COMPLETE
import enTranslations from '../locales/en.json';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true); // Start loading
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<TranslationData>(enTranslations);

  // Function to load translations - checks cache first
  const loadTranslations = useCallback(async (lang: Language) => {
    // Handle English directly
    if (lang === 'en') {
        // Only update state if needed to potentially avoid unnecessary renders
        if (translations !== enTranslations) setTranslations(enTranslations);
        setIsLoading(false); // English is loaded
        return;
    }

    // Check client session cache
    const cacheKey = `translations_${lang}`;
    if (typeof window !== 'undefined') {
        try {
            const cachedData = sessionStorage.getItem(cacheKey);
            if (cachedData) {
                console.log(`Using cached translations for ${lang} from sessionStorage.`);
                setTranslations(JSON.parse(cachedData));
                setIsLoading(false); // Loaded from cache
                return; // Exit if cached
            }
        } catch (e) { console.error("Error reading from sessionStorage:", e); }
    }

    // If not English and not cached, fetch from API
    console.log(`Fetching translations for ${lang} via API route...`);
    setIsLoading(true); // Set loading before fetch
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
             texts: enTranslations, // Base text to translate
             targetLanguage: lang
         }),
      });

      if (!response.ok) {
         const errorBody = await response.text();
         console.error(`API route /api/translate failed for lang "${lang}" with status ${response.status}: ${errorBody}`);
         throw new Error(`API route request failed: ${response.status}`);
      }
      const data: TranslationData = await response.json();
       // Basic check if data is a non-empty object
      if (typeof data !== 'object' || data === null || Object.keys(data).length === 0) {
          console.error(`Received invalid data from API route for lang "${lang}". Falling back.`);
          throw new Error('Invalid translation data received');
      }
      setTranslations(data); // Update state with fetched data

       // Cache in session storage
       if (typeof window !== 'undefined') {
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
                console.log(`Cached translations for ${lang} in sessionStorage.`);
            } catch (e) { console.error("Error writing to sessionStorage:", e); }
       }
    } catch (error) {
      console.error(`Failed to load/parse translations for language "${lang}" from API route. Falling back to English. Error:`, error);
      // Fallback to English if fetch fails
      // Only set if the failed lang is the currently selected one to avoid flicker
       if (language === lang) {
           setTranslations(enTranslations);
       }
    } finally {
        // Always set loading false after attempt, even if failed (shows fallback)
        setIsLoading(false);
    }
  // Dependency: Re-run load logic if language changes OR if base enTranslations object were to change (it won't)
  }, [language]); // Depends on language state

  // Effect to determine initial language on mount
  useEffect(() => {
    let selectedLang: Language = "en";
    const storedLang = typeof window !== 'undefined' ? localStorage.getItem("preferredLanguage") as Language : null;
    if (storedLang && ["en", "fr", "es", "tw", "ar"].includes(storedLang)) {
        selectedLang = storedLang;
    } else if (typeof navigator !== 'undefined') {
        try {
            const browserLang = navigator.language.split("-")[0];
            if (browserLang === "fr") selectedLang = "fr";
            else if (browserLang === "es") selectedLang = "es";
            else if (browserLang === "ar") selectedLang = "ar";
            else if (browserLang === 'ak' || browserLang === 'tw') selectedLang = "tw";
        } catch (e) { console.error("Browser language detection failed:", e); }
    }
    // Set the initial state. This will trigger the effect below if lang !== 'en'
    setLanguageState(selectedLang);
    // If starting language is English, set loading false immediately
    if (selectedLang === 'en') {
        setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once

  // Effect to run side effects when language state changes
  useEffect(() => {
       if (language) {
            localStorage.setItem("preferredLanguage", language);
            document.documentElement.lang = language;
            document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
            console.log(`Language state updated to ${language}, attempting loadTranslations.`);
            loadTranslations(language); // Trigger load (will check cache first)
       }
   // Re-run when language state changes or loadTranslations function ref changes (it shouldn't)
   }, [language, loadTranslations]);

  // Effect to sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "preferredLanguage" && e.newValue && ["en", "fr", "es", "tw", "ar"].includes(e.newValue as Language)) {
            const newLang = e.newValue as Language;
            if (newLang !== language) {
                setLanguageState(newLang); // Update local state if changed elsewhere
            }
        }
     }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [language]); // Re-attach listener if language changes

  // Translation function 't'
  const t = useCallback((key: string): string => {
      // During loading (for non-English), show English immediately
      if (isLoading && language !== 'en') {
           const englishValueDuringLoad = (enTranslations as Record<string, string>)[key];
           return englishValueDuringLoad ?? key; // Fallback to key if English also missing
      }

      // When loaded or if English, use current translations state
      const currentLangData = translations as Record<string, string>;
      if (currentLangData && Object.prototype.hasOwnProperty.call(currentLangData, key) && currentLangData[key]) {
          return currentLangData[key];
      }

      // Fallback to imported English if key missing in current state
      const englishFallbackData = enTranslations as Record<string, string>;
      if (englishFallbackData && Object.prototype.hasOwnProperty.call(englishFallbackData, key)) {
          if (process.env.NODE_ENV === 'development' && language !== 'en') {
              // console.warn(`Translation key "${key}" not found for language "${language}". Falling back to English.`);
          }
          return englishFallbackData[key];
      }

      // Final fallback to the key itself
      if (process.env.NODE_ENV === 'development') {
          console.warn(`Translation key "${key}" not found for language "${language}" or in English fallbacks.`);
      }
      return key;
  }, [isLoading, language, translations]); // Recalculate t if these change


  // Memoize context value
  const contextValue = useMemo(() => ({
      language,
      setLanguage: setLanguageState, // Expose the direct state setter
      t,
      isLoading
  }), [language, setLanguageState, t, isLoading]); // Recreate context value if these change


  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

// Custom hook
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) { throw new Error("useLanguage must be used within a LanguageProvider") }
  return context
}