import { useEffect, useState, useRef } from "react";

export const useScrollHeaderHide = (threshold = 80) => {
  const [hide, setHide] = useState(false);
  const lastScrollY = useRef(0);
  const rafId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) return;
      
      rafId.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY <= 0) {
          setHide(false);
        } 
        else if (currentScrollY > threshold && currentScrollY > lastScrollY.current) {
          setHide(true);
        } 
        else if (currentScrollY < lastScrollY.current) {
          setHide(false);
        }
        
        lastScrollY.current = currentScrollY;
        rafId.current = undefined;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [threshold]);

  return hide;
};