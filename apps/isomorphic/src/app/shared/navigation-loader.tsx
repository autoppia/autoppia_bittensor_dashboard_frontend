"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const HIDE_DELAY_MS = 250;

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!isNavigating) {
      return;
    }
    const timeout = setTimeout(() => setIsNavigating(false), HIDE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams, isNavigating]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      const isExternal =
        /^https?:/i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
      if (isExternal || href.startsWith("#")) {
        return;
      }

      const currentPath = `${globalThis.window.location.pathname}${globalThis.window.location.search}`;
      if (href === currentPath) {
        return;
      }

      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!isNavigating) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div className="relative flex justify-center pt-24">
        <div className="pointer-events-auto rounded-full bg-slate-900/95 border border-emerald-500/30 px-6 py-3 shadow-xl shadow-emerald-500/20">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-white">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}