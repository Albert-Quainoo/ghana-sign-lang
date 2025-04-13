"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
)
Avatar.displayName = "Avatar"

type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  className?: string
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt, ...props }, ref) => (
    <img
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      alt={alt || "Avatar"}
      {...props}
    />
  )
)
AvatarImage.displayName = "AvatarImage"

type AvatarFallbackProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-purple-100 text-purple-600",
        className
      )}
      {...props}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback } 