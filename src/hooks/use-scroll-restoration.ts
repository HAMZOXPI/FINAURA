"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const STORAGE_PREFIX = "finaura:scroll:";

/**
 * Saves and restores the window scroll position for the current
 * pathname + search params combination, using sessionStorage.
 *
 * This lets users leave a listings grid (e.g. to open a property),
 * then come back via the browser/back button or an in-app "Back" link
 * and land exactly where they left off, instead of the default
 * scroll-to-top behavior on client-side navigation.
 *
 * Purely presentational — does not touch routing, data fetching or
 * business logic.
 */
export function useScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `${STORAGE_PREFIX}${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.sessionStorage.getItem(key);
    let restoreFrame = 0;
    if (saved) {
      const y = Number(saved);
      if (Number.isFinite(y) && y > 0) {
        restoreFrame = window.requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: "auto" });
        });
      }
    }

    let saveFrame = 0;
    const handleScroll = () => {
      if (saveFrame) return;
      saveFrame = window.requestAnimationFrame(() => {
        window.sessionStorage.setItem(key, String(window.scrollY));
        saveFrame = 0;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (saveFrame) window.cancelAnimationFrame(saveFrame);
      if (restoreFrame) window.cancelAnimationFrame(restoreFrame);
    };
  }, [key]);
}
