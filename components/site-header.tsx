"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, MouseEvent, useRef, useCallback, useMemo } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  Headphones, Menu, X, ChevronDown, Globe, Check, BookOpen, Users, Languages, Briefcase, Home, Info, MessageSquare, AlertCircle, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage, Language } from "@/contexts/language-context"; 

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "tw", name: "Twi", flag: "🇬🇭", unavailable: true },
  { code: "ar", name: "العربية", flag: "🇪🇬" },
];

interface DropdownItem { key: string; label: string; description: string; href: string; "aria-label"?: string; }
interface NavItem { key: string; href: string; label: string; icon: React.ElementType; hasDropdown: boolean; dropdown?: DropdownItem[]; isSecondary?: boolean; }

const initialNavItems: NavItem[] = [
    { key: "home", href: "/", label: "Home", icon: Home, hasDropdown: false },
    { key: "learn", href: "/learn", label: "Learn", icon: BookOpen, hasDropdown: true, dropdown: [
        { key: "lessons", label: "Lessons", description: "Structured learning path", href: "/learn?tab=lessons#lessons", },
        { key: "practice", label: "Practice", description: "Interactive practice exercises", href: "/learn?tab=practice#practice", },
        { key: "resources", label: "Resources", description: "Learning materials and guides", href: "/learn?tab=resources#resources", },
        { key: "dictionary", label: "Dictionary", description: "Look up signs", href: "/learn?tab=dictionary#dictionary", },
      ] },
    { key: "family", href: "/family-orientation", label: "Family", icon: Users, hasDropdown: true, dropdown: [
        { key: "parents", label: "For Parents", description: "Resources for parents", href: "/family-orientation#parents", },
        { key: "children", label: "For Children", description: "Fun learning for kids", href: "/family-orientation#children", },
        { key: "support", label: "Support Network", description: "Connect with others", href: "/family-orientation#support", },
      ] },
    { key: "translator", href: "/translator", label: "Translator", icon: Languages, hasDropdown: true, dropdown: [
        { key: "text", label: "Text Translator", description: "Translate text to signs", href: "/translator", },
        { key: "learn", label: "Want to Learn GSL?", description: "Explore learning resources", href: "/translator#learn-gsl", },
      ] },
    { key: "careers", href: "/careers-scholarships", label: "Careers", icon: Briefcase, hasDropdown: true, isSecondary: true, dropdown: [
        { key: "careers", label: "Interpreter Careers", description: "Become a GSL interpreter", href: "/careers-scholarships#interpreter-careers", },
        { key: "scholarships", label: "Scholarships", description: "Financial support", href: "/careers-scholarships#scholarships", },
        { key: "development", label: "Professional Development", description: "Grow your skills", href: "/careers-scholarships#development", },
        { key: "opportunities", label: "Career Opportunities", description: "Jobs in GSL", href: "/careers-scholarships#opportunities", },
      ] },
    { key: "about", href: "/about", label: "About", icon: Info, hasDropdown: false, isSecondary: true },
    { key: "community", href: "/message-board", label: "Community", icon: MessageSquare, hasDropdown: false, isSecondary: true },
];

// --- Helper Function for Smooth Scrolling ---
const handleSmoothScrollInternal = (event: MouseEvent<HTMLAnchorElement>, href: string, currentPathname: string | null, closeMobileMenu?: () => void) => {
    const url = new URL(href, window.location.origin);
    const targetPathname = url.pathname;
    const targetHash = url.hash;
    if (targetPathname === currentPathname && targetHash) {
      event.preventDefault();
      const elementId = targetHash.substring(1);
      const element = document.getElementById(elementId);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
      else console.warn(`Smooth scroll target element with ID "${elementId}" not found.`);
      closeMobileMenu?.();
    } else {
      closeMobileMenu?.();
    }
};

