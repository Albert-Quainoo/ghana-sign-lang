"use client"

import * as React from "react"
import Image, { ImageProps } from "next/image"; // Import next/image and its props type
import { cn } from "@/lib/utils"

// Define AvatarProps if it wasn't explicitly typed before
type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      // Use existing styles for the container
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
)
Avatar.displayName = "Avatar"


// --- Modified AvatarImage ---
type AvatarImageProps = Omit<ImageProps, 'src' | 'alt'> & 
                      React.HTMLAttributes<HTMLImageElement> & { 
    className?: string;
    src?: string; 
    alt?: string; 
}


const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, ...props }, ref) => {
     const imageSrc = src || "/placeholder-avatar.png"; 
     const imageAlt = alt || "User avatar";

      return (
        <Image
          ref={ref} 
          className={cn(
              "aspect-square h-full w-full object-cover", // Added object-cover
               className
          )}
          src={imageSrc}
          alt={imageAlt}
          width={40} 
          height={40}
          {...props} 
        />
     )
  }
)
AvatarImage.displayName = "AvatarImage"
// --- End Modified AvatarImage ---


type AvatarFallbackProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-purple-100 text-purple-600", // Keep existing fallback styles
        className
      )}
      {...props}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
