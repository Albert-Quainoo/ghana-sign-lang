"use client"

import { useLanguage } from "@/contexts/language-context"
import { LoadingSpinner } from "./loading-spinner"
import { ReactNode } from "react"

interface LoadingWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function LoadingWrapper({ children, fallback }: LoadingWrapperProps) {
  const { isLoading } = useLanguage()
  
  if (isLoading) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex justify-center items-center py-4">
        <LoadingSpinner size="md" />
      </div>
    )
  }
  
  return <>{children}</>
}
