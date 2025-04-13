"use client"

import { useLanguage } from "@/contexts/language-context"
import { ReactNode, ElementType } from "react"

interface TranslatedTextProps {
  textKey: string
  fallback?: string
  className?: string
  as?: ElementType
}

export function TranslatedText({ 
  textKey, 
  fallback, 
  className,
  as: Component = "span" 
}: TranslatedTextProps) {
  const { t, isLoading } = useLanguage()
  
  // If still loading, show fallback or the key itself
  if (isLoading) {
    return <Component className={className}>{fallback || textKey}</Component>
  }
  
  // Once loaded, show the translated text with hydration suppression
  return (
    <Component className={className} suppressHydrationWarning>
      {t(textKey)}
    </Component>
  )
}
