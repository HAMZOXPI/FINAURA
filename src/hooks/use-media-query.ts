"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether a CSS media query currently matches. Used to decide when a
 * component should render its mobile-only presentation (e.g. a BottomSheet)
 * versus its desktop presentation (e.g. an inline dropdown or dialog).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** Matches Finaura's `lg` Tailwind breakpoint — below it, mobile/tablet sheets should be used. */
export function useIsMobileViewport(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}
