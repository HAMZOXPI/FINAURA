"use client";

import { motion } from "framer-motion";
import { Clock, Search, Sparkles, TrendingUp } from "lucide-react";
import type { HeroRecentSearch } from "@/lib/home/hero-search-display";
import { useTranslation } from "@/i18n/locale-provider";

interface HeroRecentSearchesProps {
  open: boolean;
  recentSearches: HeroRecentSearch[];
  onSelect: (search: HeroRecentSearch) => void;
}

export function HeroRecentSearches({ open, recentSearches, onSelect }: HeroRecentSearchesProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="absolute start-0 end-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-[20px] border border-surface-200/80 bg-white/95 p-4 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl"
      role="listbox"
      aria-label={t.home.recentSearchesTitle}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-surface-500">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        {t.home.recentSearchesTitle}
      </div>

      {recentSearches.length > 0 ? (
        <ul className="space-y-1">
          {recentSearches.map((item) => (
            <li key={`${item.city}-${item.propertyType}-${item.timestamp}`}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect(item)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-surface-800 transition-colors duration-[250ms] hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70"
              >
                <Search className="h-4 w-4 shrink-0 text-surface-400" aria-hidden />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50/80 px-4 py-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-brand-400" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-sm font-semibold text-surface-800">{t.home.recentSearchesEmpty}</p>
          <p className="mt-1 text-xs text-surface-500">{t.home.recentSearchesHint}</p>
        </div>
      )}

      <div className="mt-4 border-t border-surface-100 pt-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-surface-500">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          {t.home.trendingSearchesTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          {["Casablanca", "Marrakech", "Villa"].map((item) => (
            <span
              key={item}
              className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-500"
            >
              {item} · {t.home.comingSoon}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-surface-400">
          {t.home.savedSearchesTitle} · {t.home.comingSoon}
        </p>
      </div>
    </motion.div>
  );
}
