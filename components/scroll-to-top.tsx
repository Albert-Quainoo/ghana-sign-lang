"use client"
import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const scrolledPathnameRef = useRef<string | null>(null);


  useEffect(() => {
    setIsMounted(true);
   
    scrolledPathnameRef.current = pathname;
  
  }, []); 

 
  useEffect(() => {
    if (!isMounted) return; 
    const hash = window.location.hash;
    
    const shouldScrollToTop = !hash && pathname !== scrolledPathnameRef.current;

    if (hash) {
  
      setTimeout(() => {
        try {
          const element = document.getElementById(hash.substring(1));
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            scrolledPathnameRef.current = pathname; // Update ref after successful hash scroll
          } else if (shouldScrollToTop) {
   
            window.scrollTo({ top: 0, behavior: 'smooth' });
            scrolledPathnameRef.current = pathname;
          }
        } catch (e) {
          console.error("Error scrolling to hash:", e);
          if (shouldScrollToTop) { 
             window.scrollTo({ top: 0, behavior: 'smooth' });
             scrolledPathnameRef.current = pathname;
          }
        }
      }, 100);
    } else if (shouldScrollToTop) {
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      scrolledPathnameRef.current = pathname; 
    }
 

  // --- FIX: Added pathname to the dependency array ---
  }, [pathname, isMounted]); 

  return null;
}