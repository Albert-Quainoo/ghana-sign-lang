import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url)
  
  if (pathname.endsWith('/placeholder.svg')) {
    const width = searchParams.get('width') || '200'
    const height = searchParams.get('height') || '200'
    const text = searchParams.get('text') || ''
    
    const svg = `
      <svg 
        width="${width}" 
        height="${height}" 
        viewBox="0 0 ${width} ${height}" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100%" height="100%" fill="#f0f0f0" />
        ${text ? `
          <text 
            x="50%" 
            y="50%" 
            font-family="Arial, sans-serif" 
            font-size="${Math.min(parseInt(width), parseInt(height)) * 0.1}" 
            text-anchor="middle" 
            dominant-baseline="middle" 
            fill="#666666"
          >
            ${text}
          </text>
        ` : ''}
      </svg>
    `.trim()
    
    // Return the SVG as a response
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  }

 
  // Continue for other requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/placeholder.svg'
  ],
}
