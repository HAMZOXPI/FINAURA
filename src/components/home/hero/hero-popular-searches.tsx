"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/locale-provider";
import { getPropertyTypeLabel } from "@/lib/utils";
import {
  HERO_POPULAR_CITIES,
  HERO_POPULAR_TYPES,
} from "@/lib/home/hero-search-display";
import type { PropertyType } from "@/types/database";

interface HeroPopularSearchesProps {
  onCitySelect: (city: string) => void;
  onTypeSelect: (type: PropertyType) => void;
}

export function HeroPopularSearches({ onCitySelect, onTypeSelect }: HeroPopularSearchesProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-5 max-md:mt-7"
    >
      <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-white/70">
        {t.home.popularSearchesTitle}
      </p>
      <div
        className="mt-3 flex flex-wrap justify-center gap-2"
        role="list"
        aria-label={t.home.popularSearchesTitle}
      >
        {HERO_POPULAR_CITIES.map((city, index) => (
          <motion.button
            key={city}
            type="button"
            role="listitem"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.04, duration: 0.3 }}
            onClick={() => onCitySelect(city)}
            className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            {city}
          </motion.button>
        ))}
        {HERO_POPULAR_TYPES.map((type, index) => (
          <motion.button
            key={type}
            type="button"
            role="listitem"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.52 + index * 0.04, duration: 0.3 }}
            onClick={() => onTypeSelect(type)}
            className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            {getPropertyTypeLabel(type, t)}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
