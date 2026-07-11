"use client";

import { useEffect } from "react";

/**
 * Ref-counted body scroll lock. Multiple BottomSheets/modals can be mounted
 * at once (e.g. one opening another); the lock is only released once every
 * consumer has released it, and the original inline style is restored
 * exactly once at the end.
 */
let lockCount = 0;
let previousOverflow: string | null = null;
let previousPaddingRight: string | null = null;

function lock() {
  if (lockCount === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    previousOverflow = document.body.style.overflow;
    previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount += 1;
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow ?? "";
    document.body.style.paddingRight = previousPaddingRight ?? "";
    previousOverflow = null;
    previousPaddingRight = null;
  }
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;

    lock();
    return () => unlock();
  }, [active]);
}
