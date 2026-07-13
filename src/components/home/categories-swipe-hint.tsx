"use client";

import { useCallback, useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const SWIPE_HINT_STORAGE_KEY = "finaura:categories-swipe-hint-dismissed";

interface CategoriesSwipeHintProps {
  scrollerEl: HTMLDivElement | null;
}

export function CategoriesSwipeHint({ scrollerEl }: CategoriesSwipeHintProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let stored = false;
    try {
      stored = localStorage.getItem(SWIPE_HINT_STORAGE_KEY) === "1";
    } catch {
      /* storage unavailable */
    }
    setDismissed(stored);
    setHydrated(true);
  }, []);

  const dismiss = useCallback(() => {
    setFading(true);
    try {
      localStorage.setItem(SWIPE_HINT_STORAGE_KEY, "1");
    } catch {
      /* storage unavailable */
    }
    window.setTimeout(() => setDismissed(true), 380);
  }, []);

  useEffect(() => {
    if (!scrollerEl || !isMobile || dismissed) return;

    let userInteracted = false;

    const onUserIntent = () => {
      userInteracted = true;
    };

    const onScroll = () => {
      if (userInteracted) dismiss();
    };

    scrollerEl.addEventListener("touchstart", onUserIntent, { passive: true });
    scrollerEl.addEventListener("pointerdown", onUserIntent);
    scrollerEl.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      scrollerEl.removeEventListener("touchstart", onUserIntent);
      scrollerEl.removeEventListener("pointerdown", onUserIntent);
      scrollerEl.removeEventListener("scroll", onScroll);
    };
  }, [scrollerEl, isMobile, dismissed, dismiss]);

  if (!hydrated || !isMobile || dismissed) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-full left-1/2 z-10 mb-3.5 -translate-x-1/2 translate-y-7 md:hidden",
        "transition-opacity duration-300 ease-out",
        fading ? "opacity-0" : "opacity-100"
      )}
      aria-hidden
    >
      <div className="flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/swipe-left.png"
          alt=""
          width={26}
          height={26}
          draggable={false}
          className="h-[26px] w-[26px] opacity-[0.65] animate-categories-swipe-hint"
        />
        <span className="mt-1 text-[11px] font-medium leading-none text-[#6B7280]">Swipe</span>
      </div>
    </div>
  );
}
