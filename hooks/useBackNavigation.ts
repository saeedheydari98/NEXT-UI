"use client";

import { usePathname, useRouter } from "next/navigation";

export function useBackNavigation(fallbackHref = "/") {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return {
    goBack,
    showBackButton: !isHome,
  };
}
