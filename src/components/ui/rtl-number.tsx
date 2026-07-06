"use client";

import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface RtlNumberProps {
  value: number;
  suffix?: string;
  locale?: Locale;
  className?: string;
}

/** Formats numeric stats for LTR display inside RTL pages (keeps + / % attached). */
export function formatStatNumber(
  value: number,
  locale: Locale = "fr",
  suffix = ""
): string {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "en-US" : "fr-FR", {
    maximumFractionDigits: 0,
  }).format(value);

  return `${formatted}${suffix}`;
}

export function RtlNumber({ value, suffix = "", locale = "fr", className }: RtlNumberProps) {
  return (
    <span dir="ltr" className={cn("inline-block tabular-nums [unicode-bidi:isolate]", className)}>
      {formatStatNumber(value, locale, suffix)}
    </span>
  );
}
