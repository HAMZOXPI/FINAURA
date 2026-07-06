"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import type { Locale } from "@/i18n/config";
import { RtlNumber } from "@/components/ui/rtl-number";

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  locale: Locale;
  duration?: number;
  className?: string;
}

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedStat({
  value,
  suffix = "",
  locale,
  duration = 1.8,
  className,
}: AnimatedStatProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      setDisplayValue(Math.round(value * easeOutExpo(progress)));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      <RtlNumber value={displayValue} suffix={suffix} locale={locale} />
    </span>
  );
}
