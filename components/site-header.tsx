"use client";

// Core React/Next imports
import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, type MouseEvent, useRef, useCallback, useMemo, JSX } from "react";

// Radix UI Dropdown
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

// Lucide Icons
import {
  Headphones, Menu, X, ChevronDown, Globe, Check, BookOpen, Users, Languages, Briefcase, Home, Info, MessageSquare, AlertCircle, LogOut, User
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Utils & Contexts
import { cn } from "@/lib/utils";
import { useLanguage, type Language } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";

// Firebase Imports
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/config";
import { doc, getDoc } from "firebase/firestore";

// --- Types ---
interface UserType {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
}

interface LanguageOption {
  code: Language | string;
  name: string;
  flag: string;
  unavailable?: boolean;
}

const languages: LanguageOption[] = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "tw", name: "Twi", flag: "🇬🇭"},
    { code: "ar", name: "العربية", flag: "🇪🇬" },
];

interface DropdownItem {
    key: string;
    label: string;
    description: string;
    href: string;
    "aria-label"?: string;
}
interface NavItem {
    key: string;
    href: string;
    label: string;
    icon: React.ElementType;
    hasDropdown: boolean;
    dropdown?: DropdownItem[];
    isSecondary?: boolean;
}

const initialNavItems: NavItem[] = [
  { key: "home", href: "/", label: "Home", icon: Home, hasDropdown: false },
  {
    key: "learn", href: "/learn", label: "Learn", icon: BookOpen, hasDropdown: true,
    dropdown: [
      { key: "lessons", label: "Lessons", description: "Structured learning path", href: "/learn?tab=lessons#lessons" },
      { key: "practice", label: "Practice", description: "Interactive practice exercises", href: "/learn?tab=practice#practice", },
      { key: "resources", label: "Resources", description: "Learning materials and guides", href: "/learn?tab=resources#resources", },
      { key: "dictionary", label: "Dictionary", description: "Look up signs", href: "/learn?tab=dictionary#dictionary", },
    ],
  },
  {
    key: "family", href: "/family-orientation", label: "Family Orientation", icon: Users, hasDropdown: true,
    dropdown: [
      { key: "parents", label: "For Parents", description: "Resources for parents", href: "/family-orientation#parents", },
      { key: "children", label: "For Children", description: "Fun learning for kids", href: "/family-orientation#children", },
      { key: "support", label: "Support Network", description: "Connect with others", href: "/family-orientation#support", },
    ],
  },
  {
    key: "translator", href: "/translator", label: "Translator", icon: Languages, hasDropdown: true,
    dropdown: [
      { key: "text", label: "Text Translator", description: "Translate text to signs", href: "/translator" },
      { key: "learn", label: "Want to Learn GSL?", description: "Explore learning resources", href: "/translator#learn-gsl", },
    ],
  },
  {
    key: "careers", href: "/careers-scholarships", label: "Careers & Scholarships", icon: Briefcase, hasDropdown: true, isSecondary: true,
    dropdown: [
      { key: "careers", label: "Interpreter Careers", description: "Become a GSL interpreter", href: "/careers-scholarships#interpreter-careers", },
      { key: "scholarships", label: "Scholarships", description: "Financial support", href: "/careers-scholarships#scholarships", },
      { key: "development", label: "Professional Development", description: "Grow your skills", href: "/careers-scholarships#development", },
      { key: "opportunities", label: "Career Opportunities", description: "Jobs in GSL", href: "/careers-scholarships#opportunities", },
    ],
  },
  { key: "about", href: "/about", label: "About Us", icon: Info, hasDropdown: false, isSecondary: true },
  { key: "community", href: "/message-board", label: "Message Board", icon: MessageSquare, hasDropdown: false, isSecondary: true, },
];

// --- Helper Functions ---
const handleSmoothScrollInternal = (
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  currentPathname: string | null,
  closeMobileMenu?: () => void,
) => {
  const url = new URL(href, window.location.origin);
  const targetPathname = url.pathname;
  const targetHash = url.hash;
  if (currentPathname === targetPathname && targetHash) {
    event.preventDefault();
    const elementId = targetHash.substring(1);
    const element = document.getElementById(elementId);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    else console.warn(`Smooth scroll target element with ID "${elementId}" not found.`);
  }
  closeMobileMenu?.();
};

