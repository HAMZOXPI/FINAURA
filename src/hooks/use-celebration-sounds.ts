"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  CELEBRATION_SOUND_DELAY_MS,
  getCelebrationSoundManager,
} from "@/lib/gifts/celebration-sounds";

export function useCelebrationSounds(open: boolean, notificationId: string | null) {
  const managerRef = useRef(getCelebrationSoundManager());
  const playedForIdRef = useRef<string | null>(null);
  const delayTimerRef = useRef<number | null>(null);

  useEffect(() => {
    managerRef.current.preload();
  }, []);

  useEffect(() => {
    if (delayTimerRef.current != null) {
      window.clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }

    if (!open || !notificationId) return;
    if (playedForIdRef.current === notificationId) return;

    playedForIdRef.current = notificationId;

    delayTimerRef.current = window.setTimeout(() => {
      delayTimerRef.current = null;
      managerRef.current.playCelebration();
    }, CELEBRATION_SOUND_DELAY_MS);

    return () => {
      if (delayTimerRef.current != null) {
        window.clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, [open, notificationId]);

  const playClick = useCallback(() => {
    managerRef.current.playClick();
  }, []);

  return { playClick };
}
