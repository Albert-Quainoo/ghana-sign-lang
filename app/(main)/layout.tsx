import type React from "react"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // This layout simply passes children through, root layout handles header/footer
    <div className="relative">
      {/* First blob - pink */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      {/* Second blob - purple */}
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      {/* Third blob - blue */}
      <div className="fixed bottom-32 left-24 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {children}
    </div>
  )
}