// --- Helper Component for Nav Links/Triggers ---
const NavLinkTrigger = ({ item, isActive, handleLinkClick }: { item: NavItem; isActive: (path: string) => boolean; handleLinkClick: (event: MouseEvent<HTMLAnchorElement>, href: string) => void }) => {
   if (item.hasDropdown) {
        return (
            <DropdownMenuPrimitive.Root>
                <DropdownMenuPrimitive.Trigger asChild>
                    <button className={cn("group inline-flex h-9 items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap data-[state=open]:bg-accent/50", isActive(item.href) ? "text-pink-600 font-semibold" : "text-foreground/60 hover:text-foreground/80 hover:bg-accent/50")} aria-label={item.label}>
                        <item.icon className="h-4 w-4 mr-1 shrink-0" aria-hidden="true" />
                        <span suppressHydrationWarning>{item.label}</span>
                        <ChevronDown className={cn("h-3 w-3 opacity-50 ml-1 shrink-0 transition-transform group-data-[state=open]:rotate-180")} aria-hidden="true"/>
                    </button>
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                    <DropdownMenuPrimitive.Content sideOffset={5} align="start" className="origin-top-left rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-[100] w-64 focus:outline-none">
                        <div className="space-y-1">
                            {item.dropdown?.map((dropdownItem, idx) => (
                                <DropdownMenuPrimitive.Item key={idx} asChild>
                                    <Link href={dropdownItem.href} onClick={(e) => handleLinkClick(e, dropdownItem.href)} className="flex flex-col w-full rounded-sm px-2 py-1.5 text-sm hover:bg-accent focus:bg-accent outline-none cursor-pointer select-none" aria-label={dropdownItem['aria-label'] || `${dropdownItem.label}: ${dropdownItem.description}`}>
                                        <span className="font-medium" suppressHydrationWarning>{dropdownItem.label}</span>
                                        <span className="text-xs text-muted-foreground" suppressHydrationWarning>{dropdownItem.description}</span>
                                    </Link>
                                </DropdownMenuPrimitive.Item>
                            ))}
                        </div>
                    </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
            </DropdownMenuPrimitive.Root>
        );
    }

    return (
        <Link href={item.href} onClick={(e) => handleLinkClick(e, item.href)} className={cn("group inline-flex h-9 items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap", isActive(item.href) ? "text-pink-600 font-semibold" : "text-foreground/60 hover:text-foreground/80 hover:bg-accent/50")} aria-current={isActive(item.href) ? "page" : undefined}>
            <item.icon className="h-4 w-4 mr-1 shrink-0" aria-hidden="true" />
            <span suppressHydrationWarning>{item.label}</span>
        </Link>
    );
};

