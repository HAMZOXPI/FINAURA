"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { setLocale } from "@/actions/locale.actions";
import { locales, type Locale } from "@/i18n/config";
import { useTranslation } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const { locale, t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
    });
  };

  const activeClass =
    variant === "dark"
      ? "bg-white/15 text-white shadow-sm"
      : "bg-white text-brand-700 shadow-sm";
  const inactiveClass =
    variant === "dark"
      ? "text-white/60 hover:text-white"
      : "text-surface-600 hover:text-surface-900";

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border p-1",
        variant === "dark" ? "border-white/10 bg-white/5" : "border-surface-200 bg-surface-50",
        isPending && "opacity-60",
        className
      )}
      aria-label={t.lang.switchLabel}
    >
      <Globe className={cn("mx-1 hidden h-4 w-4 sm:block", variant === "dark" ? "text-white/50" : "text-surface-500")} />
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          disabled={isPending}
          onClick={() => switchLocale(loc)}
          className={cn(
            "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
            locale === loc ? activeClass : inactiveClass
          )}
        >
          {loc === "fr" ? t.lang.fr : t.lang.ar}
        </button>
      ))}
    </div>
  );
}
