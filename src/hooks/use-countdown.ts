"use client";

import { useEffect, useState } from "react";

export interface CountdownParts {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calculateRemaining(targetDate: string | null): CountdownParts {
  if (!targetDate) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const totalMs = new Date(targetDate).getTime() - Date.now();

  if (totalMs <= 0) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const seconds = Math.floor((totalMs / 1000) % 60);

  return { totalMs, days, hours, minutes, seconds, expired: false };
}

export function useCountdown(targetDate: string | null): CountdownParts {
  const [remaining, setRemaining] = useState(() => calculateRemaining(targetDate));

  useEffect(() => {
    setRemaining(calculateRemaining(targetDate));
    if (!targetDate) return;

    const interval = window.setInterval(() => {
      setRemaining(calculateRemaining(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  return remaining;
}

export function padCountdown(value: number): string {
  return value.toString().padStart(2, "0");
}
