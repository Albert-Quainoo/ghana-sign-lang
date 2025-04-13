"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, MouseEvent } from "react"
import { Headphones, Menu, X, ChevronDown, Globe, Check, BookOpen, Users, Languages, Briefcase, Home, Info, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import type { Language } from "@/contexts/language-context"

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "tw", name: "Twi", flag: "🇬🇭" },
  { code: "ar", name: "العربية", flag: "🇪🇬" },
]

// --- Initial State with English Fallbacks ---
const initialNavItems = [
    { key: "home", href: "/", label: "Home", icon: Home, hasDropdown: false },
    { key: "learn", href: "/learn", label: "Learn", icon: BookOpen, hasDropdown: true, dropdown: [
        { key: "lessons", label: "Lessons", description: "Structured learning path", href: "/learn?tab=lessons#lessons" },
        { key: "practice", label: "Practice", description: "Interactive practice exercises", href: "/learn?tab=practice#practice" },
        { key: "resources", label: "Resources", description: "Learning materials and guides", href: "/learn?tab=resources#resources" },
        { key: "dictionary", label: "GSL Dictionary", description: "Look up signs", href: "/learn?tab=dictionary#dictionary" },
      ] },
    { key: "family", href: "/family-orientation", label: "Family Orientation", icon: Users, hasDropdown: true, dropdown: [
        { key: "parents", label: "For Parents", description: "Resources for parents", href: "/family-orientation#parents" },
        { key: "children", label: "For Children", description: "Fun learning for kids", href: "/family-orientation#children" },
        { key: "support", label: "Support Network", description: "Connect with others", href: "/family-orientation#support" },
      ] },
    { key: "translator", href: "/translator", label: "Translator", icon: Languages, hasDropdown: true, dropdown: [
        { key: "text", label: "Text Translator", description: "Translate text to signs", href: "/translator" },
        { key: "learn", label: "Want to Learn GSL?", description: "Explore learning resources", href: "/translator#learn-gsl" },
      ] },
    { key: "careers", href: "/careers-scholarships", label: "Careers & Scholarships", icon: Briefcase, hasDropdown: true, dropdown: [
        { key: "careers", label: "Interpreter Careers", description: "Become a GSL interpreter", href: "/careers-scholarships#interpreter-careers" },
        { key: "scholarships", label: "Scholarships", description: "Financial support", href: "/careers-scholarships#scholarships" },
        { key: "development", label: "Professional Development", description: "Grow your skills", href: "/careers-scholarships#development" },
        { key: "opportunities", label: "Career Opportunities", description: "Jobs in GSL", href: "/careers-scholarships#opportunities" },
      ] },
    { key: "about", href: "/about", label: "About Us", icon: Info, hasDropdown: false },
    { key: "community", href: "/message-board", label: "Message Board", icon: MessageSquare, hasDropdown: false },
];
// --- End Initial State ---


