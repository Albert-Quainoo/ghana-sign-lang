"use client"

import { useEffect, useState } from "react"

interface HydrationFixProps {
  children: React.ReactNode
}

export function HydrationFix({ children }: HydrationFixProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return isClient ? <>{children}</> : null
}
