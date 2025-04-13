"use client"

import { useLanguage } from "@/contexts/language-context"
import { ElementType } from "react"

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
  
  
  if (isLoading) {
    return <Component className={className}>{fallback || textKey}</Component>
  }
  
  return (
    <Component className={className} suppressHydrationWarning>
      {t(textKey)}
    </Component>
  )
}