export function SiteHeader({ className }: { className?: string }) {
  const currentPathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { t, language, setLanguage, isLoading } = useLanguage() // Get isLoading
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})

  
  const [navItems, setNavItems] = useState(initialNavItems);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, []) 

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement
      if (languageMenuOpen && !target.closest('[data-language-selector="true"]')) {
        setLanguageMenuOpen(false)
      }
      if (activeDropdown) {
         const isClickInside = Object.keys(dropdownRefs.current).some(key =>
           dropdownRefs.current[key]?.contains(target) ||
           target.closest(`[data-dropdown-trigger="${key}"]`)
         );
         if (!isClickInside) {
           setActiveDropdown(null);
         }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [languageMenuOpen, activeDropdown])


  useEffect(() => {
    if (!isLoading) {
      setNavItems(prevItems => prevItems.map(item => {

        const updatedItem = { ...item, label: t(`nav.${item.key}`) ?? item.label }; // Fallback to initial label

        if (item.hasDropdown && item.dropdown) {
          updatedItem.dropdown = item.dropdown.map(d => ({
            ...d,
            label: t(`nav.${item.key}.${d.key}`) ?? d.label,
            description: t(`nav.${item.key}.${d.key}.desc`) ?? d.description
          }));
        }
        return updatedItem;
      }));
    }
   
  }, [isLoading, t, language]); 


  const isActive = (path: string) => {
    if (!currentPathname) return false
    const cleanCurrentPath = currentPathname.split(/[?#]/)[0];
    const cleanPath = path.split(/[?#]/)[0];
    return cleanPath === "/" ? cleanCurrentPath === "/" : cleanCurrentPath.startsWith(cleanPath);
  }

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key)
  }

  // Smooth Scroll Logic
  const handleSmoothScrollLink = ( event: MouseEvent<HTMLAnchorElement>, href: string ) => {
    const url = new URL(href, window.location.origin);
    const targetPathname = url.pathname;
    const targetHash = url.hash;

    if (targetPathname === currentPathname && targetHash) {
      event.preventDefault()
      const elementId = targetHash.substring(1)
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        console.warn(`Smooth scroll target element with ID "${elementId}" not found.`)
      }
      setMobileMenuOpen(false)
      setActiveDropdown(null)
    } else { 
      setMobileMenuOpen(false)
      setActiveDropdown(null)
    }
  }

  const getLanguageDisplay = () => {
    const languageObj = languages.find((lang) => lang.code === language)
    return languageObj ? `${languageObj.flag} ${languageObj.name}` : "🇬🇧 English"
  }

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    setLanguageMenuOpen(false)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-200",
        scrolled && "shadow-sm",
        className
      )}
    >
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
         {/* Logo Link */}
         <Link href="/" className="mr-6 flex items-center space-x-2 shrink-0" onClick={(e) => handleSmoothScrollLink(e, "/")}>
           {/* ... logo */}
           <Headphones className="h-6 w-6 text-pink-500" />
           <span className="font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline" suppressHydrationWarning>
             Lending a Helping Ear
           </span>
           <span className="font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent sm:hidden" suppressHydrationWarning>
             LHE
           </span>
         </Link>

         {/* Desktop Navigation */}
         <nav className="hidden md:flex flex-1 items-center justify-center gap-1 lg:gap-2">
           {navItems.map((item) => (
             <div key={item.key} className="relative" ref={(el) => { dropdownRefs.current[item.key] = el; }} data-dropdown={item.key}>
               {item.hasDropdown ? (
                 <button data-dropdown-trigger={item.key} onClick={() => toggleDropdown(item.key)} className={cn( /* Styles */ "group inline-flex h-9 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50", isActive(item.href)? "text-pink-600 font-semibold" : "text-foreground/60 hover:text-foreground/80 hover:bg-accent/50", )} aria-expanded={activeDropdown === item.key} aria-haspopup="true">
                   <item.icon className="h-4 w-4 mr-1.5 text-pink-500/70" />
                   {/* Render label directly from state (already translated or fallback) */}
                   <span>{item.label}</span>
                   <ChevronDown className={cn("h-3 w-3 opacity-50 ml-1 transition-transform", activeDropdown === item.key && "transform rotate-180")} />
                 </button>
               ) : (
                 <Link href={item.href} onClick={(e) => handleSmoothScrollLink(e, item.href)} className={cn( /* Styles */ "group inline-flex h-9 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50", isActive(item.href) ? "text-pink-600 font-semibold" : "text-foreground/60 hover:text-foreground/80 hover:bg-accent/50", )}>
                   <item.icon className="h-4 w-4 mr-1.5 text-pink-500/70" />
                   {/* Render label directly from state */}
                   <span>{item.label}</span>
                 </Link>
               )}
               {/* Dropdown Content */}
               {item.hasDropdown && activeDropdown === item.key && item.dropdown && (
                 <div className="absolute left-0 mt-1 w-64 origin-top-left rounded-md border bg-popover p-2 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 z-50">
                   <Card className="p-1 bg-transparent border-0 shadow-none">
                     <div className="space-y-1">
                       {item.dropdown.map((dropdownItem, idx) => (
                         <Link key={idx} href={dropdownItem.href} onClick={(e) => handleSmoothScrollLink(e, dropdownItem.href)} className="flex flex-col w-full rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                           {/* Render dropdown labels directly from state */}
                           <span className="font-medium">{dropdownItem.label}</span>
                           <span className="text-xs text-muted-foreground">{dropdownItem.description}</span>
                         </Link>
                       ))}
                     </div>
                   </Card>
                 </div>
               )}
             </div>
           ))}
         </nav>

         {/* Right side controls */}
         <div className="flex items-center justify-end gap-2 md:gap-3">
           {/* Language Dropdown */}
           <div className="relative" data-language-selector="true">
              {/* ... language button and dropdown (no changes needed here for text display) ... */}
                <Button variant="ghost" size="sm" onClick={() => setLanguageMenuOpen(!languageMenuOpen)} className="flex items-center gap-1 px-2 text-xs lg:text-sm rounded-lg border border-border/40 hover:bg-accent/50" aria-expanded={languageMenuOpen} aria-haspopup="true">
                  <Globe className="h-4 w-4 text-pink-500 mr-1" />
                  <span className="truncate max-w-[80px] sm:max-w-[100px]">{getLanguageDisplay()}</span>
                  <ChevronDown className={cn("h-3 w-3 opacity-50 ml-0.5 transition-transform", languageMenuOpen && "transform rotate-180")} />
                </Button>
                {languageMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                    <div className="space-y-1">
                      {languages.map((lang) => (
                        <button key={lang.code} onClick={() => handleLanguageChange(lang.code as Language)} className={cn( /* Styles */ "flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50", language === lang.code ? "bg-accent text-accent-foreground font-medium" : "", )}>
                          <span className="text-base mr-1">{lang.flag}</span>
                          <span>{lang.name}</span>
                          {language === lang.code && <Check className="h-4 w-4 ml-auto text-pink-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
           </div>

           {/* Sign In / Sign Up / Mobile Menu */}
           <Link href="/sign-in" className="hidden md:block" onClick={(e) => handleSmoothScrollLink(e, "/sign-in")}>
              {/* Conditionally render or use fallback */}
             <Button variant="outline" size="sm">
               {isLoading ? "Sign In" : <span suppressHydrationWarning>{t("nav.signin") ?? "Sign In"}</span>}
             </Button>
           </Link>
           <Link href="/sign-up" onClick={(e) => handleSmoothScrollLink(e, "/sign-up")}>
              {/* Conditionally render or use fallback */}
             <Button size="sm" variant="default">
                {isLoading ? "Get Started" : <span suppressHydrationWarning>{t("nav.signup") ?? "Get Started"}</span>}
             </Button>
           </Link>
           <Button variant="ghost" size="icon" className="md:hidden rounded-lg hover:bg-accent/50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}>
             {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
           </Button>
         </div>
      </div>

       {/* Mobile Menu */}
       {mobileMenuOpen && (
         <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md animate-in slide-in-from-top-3 duration-300">
           <nav className="grid gap-1 p-4">
             {navItems.map((item) => (
               <div key={item.key} className="w-full">
                 {item.hasDropdown ? (
                   <>
                     <div className={cn( /* Styles */ "flex items-center justify-between w-full rounded-md p-2 text-sm font-medium hover:bg-accent/50 cursor-pointer", isActive(item.href) ? "text-pink-600 font-semibold" : "text-muted-foreground", )} onClick={() => toggleDropdown(item.key)}>
                       <div className="flex items-center">
                         <item.icon className="h-4 w-4 mr-2 text-pink-500/70" />
                         {/* Render label directly from state */}
                         <span>{item.label}</span>
                       </div>
                       <ChevronDown className={cn("h-4 w-4 transition-transform", activeDropdown === item.key && "transform rotate-180")} />
                     </div>
                     {activeDropdown === item.key && item.dropdown && (
                       <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-border/40 ml-2 mt-1">
                         {item.dropdown.map((dropdownItem, idx) => (
                           <Link key={idx} href={dropdownItem.href} className="flex flex-col w-full rounded-md px-3 py-2 text-sm hover:bg-accent/50" onClick={(e) => handleSmoothScrollLink(e, dropdownItem.href)}>
                             {/* Render dropdown labels directly from state */}
                             <span className="font-medium">{dropdownItem.label}</span>
                             <span className="text-xs text-muted-foreground">{dropdownItem.description}</span>
                           </Link>
                         ))}
                       </div>
                     )}
                   </>
                 ) : (
                   <Link href={item.href} className={cn( /* Styles */ "flex items-center w-full rounded-md p-2 text-sm font-medium hover:bg-accent/50", isActive(item.href) ? "text-pink-600 font-semibold" : "text-muted-foreground", )} onClick={(e) => handleSmoothScrollLink(e, item.href)}>
                     <item.icon className="h-4 w-4 mr-2 text-pink-500/70" />
                     {/* Render label directly from state */}
                     <span>{item.label}</span>
                   </Link>
                 )}
               </div>
             ))}
             <Link href="/sign-in" className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:bg-accent/50 text-muted-foreground mt-2" onClick={(e) => handleSmoothScrollLink(e, "/sign-in")}>
               {/* Conditionally render or use fallback */}
                {isLoading ? "Sign In" : <span suppressHydrationWarning>{t("nav.signin") ?? "Sign In"}</span>}
             </Link>
           </nav>
         </div>
       )}
    </header>
  )
}