"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Languages, Send, RefreshCw, ChevronRight, Volume2, Eye, EyeOff, BookOpen, Users, Sparkles } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

// Mock data
const mockSignImages: Record<string, string> = {ello: "/placeholder.svg?height=100&width=100&text=Hello",
  thank: "/placeholder.svg?height=100&width=100&text=Thank",
  you: "/placeholder.svg?height=100&width=100&text=You",
  please: "/placeholder.svg?height=100&width=100&text=Please",
  help: "/placeholder.svg?height=100&width=100&text=Help",
  learn: "/placeholder.svg?height=100&width=100&text=Learn",
  sign: "/placeholder.svg?height=100&width=100&text=Sign",
  language: "/placeholder.svg?height=100&width=100&text=Language",
  good: "/placeholder.svg?height=100&width=100&text=Good",
  morning: "/placeholder.svg?height=100&width=100&text=Morning",
  afternoon: "/placeholder.svg?height=100&width=100&text=Afternoon",
  evening: "/placeholder.svg?height=100&width=100&text=Evening",
  name: "/placeholder.svg?height=100&width=100&text=Name",
  what: "/placeholder.svg?height=100&width=100&text=What",
  how: "/placeholder.svg?height=100&width=100&text=How",
  are: "/placeholder.svg?height=100&width=100&text=Are",
  welcome: "/placeholder.svg?height=100&width=100&text=Welcome",
  sorry: "/placeholder.svg?height=100&width=100&text=Sorry",
  yes: "/placeholder.svg?height=100&width=100&text=Yes",
  no: "/placeholder.svg?height=100&width=100&text=No",};

// Fallback Texts
const fallbacks = {
    heroTitle: "Ghanaian Sign Language Translator",
    heroSubtitle: "Convert text to Ghanaian Sign Language signs to help bridge communication gaps.",
    inputTitle: "Text to GSL",
    inputSubtitle: "Enter text below to translate it into Ghanaian Sign Language signs. Our translator supports common words and phrases.",
    inputPlaceholder: "Enter text to translate to GSL...",
    translateButton: "Translate to GSL",
    translating: "Translating...",
    resultTitle: "Translation Result",
    resultEmpty: 'Enter text above and click "Translate to GSL" to see the sign language translation.',
    resultTip: 'Try simple phrases like "Hello, how are you?" or "Thank you for your help."',
    recent: "Recent Translations",
    supported: "Supported Words",
    supportedDesc: "Our translator currently supports basic words like: hello, thank you, please, help, learn, sign, language, good morning/afternoon/evening, etc.",
    supportedNote: "We're continuously expanding our sign database to include more words and phrases.",
    note: "Note: Some words may not have corresponding signs in our database yet.",
    signAlt: "Sign language sign illustration",
    readPageInstruction: "Welcome to the Ghanaian Sign Language Translator. Type text in the box below to translate it to sign language.",
    readSigns: "Read Signs Aloud",
    learnTitle: "Want to Learn GSL?",
    learnDesc: "Our translator is a helpful tool, but learning GSL directly will enable you to communicate more effectively.",
    learnCta: "Start Learning GSL",
    familyCta: "Family Resources",
    learnCard1Title: "Structured Courses",
    learnCard1Desc: "Follow our comprehensive curriculum designed by GSL experts, with video lessons and interactive exercises.",
    learnCard1Link: "View Courses",
    learnCard2Title: "Community Practice",
    learnCard2Desc: "Connect with other learners and native GSL users to practice your skills in a supportive environment.",
    learnCard2Link: "Join Community",
    learnCard3Title: "Interactive Dictionary",
    learnCard3Desc: "Access our comprehensive GSL dictionary with visual demonstrations of signs and detailed explanations.",
    learnCard3Link: "Explore Dictionary",
    loading: "Loading...",
    standardMode: "Standard Mode",
    highContrast: "High Contrast",
    stop: "Stop",
    readPage: "Read Page",
};


