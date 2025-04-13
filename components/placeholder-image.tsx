"use client"

import { CSSProperties } from "react"

interface PlaceholderImageProps {
  width: number
  height: number
  text?: string
  className?: string
  style?: CSSProperties
}

export function PlaceholderImage({ width, height, text, className, style }: PlaceholderImageProps) {
  // Generate a light background color
  const bgColor = "#f0f0f0"
  const textColor = "#666666"
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={text || "Placeholder image"}
    >
      <rect width="100%" height="100%" fill={bgColor} />
      {text && (
        <>
          <text
            x="50%"
            y="50%"
            fontFamily="Arial, sans-serif"
            fontSize={Math.min(width, height) * 0.1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={textColor}
          >
            {text}
          </text>
        </>
      )}
    </svg>
  )
}
