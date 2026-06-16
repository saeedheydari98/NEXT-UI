// hooks/useIsMobile.ts
import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const syncIsMobile = () => setIsMobile(mediaQuery.matches);

    syncIsMobile();
    mediaQuery.addEventListener("change", syncIsMobile);

    return () => mediaQuery.removeEventListener("change", syncIsMobile);
  }, [breakpoint]);

  return isMobile;
}