const NavLinkTrigger = ({
  item,
  isActive,
  handleLinkClick,
}: {
  item: NavItem
  isActive: (path: string) => boolean
  handleLinkClick: (event: MouseEvent<HTMLAnchorElement>, href: string) => void
}): JSX.Element => {
  if (item.hasDropdown) {
    return (
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild>
          <button
            className={cn(
              "group inline-flex h-9 items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap data-[state=open]:bg-accent/50",
              isActive(item.href)
                ? "text-pink-600 font-semibold"
                : "text-foreground/60 hover:text-foreground/80 hover:bg-accent/50",
            )}
            aria-label={item.label}
          >
            <item.icon className="h-4 w-4 mr-1 shrink-0" aria-hidden="true" />
            <span suppressHydrationWarning>{item.label}</span>
            <ChevronDown
              className={cn("h-3 w-3 opacity-50 ml-1 shrink-0 transition-transform group-data-[state=open]:rotate-180")}
              aria-hidden="true"
            />
          </button>
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuContent sideOffset={5} align="start" className="w-64 z-[100] border-none shadow-md">
          {item.dropdown?.map((dropdownItem) => (
            <DropdownMenuItem key={dropdownItem.key} asChild>
              <Link
                href={dropdownItem.href}
                onClick={(e) => handleLinkClick(e, dropdownItem.href)}
                className="flex flex-col w-full cursor-pointer select-none outline-none p-2"
                aria-label={dropdownItem["aria-label"] || `${dropdownItem.label}: ${dropdownItem.description}`}
              >
                <span className="font-medium text-sm" suppressHydrationWarning>{dropdownItem.label}</span>
                <span className="text-xs text-muted-foreground" suppressHydrationWarning>{dropdownItem.description}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPrimitive.Root>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={(e) => handleLinkClick(e, item.href)}
      className={cn(
        "group inline-flex h-9 items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap",
        isActive(item.href)
          ? "text-pink-600 font-semibold"
          : "text-foreground/60 hover:text-foreground/80 hover:bg-accent/50",
      )}
      aria-current={isActive(item.href) ? "page" : undefined}
    >
      <item.icon className="h-4 w-4 mr-1 shrink-0" aria-hidden="true" />
      <span suppressHydrationWarning>{item.label}</span>
    </Link>
  );
};

// --- Component ---
export function SiteHeader({ className }: { className?: string }) {
  const currentPathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, language, setLanguage} = useLanguage();
  const { user: authUser, loading: authLoading } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [profileData, setProfileData] = useState<{ name?: string } | null>(null);

  const user = authUser as UserType | null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setNavItems((prevItems) =>
      prevItems.map((item) => {
        const updatedItem = { ...item, label: t(`nav.${item.key}`) || item.label };
        if (item.hasDropdown && item.dropdown) {
          updatedItem.dropdown = item.dropdown.map((d) => ({
            ...d,
            label: t(`nav.${item.key}.${d.key}`) || d.label,
            description: t(`nav.${item.key}.${d.key}.desc`) || d.description,
            "aria-label": t(`nav.${item.key}.${d.key}`) || d.label,
          }));
        }
        return updatedItem;
      }),
    );
  }, [t, language]);

  useEffect(() => {
    const fetchName = async () => {
        if (user?.uid && !user.displayName && !profileData?.name) {
            const userDocRef = doc(db, "users", user.uid);
            try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    setProfileData(docSnap.data() as { name?: string });
                } else {
                    console.log("No profile data found for header name fallback.");
                }
            } catch (error) {
                console.error("Error fetching profile name for header:", error);
            }
        } else if (user && user.displayName) {
            if (!profileData || profileData.name !== user.displayName) {
                setProfileData({ name: user.displayName });
            }
        } else if (!user) {
            setProfileData(null);
        }
    };
    if (!authLoading) {
        fetchName();
    }
  }, [user, authLoading, profileData]);

  const isActive = useCallback(
    (path: string): boolean => {
      if (!currentPathname) return false;
      const cleanCurrentPath = currentPathname.split(/[?#]/)[0];
      const cleanPath = path.split(/[?#]/)[0];
      if (cleanPath === "/") {
        return cleanCurrentPath === "/";
      }
      return cleanCurrentPath.startsWith(cleanPath);
    },
    [currentPathname],
  );

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const handleLinkClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      handleSmoothScrollInternal(event, href, currentPathname, closeMobileMenu);
    },
    [currentPathname, closeMobileMenu],
  );

  const getLanguageDisplay = useCallback((): string => {
    const langObj = languages.find((l) => l.code === language);
    return langObj ? `${langObj.flag} ${langObj.code.toUpperCase()}` : "🇬🇧 EN";
  }, [language]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    closeMobileMenu();
  };

  useEffect(() => {
    closeMobileMenu();
  }, [currentPathname, closeMobileMenu]);

  const primaryNavItems = useMemo(() => navItems.filter((item) => !item.isSecondary), [navItems]);
  const secondaryNavItems = useMemo(() => navItems.filter((item) => item.isSecondary), [navItems]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
      closeMobileMenu();
    } catch (error) {
      console.error("Sign out error", error);
    }
  };
  const getInitials = (name?: string | null): string => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  };
  const getFirstName = (authName?: string | null, profileName?: string | null): string => {
    const nameToUse = authName || profileName;
    if (!nameToUse) return "User";
    return nameToUse.split(" ")[0];
  };
  const userDisplayNameOrEmail = useMemo((): string => {
    if (!user) return "";
    return user.displayName || profileData?.name || user.email || "Account";
  }, [user, profileData]);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-200",
        scrolled && "shadow-sm",
        className,
      )}
    >
      <div className="flex h-14 max-w-screen-2xl items-center justify-between mx-auto px-4 min-w-0">
        <div className="flex items-center shrink-0 mr-4">
          <Link
            href="/"
            className="flex items-center space-x-2 min-w-fit"
            onClick={(e) => handleLinkClick(e, "/")}
            aria-label="Signed-in Home Page"
          >
            <Headphones className="h-6 w-6 text-pink-500 shrink-0" />
            <span className="font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent hidden md:inline whitespace-nowrap">
              Signed-in
            </span>
          </Link>
        </div>

        <div className="flex flex-1 justify-center items-center min-w-0 px-2 md:px-4">
          <nav ref={navRef} className={cn("hidden lg:flex items-center", "gap-1", "flex-nowrap")} aria-label="Main navigation">
            {primaryNavItems.map((item) => ( <NavLinkTrigger key={item.key} item={item} isActive={isActive} handleLinkClick={handleLinkClick} /> ))}
            {secondaryNavItems.map((item) => ( <div key={item.key} className="hidden xl:inline-flex items-center"> <NavLinkTrigger item={item} isActive={isActive} handleLinkClick={handleLinkClick} /> </div> ))}
            {secondaryNavItems.length > 0 && (
              <div className="hidden lg:inline-flex xl:hidden items-center">
                <DropdownMenuPrimitive.Root>
                  <DropdownMenuPrimitive.Trigger asChild>
                    <button className={cn("group inline-flex h-9 items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap text-foreground/60 hover:text-foreground/80 hover:bg-accent/50 data-[state=open]:bg-accent/50")} aria-label="More navigation items">
                      <span className="sr-only">More</span>
                      <Menu className="h-4 w-4" />
                    </button>
                  </DropdownMenuPrimitive.Trigger>
                  <DropdownMenuContent sideOffset={5} align="end" className="min-w-[180px] z-[100] border-none shadow-md">
                    {secondaryNavItems.map((sItem) => (
                      <DropdownMenuItem key={sItem.key} asChild>
                        <Link href={sItem.href} onClick={(e) => handleLinkClick(e, sItem.href)} className={cn("flex items-center w-full cursor-pointer select-none outline-none p-2", isActive(sItem.href) ? "text-pink-600 font-semibold" : "text-foreground")}>
                          <sItem.icon className="h-4 w-4 mr-2 text-foreground/60" aria-hidden="true" />
                          <span suppressHydrationWarning>{sItem.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenuPrimitive.Root>
              </div>
            )}
          </nav>
        </div>

        <div className="flex items-center justify-end gap-1.5 md:gap-2 shrink-0 ml-2 md:ml-4 min-w-0">
          <div className="hidden sm:flex items-center gap-1.5 md:gap-2 shrink-0">
             {authLoading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md"></div>
             ) : user ? (
                 <DropdownMenuPrimitive.Root>
                    <DropdownMenuPrimitive.Trigger asChild>
                        <button className="flex items-center gap-2 px-2 text-sm rounded-lg hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:bg-accent/50 h-9 focus:outline-none">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={user.photoURL || undefined} alt={userDisplayNameOrEmail} />
                                <AvatarFallback className="text-xs">{getInitials(userDisplayNameOrEmail)}</AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[100px]">
                            <span suppressHydrationWarning>{`${t("nav.user.greetingPrefix") ?? 'Hi,'} ${getFirstName(user.displayName, profileData?.name)}`}</span>
                              </span>
                            <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                        </button>
                    </DropdownMenuPrimitive.Trigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal px-2 py-1.5">
                            <div className="flex flex-col space-y-0.5">
                                <p className="text-sm font-medium leading-none truncate">{userDisplayNameOrEmail}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="flex items-center cursor-pointer w-full">
                                <User className="mr-2 h-4 w-4" /> 
                                <span suppressHydrationWarning>{t("nav.user.profile") ?? "Profile"}</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="flex items-center cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 w-full">
                            <LogOut className="mr-2 h-4 w-4" /> 
                            <span suppressHydrationWarning >{t("nav.user.signout") ?? "Sign Out"}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenuPrimitive.Root>
             ) : (
                 <Link href="/sign-in" onClick={(e) => handleLinkClick(e, "/sign-in")}>
                    <Button variant="outline" size="sm" className="px-4 text-sm whitespace-nowrap">
                        <span suppressHydrationWarning>{t("nav.signin") || "Sign In"}</span>
                    </Button>
                 </Link>
             )}
          </div>

          <DropdownMenuPrimitive.Root>
            <DropdownMenuPrimitive.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 px-2 text-sm rounded-lg hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:bg-accent/50"
                aria-label={t("common.selectLanguage") || "Select language"}
              >
                <span className="flex items-center gap-1" suppressHydrationWarning>
                  <Globe className="h-4 w-4 text-pink-500 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-medium">{getLanguageDisplay()}</span>
                </span>
              </Button>
            </DropdownMenuPrimitive.Trigger>
            <DropdownMenuContent sideOffset={5} align="end" className="w-48 z-[200]">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onSelect={() => !lang.unavailable && handleLanguageChange(lang.code as Language)}
                  disabled={lang.unavailable}
                  className={cn(
                    "flex items-center justify-between w-full rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                    "data-[disabled=false]:hover:bg-accent data-[disabled=false]:focus:bg-accent data-[disabled=false]:cursor-pointer",
                    "data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed",
                    language === lang.code && "bg-accent font-medium",
                    "select-none",
                  )}
                  aria-label={lang.unavailable ? `${lang.name} (Unavailable)` : lang.name}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-base shrink-0">{lang.flag}</span>
                    <span suppressHydrationWarning>{lang.name}</span>
                  </div>
                  <div className="ml-2 shrink-0">
                    {lang.unavailable && <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" aria-hidden="true" />}
                    {language === lang.code && !lang.unavailable && <Check className="h-4 w-4 text-pink-600 shrink-0" aria-hidden="true" />}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuPrimitive.Root>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-lg hover:bg-accent/50 shrink-0"
            onClick={toggleMobileMenu}
            aria-label={t(mobileMenuOpen ? "nav.menu.close" : "nav.menu.open") || (mobileMenuOpen ? "Close menu" : "Open menu")}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu-panel"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-menu-panel"
          className="fixed lg:hidden inset-0 top-14 z-[90] bg-pink-50/95 backdrop-blur-md border-t overflow-y-auto"
          style={{ height: "calc(100vh - 3.5rem)" }}
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col h-full max-h-[calc(100vh-3.5rem)]">
             <div className="flex items-center justify-between px-4 py-3 border-b border-pink-200/60 shrink-0 bg-white/50 sticky top-0 z-10">
                {authLoading ? (
                    <div className="h-8 w-full bg-gray-200 animate-pulse rounded-md"></div>
                ) : user ? (
                    <div className="flex items-center justify-between w-full gap-2">
                         <Link href="/profile" className="flex items-center gap-2 overflow-hidden flex-1" onClick={closeMobileMenu}>
                            <div className="relative h-8 w-8 shrink-0">
                            <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={user.photoURL || undefined} alt={userDisplayNameOrEmail} />
                            <AvatarFallback className="text-xs">{getInitials(userDisplayNameOrEmail)}</AvatarFallback>
                            </Avatar>
                            </div>
                            <div className="text-sm flex-1 overflow-hidden">
                                <div className="font-medium truncate">{userDisplayNameOrEmail}</div>
                                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                            </div>
                         </Link>
                         <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSignOut();
                            }}
                            className="text-red-600 hover:bg-red-50 shrink-0 px-3"
                         >
                            <span suppressHydrationWarning>{t("nav.user.signout") ?? "Sign Out"}</span>
                         </Button>
                    </div>
                ) : (
                     <>
                        <Link href="/sign-in" className="w-full max-w-[200px]" onClick={(e) => handleLinkClick(e, "/sign-in")}>
                            <Button variant="outline" size="sm" className="w-full text-sm bg-white">
                                <span suppressHydrationWarning>{t("nav.signin") || "Sign In"}</span>
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="lg:hidden rounded-lg hover:bg-accent/50 shrink-0 ml-2" onClick={toggleMobileMenu} aria-label={t("nav.menu.close") || "Close menu"}> <X className="h-5 w-5" /> </Button>
                    </>
                )}
             </div>

            <nav className="flex-1 px-4 py-2 min-w-0 overflow-y-auto" aria-label="Main mobile navigation">
              {navItems.length === 0 && <p className="text-center text-muted-foreground py-4">Loading navigation...</p>}
              {navItems.map((item) => (
                <div key={item.key} className="mb-2">
                  {item.hasDropdown ? (
                    <div>
                      <Link
                        href={item.href}
                        className={cn("flex items-center w-full rounded-md p-3 text-base font-medium hover:bg-pink-100/50", isActive(item.href) ? "text-pink-600 font-semibold" : "text-gray-700")}
                        onClick={(e) => handleLinkClick(e, item.href)}
                      >
                        <item.icon className="h-5 w-5 mr-3 text-pink-500" aria-hidden="true" />
                        <span className="truncate" suppressHydrationWarning>{item.label}</span>
                      </Link>
                      <div className="pl-11 mt-1 space-y-1 border-l border-pink-200 ml-3">
                        {item.dropdown?.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.key}
                            href={dropdownItem.href}
                            className="flex flex-col py-2 px-3 rounded-md hover:bg-pink-100/50"
                            onClick={(e) => handleLinkClick(e, dropdownItem.href)}
                          >
                            <span className="font-medium text-sm text-gray-700" suppressHydrationWarning>{dropdownItem.label}</span>
                            <span className="text-xs text-gray-500" suppressHydrationWarning>{dropdownItem.description}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn("flex items-center w-full rounded-md p-3 text-base font-medium hover:bg-pink-100/50", isActive(item.href) ? "text-pink-600 font-semibold" : "text-gray-700")}
                      onClick={(e) => handleLinkClick(e, item.href)}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      <item.icon className="h-5 w-5 mr-3 text-pink-500" aria-hidden="true" />
                      <span className="truncate" suppressHydrationWarning>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
                {user && (
                    <>
                        <div className="mt-4 pt-4 border-t border-pink-200/60">
                             <Link
                                href="/profile"
                                className={cn("flex items-center w-full rounded-md p-3 text-base font-medium hover:bg-pink-100/50 text-gray-700")}
                                onClick={(e) => handleLinkClick(e, "/profile")}
                                >
                                <User className="h-5 w-5 mr-3 text-pink-500" aria-hidden="true" />
                                <span suppressHydrationWarning className="truncate">{t("nav.user.profile") ?? "Profile"}</span>
                            </Link>
                        </div>
                        <div>
                            <button
                                className={cn("flex items-center w-full rounded-md p-3 text-base font-medium hover:bg-pink-100/50 text-red-600")}
                                onClick={handleSignOut}
                                >
                                <LogOut className="h-5 w-5 mr-3 text-red-500" aria-hidden="true" />
                                <span suppressHydrationWarning className="truncate">{t("nav.user.signout") ?? "Sign Out"}</span>
                             </button>
                        </div>
                    </>
                 )}
            </nav>

            {isActive("/learn") && (
              <div className="grid grid-cols-4 border-t border-pink-200/60 bg-white/70 text-center mt-auto">
                <Link
                  href="/learn?tab=lessons#lessons"
                  className={cn("py-3 px-1 text-xs font-medium border-t-2", currentPathname?.includes("lessons") ? "border-pink-500 text-pink-600" : "border-transparent text-gray-600")}
                  onClick={closeMobileMenu}
                >
                  Lessons
                </Link>
                <Link
                  href="/learn?tab=practice#practice"
                  className={cn("py-3 px-1 text-xs font-medium border-t-2", currentPathname?.includes("practice") ? "border-pink-500 text-pink-600" : "border-transparent text-gray-600")}
                   onClick={closeMobileMenu}
                >
                  Practice
                </Link>
                <Link
                  href="/learn?tab=resources#resources"
                  className={cn("py-3 px-1 text-xs font-medium border-t-2", currentPathname?.includes("resources") ? "border-pink-500 text-pink-600" : "border-transparent text-gray-600")}
                   onClick={closeMobileMenu}
                >
                  Resources
                </Link>
                <Link
                  href="/learn?tab=dictionary#dictionary"
                  className={cn("py-3 px-1 text-xs font-medium border-t-2", currentPathname?.includes("dictionary") ? "border-pink-500 text-pink-600" : "border-transparent text-gray-600")}
                   onClick={closeMobileMenu}
                >
                  Dictionary
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}