export default function TranslatorPage() {
  const { t, isLoading } = useLanguage() // Use hook
  const [inputText, setInputText] = useState("")
  const [translatedSigns, setTranslatedSigns] = useState<string[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [recentTranslations, setRecentTranslations] = useState<string[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [highContrastMode, setHighContrastMode] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Effects and functions (remain the same as the last version with speech synthesis)
  useEffect(() => { window.scrollTo(0, 0); if (typeof window !== 'undefined' && 'speechSynthesis' in window) { speechSynthesisRef.current = new SpeechSynthesisUtterance(); speechSynthesisRef.current.onend = () => setIsSpeaking(false); speechSynthesisRef.current.onerror = () => setIsSpeaking(false); } return () => { if (typeof window !== 'undefined' && 'speechSynthesis' in window) { window.speechSynthesis.cancel() } } }, [])
  const speakText = (text: string) => { if (typeof window !== 'undefined' && 'speechSynthesis' in window && speechSynthesisRef.current && text) { window.speechSynthesis.cancel(); speechSynthesisRef.current.text = text; const voices = window.speechSynthesis.getVoices(); const preferredVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0]; if (preferredVoice) { speechSynthesisRef.current.voice = preferredVoice; } setIsSpeaking(true); window.speechSynthesis.speak(speechSynthesisRef.current); } else { console.warn("Speech synthesis not supported or no text provided."); setIsSpeaking(false); } }
  const stopSpeaking = () => { if (typeof window !== 'undefined' && 'speechSynthesis' in window) { window.speechSynthesis.cancel(); setIsSpeaking(false); } }
  const translateText = () => { if (!inputText.trim()) { setTranslatedSigns([]); return; } setIsTranslating(true); stopSpeaking(); setTimeout(() => { const words = inputText.toLowerCase().split(/\s+/).filter(w => w.length > 0); const availableSigns = words.map(w => w.replace(/[.,!?;:'"()]/g, "")).filter(cw => cw in mockSignImages); setTranslatedSigns(availableSigns); if (inputText.trim() && !recentTranslations.includes(inputText.trim())) { setRecentTranslations(prev => [inputText.trim(), ...prev].slice(0, 5)); } setIsTranslating(false); textareaRef.current?.focus(); }, 800); }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); translateText(); } }
  const handleRecentTranslationClick = (text: string) => { setInputText(text); setTimeout(translateText, 50); }

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding hero-bg">
        {/* ... blobs ... */}
        <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="heading-1 gradient-text-hero">
                {isLoading ? fallbacks.heroTitle : <span suppressHydrationWarning>{t("translator.title") ?? fallbacks.heroTitle}</span>}
              </h1>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
                {isLoading ? fallbacks.heroSubtitle : <span suppressHydrationWarning>{t("translator.subtitle") ?? fallbacks.heroSubtitle}</span>}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Translator Section */}
      <section className="section-padding content-bg-1">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-3 items-start lg:gap-12">
            {/* Input Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-2">
                <h2 className="heading-2 gradient-text-heading">
                   {isLoading ? fallbacks.inputTitle : <span suppressHydrationWarning>{t("translator.input.title") ?? fallbacks.inputTitle}</span>}
                </h2>
                <p className="text-sm text-muted-foreground">{isLoading ? fallbacks.inputSubtitle : <span suppressHydrationWarning>{t("translator.input.subtitle") ?? fallbacks.inputSubtitle}</span>}</p>
                {/* Accessibility Controls */}
                <div className="flex flex-wrap gap-2 pt-2">
                   <Button variant="outline" size="sm" className="text-xs flex items-center gap-1" onClick={() => setHighContrastMode(!highContrastMode)} aria-pressed={highContrastMode}> {highContrastMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />} {isLoading ? (highContrastMode ? fallbacks.standardMode : fallbacks.highContrast) : <span suppressHydrationWarning>{t(highContrastMode ? "common.standardMode" : "common.highContrast") ?? (highContrastMode ? fallbacks.standardMode : fallbacks.highContrast)}</span>} </Button>
                   <Button variant="outline" size="sm" className="text-xs" onClick={() => setFontSize(prev => Math.min(prev + 2, 24))} disabled={fontSize >= 24}>A+</Button>
                   <Button variant="outline" size="sm" className="text-xs" onClick={() => setFontSize(prev => Math.max(prev - 2, 12))} disabled={fontSize <= 12}>A-</Button>
                   <Button variant="outline" size="sm" className={cn("text-xs flex items-center gap-1", isSpeaking && "bg-primary/10 text-primary border-primary")} onClick={() => isSpeaking ? stopSpeaking() : speakText(isLoading? fallbacks.readPageInstruction : t("translator.readPageInstruction") ?? fallbacks.readPageInstruction)}> {isSpeaking ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" /> } {isLoading ? (isSpeaking ? fallbacks.stop : fallbacks.readPage) : <span suppressHydrationWarning>{t(isSpeaking ? "common.stop" : "common.readPage") ?? (isSpeaking ? fallbacks.stop : fallbacks.readPage)}</span>} </Button>
                </div>
              </div>
              <div className="space-y-4">
                 <Textarea ref={textareaRef} placeholder={isLoading? fallbacks.inputPlaceholder : t("translator.input.placeholder") ?? fallbacks.inputPlaceholder} className={cn(/* ... */)} style={{ fontSize: `${fontSize}px` }} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} rows={5} />
                 <div className="flex gap-2">
                   <Button onClick={translateText} disabled={isTranslating || !inputText.trim()} className="flex-1 btn-gradient rounded-full" aria-live="polite"> {/* Primary */} {isTranslating ? (<><RefreshCw className="mr-2 h-4 w-4 animate-spin" />{isLoading ? fallbacks.translating : <span suppressHydrationWarning>{t("translator.translating") ?? fallbacks.translating}</span>}</>) : (<><Send className="mr-2 h-4 w-4" />{isLoading ? fallbacks.translateButton :<span suppressHydrationWarning>{t("translator.button") ?? fallbacks.translateButton}</span>}</>)}</Button>
                   <Button onClick={() => isSpeaking ? stopSpeaking() : speakText(inputText)} disabled={!inputText.trim()} variant="outline" className="btn-secondary rounded-full" aria-label={isSpeaking ? "Stop speaking" : "Speak text"}> {/* Secondary */} {isSpeaking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />} </Button>
                 </div>
               </div>
               {recentTranslations.length > 0 && (
                 <div className="space-y-3 pt-4">
                   <h3 className="text-base font-medium text-foreground">{isLoading ? fallbacks.recent : <span suppressHydrationWarning>{t("translator.recent") ?? fallbacks.recent}</span>}</h3>
                   <div className="space-y-1.5"> {recentTranslations.map((text, index) => (<button key={index} onClick={() => handleRecentTranslationClick(text)} className="w-full text-left px-3 py-1.5 rounded-md bg-muted/60 hover:bg-muted border border-transparent hover:border-border text-xs text-muted-foreground hover:text-foreground transition-colors truncate" title={text}>{text}</button>))}</div>
                 </div>
               )}
               <div className="space-y-2 pt-4 border-t border-border/40">
                  <h3 className="text-base font-medium text-foreground">{isLoading ? fallbacks.supported : <span suppressHydrationWarning>{t("translator.supported") ?? fallbacks.supported}</span>}</h3>
                  <p className="text-xs text-muted-foreground">{isLoading ? fallbacks.supportedDesc : <span suppressHydrationWarning>{t("translator.supported.desc") ?? fallbacks.supportedDesc}</span>}</p>
                  <p className="text-xs text-muted-foreground">{isLoading ? fallbacks.supportedNote : <span suppressHydrationWarning>{t("translator.supported.note") ?? fallbacks.supportedNote}</span>}</p>
               </div>
            </div>

            {/* Output Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <h2 className="heading-2 gradient-text-heading">{isLoading ? fallbacks.resultTitle : <span suppressHydrationWarning>{t("translator.result.title") ?? fallbacks.resultTitle}</span>}</h2>
                <p className="text-sm text-muted-foreground">{isLoading ? fallbacks.note : <span suppressHydrationWarning>{t("translator.note") ?? fallbacks.note}</span>}</p>
                {translatedSigns.length > 0 && (
                  <Button variant="outline" size="sm" className={cn("mt-2 text-xs flex items-center gap-1", isSpeaking && "bg-primary/10 text-primary border-primary")} onClick={() => isSpeaking ? stopSpeaking() : speakText(`Signs: ${translatedSigns.join(", ")}`)}><span className="sr-only">Read sign names aloud</span>{isSpeaking ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />} {isLoading ? (isSpeaking ? fallbacks.stop : fallbacks.readSigns) : <span suppressHydrationWarning>{t(isSpeaking ? "common.stop" : "translator.readSigns") ?? (isSpeaking ? fallbacks.stop : fallbacks.readSigns)}</span>}</Button>
                )}
              </div>
              <Card className={cn("card-standard glass-card-content min-h-[280px] transition-colors", highContrastMode && "bg-black text-white border-white")}>
                <CardContent className="p-4 md:p-6 flex items-center justify-center h-full">
                  {isTranslating && (<div className="flex flex-col items-center justify-center text-muted-foreground"><RefreshCw className="h-6 w-6 animate-spin mb-2" /><span>{isLoading? fallbacks.loading : <span suppressHydrationWarning>{t("common.loading") ?? fallbacks.loading}</span>}</span></div>)}
                  {!isTranslating && translatedSigns.length === 0 && (<div className="text-center text-muted-foreground py-10 space-y-2"><Languages className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" /><p className="font-medium">{isLoading? fallbacks.resultEmpty : <span suppressHydrationWarning>{t("translator.result.empty") ?? fallbacks.resultEmpty}</span>}</p><p className="text-xs">{isLoading? fallbacks.resultTip : <span suppressHydrationWarning>{t("translator.result.tip") ?? fallbacks.resultTip}</span>}</p></div>)}
                  {!isTranslating && translatedSigns.length > 0 && (
                    <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                      {translatedSigns.map((sign, index) => (
                        <div key={`${sign}-${index}`} className={cn(/* ... */)}>
                          <Image src={mockSignImages[sign] || "/placeholder.svg?height=100&width=100&text=?"} width={80} height={80} alt={isLoading? fallbacks.signAlt : t("translator.signAlt") ?? `Sign for ${sign}`} className="rounded border border-border/40 bg-white object-contain aspect-square" />
                          <span className={cn(/* ... */)}>{sign}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Learn GSL CTA Section */}
      <section id="learn-gsl" className="section-padding content-bg-2">
         <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
           <div className="text-center mb-10">
             <h2 className="heading-2 gradient-text-heading mx-auto">{isLoading ? fallbacks.learnTitle : <span suppressHydrationWarning>{t("translator.learn.title") ?? fallbacks.learnTitle}</span>}</h2>
             <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed mt-4">{isLoading ? fallbacks.learnDesc : <span suppressHydrationWarning>{t("translator.learn.description") ?? fallbacks.learnDesc}</span>}</p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Link href="/learn" scroll={true}> <Button size="lg" className="btn-gradient rounded-full group"> {/* Primary */} {isLoading ? fallbacks.learnCta : <span suppressHydrationWarning>{t("translator.learn.cta") ?? fallbacks.learnCta}</span>}<ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Button></Link>
                <Link href="/family-orientation" scroll={true}><Button size="lg" variant="outline" className="btn-secondary rounded-full"> {/* Secondary */} {isLoading ? fallbacks.familyCta : <span suppressHydrationWarning>{t("translator.family.cta") ?? fallbacks.familyCta}</span>}</Button></Link>
              </div>
           </div>
           <div className="grid gap-8 md:grid-cols-3 mt-12">
              <Card className="card-standard glass-card-content gradient-border subtle-shadow"><CardHeader><CardTitle className="flex items-center"><BookOpen className="h-5 w-5 mr-2 text-pink-500" />{isLoading ? fallbacks.learnCard1Title : <span suppressHydrationWarning>{t("translator.learn.card1.title") ?? fallbacks.learnCard1Title}</span>}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{isLoading ? fallbacks.learnCard1Desc : <span suppressHydrationWarning>{t("translator.learn.card1.description") ?? fallbacks.learnCard1Desc}</span>}</p></CardContent><CardFooter><Link href="/learn#modules" className="text-primary hover:text-primary/80 font-medium flex items-center text-sm">{isLoading ? fallbacks.learnCard1Link : <span suppressHydrationWarning>{t("translator.learn.card1.link") ?? fallbacks.learnCard1Link}</span>}<ChevronRight className="h-4 w-4 ml-1" /></Link></CardFooter></Card>
              <Card className="card-standard glass-card-content gradient-border subtle-shadow"><CardHeader><CardTitle className="flex items-center"><Users className="h-5 w-5 mr-2 text-pink-500" />{isLoading ? fallbacks.learnCard2Title : <span suppressHydrationWarning>{t("translator.learn.card2.title") ?? fallbacks.learnCard2Title}</span>}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{isLoading ? fallbacks.learnCard2Desc : <span suppressHydrationWarning>{t("translator.learn.card2.description") ?? fallbacks.learnCard2Desc}</span>}</p></CardContent><CardFooter><Link href="/message-board" className="text-primary hover:text-primary/80 font-medium flex items-center text-sm">{isLoading ? fallbacks.learnCard2Link : <span suppressHydrationWarning>{t("translator.learn.card2.link") ?? fallbacks.learnCard2Link}</span>}<ChevronRight className="h-4 w-4 ml-1" /></Link></CardFooter></Card>
              <Card className="card-standard glass-card-content gradient-border subtle-shadow"><CardHeader><CardTitle className="flex items-center"><Sparkles className="h-5 w-5 mr-2 text-pink-500" />{isLoading ? fallbacks.learnCard3Title : <span suppressHydrationWarning>{t("translator.learn.card3.title") ?? fallbacks.learnCard3Title}</span>}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{isLoading ? fallbacks.learnCard3Desc : <span suppressHydrationWarning>{t("translator.learn.card3.description") ?? fallbacks.learnCard3Desc}</span>}</p></CardContent><CardFooter><Link href="/learn?tab=dictionary#dictionary" className="text-primary hover:text-primary/80 font-medium flex items-center text-sm">{isLoading ? fallbacks.learnCard3Link : <span suppressHydrationWarning>{t("translator.learn.card3.link") ?? fallbacks.learnCard3Link}</span>}<ChevronRight className="h-4 w-4 ml-1" /></Link></CardFooter></Card>
            </div>
         </div>
      </section>
    </>
  )
}