// --- Main SiteHeader Component ---
export function SiteHeader({ className }: { className?: string }) {
  const currentPathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, language, setLanguage, isLoading } = useLanguage(); // Use context hook
  const navRef = useRef<HTMLElement>(null);
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);

  const handleLanguageChange = (lang: Language) => {
      console.log("Calling setLanguage from context with:", lang);
      setLanguage(lang); 
  };



  useEffect(() => { const handleScroll = () => setScrolled(window.scrollY > 10); window.addEventListener("scroll", handleScroll); return () => window.removeEventListener("scroll", handleScroll); }, []);

  useEffect(() => {
    // Update labels based on translation
    if (!isLoading) {
      setNavItems(prevItems => prevItems.map(item => { // Added return statement here
        const updatedItem = { ...item, label: t(`nav.${item.key}`) || item.label };
        if (item.hasDropdown && item.dropdown) {
          updatedItem.dropdown = item.dropdown.map(d => ({
            ...d,
            label: t(`nav.${item.key}.${d.key}`) || d.label,
            description: t(`nav.${item.key}.${d.key}.desc`) || d.description,
            'aria-label': t(`nav.${item.key}.${d.key}`) || d.label,
          }));
        }
        return updatedItem; 
      }));
    }
  }, [isLoading, t, language]); 

  // Memoize helper functions
  const isActive = useCallback((path: string) => {
    if (!currentPathname) return false;
    const cleanCurrentPath = currentPathname.split(/[?#]/)[0];
    const cleanPath = path.split(/[?#]/)[0];
    return cleanPath === "/" ? cleanCurrentPath === "/" : cleanCurrentPath.startsWith(cleanPath);
  }, [currentPathname]);

  const handleLinkClick = useCallback((event: MouseEvent<HTMLAnchorElement>, href: string) => {
      handleSmoothScrollInternal(event, href, currentPathname, () => setMobileMenuOpen(false));
  }, [currentPathname]);

  const getLanguageDisplay = useCallback(() => {
    const langObj = languages.find((l) => l.code === language);
    return langObj ? `${langObj.flag} ${langObj.code.toUpperCase()}` : "🇬🇧 EN";
  }, [language]);

  useEffect(() => { setMobileMenuOpen(false); }, [currentPathname]);


  // Memoize filtered nav items
  const primaryNavItems = useMemo(() => navItems.filter(item => !item.isSecondary), [navItems]);
  const secondaryNavItems = useMemo(() => navItems.filter(item => item.isSecondary), [navItems]);

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-200", scrolled && "shadow-sm", className)}>
      <div className="flex h-14 max-w-screen-2xl items-center justify-between mx-auto px-4 min-w-0">
        {/* Left: Logo - Hardcoded Brand */}
        <div className="flex items-center shrink-0 mr-4">
            <Link href="/" className="flex items-center space-x-2 min-w-fit" onClick={(e) => handleLinkClick(e, "/")} aria-label="Signed-in Home Page">
                <Headphones className="h-6 w-6 text-pink-500 shrink-0" />
                <span className="font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent hidden md:inline whitespace-nowrap">
                    Signed-in
                </span>
            </Link>
        </div>

        {/* Center: Navigation with "More" Menu */}
        <div className="flex flex-1 justify-center items-center min-w-0 px-2 md:px-4">
             <nav ref={navRef} className={cn("hidden lg:flex items-center", "gap-1", "flex-nowrap")} aria-label="Main navigation">
               {/* Render Primary Items */}
               {primaryNavItems.map((item: NavItem) => ( 
                   <NavLinkTrigger key={item.key} item={item} isActive={isActive} handleLinkClick={handleLinkClick} />
               ))}
               {/* Render Secondary Items Directly (XL+) */}
               {secondaryNavItems.map((item: NavItem) => ( 
                   <div key={item.key} className="hidden xl:inline-flex items-center">
                        <NavLinkTrigger item={item} isActive={isActive} handleLinkClick={handleLinkClick} />
                   </div>
               ))}
               {/* Render "More" Dropdown (LG to XL) */}
               {secondaryNavItems.length > 0 && (
                   <div className="hidden lg:inline-flex xl:hidden items-center">
                       <DropdownMenuPrimitive.Root>
                           <DropdownMenuPrimitive.Trigger asChild>
                               <button className={cn("group inline-flex h-9 items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap text-foreground/60 hover:text-foreground/80 hover:bg-accent/50 data-[state=open]:bg-accent/50")} aria-label="More navigation items">
                                   <MoreHorizontal className="h-4 w-4" />
                               </button>
                           </DropdownMenuPrimitive.Trigger>
                           <DropdownMenuPrimitive.Portal>
                               <DropdownMenuPrimitive.Content sideOffset={5} align="end" className="origin-top-right rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-[100] min-w-[180px] focus:outline-none">
                                    {secondaryNavItems.map((sItem: NavItem) => ( // Add explicit type
                                       <DropdownMenuPrimitive.Item key={sItem.key} asChild>
                                            <Link href={sItem.href} onClick={(e) => handleLinkClick(e, sItem.href)} className={cn("flex items-center w-full rounded-sm px-2 py-1.5 text-sm hover:bg-accent focus:bg-accent outline-none cursor-pointer select-none", isActive(sItem.href) ? "text-pink-600 font-semibold" : "text-foreground")}>
                                                 <sItem.icon className="h-4 w-4 mr-2 text-foreground/60" aria-hidden="true" />
                                                 <span suppressHydrationWarning>{sItem.label}</span>
                                            </Link>
                                       </DropdownMenuPrimitive.Item>
                                   ))}
                               </DropdownMenuPrimitive.Content>
                           </DropdownMenuPrimitive.Portal>
                       </DropdownMenuPrimitive.Root>
                   </div>
               )}
           </nav>
        </div>

        {/* Right: Auth + Language */}
        <div className="flex items-center justify-end gap-1.5 md:gap-2 shrink-0 ml-2 md:ml-4 min-w-0">
            <div className="hidden sm:flex items-center gap-1.5 md:gap-2 shrink-0">
                <Link href="/sign-in" onClick={(e) => handleLinkClick(e, "/sign-in")}>
                <Button variant="outline" size="sm" className="px-4 text-sm whitespace-nowrap">
                    {isLoading ? "..." : <span suppressHydrationWarning>{t("nav.signin")}</span>}
                </Button>
                </Link>
            </div>
            <DropdownMenuPrimitive.Root>
             <DropdownMenuPrimitive.Trigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center ..." aria-label={t('common.selectLanguage')}>
                  <Globe className="h-4 w-4 ..."/>
                  <span className="hidden sm:inline text-xs font-medium" suppressHydrationWarning>
                    {getLanguageDisplay()}
                  </span>
                  <ChevronDown className={cn("h-3 w-3 ...")}/>
                </Button>
             </DropdownMenuPrimitive.Trigger>
                   
<DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.Content
                    sideOffset={5}
                    align="end"
                    className="origin-top-right rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-[100] w-48 focus:outline-none"
                >
                                   {languages.map((lang) => (
                      <DropdownMenuPrimitive.Item
                        key={lang.code}
                        onSelect={() => handleLanguageChange(lang.code as Language)}
                        disabled={lang.unavailable}
                        className={cn(
                            "flex items-center justify-between w-full rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                            "data-[disabled=false]:hover:bg-accent data-[disabled=false]:focus:bg-accent",
                            "cursor-pointer",
                            "data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed",
                            language === lang.code && "bg-accent font-medium",
                            "select-none"
                         )}
                        aria-label={lang.unavailable ? `${lang.name} (Unavailable)` : lang.name}
                       >
                        <div className="flex items-center gap-2">
                            <span className="text-base shrink-0">{lang.flag}</span>
                            <span suppressHydrationWarning>{lang.name}</span>
                        </div>
                        <div>
                           {lang.unavailable && <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" aria-hidden="true"/>}
                           {language === lang.code && !lang.unavailable && <Check className="h-4 w-4 text-pink-600 shrink-0" aria-hidden="true" />}
                        </div>
                      </DropdownMenuPrimitive.Item>
                    ))}
                 </DropdownMenuPrimitive.Content>
             </DropdownMenuPrimitive.Portal>
           </DropdownMenuPrimitive.Root>
          <Button variant="ghost" size="icon" className="lg:hidden ..." onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={t(mobileMenuOpen ? 'nav.menu.close' : 'nav.menu.open')} aria-expanded={mobileMenuOpen} aria-controls="mobile-menu-panel">
                {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
        </div>
      </div>
      {/* Mobile Menu Panel*/}
      {mobileMenuOpen && ( <div id="mobile-menu-panel" className="..."> {/* ... */} </div> )}
    </header>
  );
}