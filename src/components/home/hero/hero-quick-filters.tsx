"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  Crown,
  Flame,
  Home,
  Palmtree,
  Tag,
} from "lucide-react";
import type { PropertyType } from "@/types/database";
import { QUICK_FILTER_CONFIGS, type QuickFilterId } from "@/lib/home/hero-search-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const QUICK_FILTER_ICONS: Record<QuickFilterId, typeof Flame> = {
  premium: Crown,
  maison: Home,
  appartement: Building2,
  villa: Palmtree,
  reduced: Tag,
  verified: BadgeCheck,
};

const QUICK_FILTER_LABELS: Record<QuickFilterId, string> = {
  premium: "quickFilterPremium",
  maison: "quickFilterMaison",
  appartement: "quickFilterAppartement",
  villa: "quickFilterVilla",
  reduced: "quickFilterReduced",
  verified: "quickFilterVerified",
};

interface HeroQuickFiltersProps {
  activeFilter: QuickFilterId | null;
  activePropertyType: string;
  onFilterSelect: (filterId: QuickFilterId, propertyType?: PropertyType) => void;
}

export function HeroQuickFilters({
  activeFilter,
  activePropertyType,
  onFilterSelect,
}: HeroQuickFiltersProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.42, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-4 max-md:mt-7"
    >
      <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-white/60">
        {t.home.quickFiltersTitle}
      </p>
      <div
        className="mt-3 flex flex-wrap justify-center gap-2 max-md:px-0 md:gap-2 md:overflow-x-auto md:flex-nowrap md:pb-1 md:[scrollbar-width:none] md:[-ms-overflow-style:none] md:[&::-webkit-scrollbar]:hidden"
        role="toolbar"
        aria-label={t.home.quickFiltersTitle}
      >
        <div className="flex w-full flex-wrap justify-center gap-2 max-md:px-0 md:mx-auto md:min-w-0 md:flex-nowrap md:px-1">
          {QUICK_FILTER_CONFIGS.map((filter, index) => {
            const Icon = QUICK_FILTER_ICONS[filter.id];
            const labelKey = QUICK_FILTER_LABELS[filter.id];
            const label = t.home[labelKey as keyof typeof t.home] as string;
            const isActive =
              activeFilter === filter.id ||
              (filter.propertyType && activePropertyType === filter.propertyType);

            return (
              <motion.button
                key={filter.id}
                type="button"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + index * 0.03, duration: 0.3 }}
                onClick={() => onFilterSelect(filter.id, filter.propertyType)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-[250ms]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                  isActive
                    ? "border-brand-300/80 bg-white text-brand-700 shadow-[0_4px_16px_-4px_rgba(255,255,255,0.4)]"
                    : "border-white/20 bg-white/10 text-white/90 backdrop-blur-md hover:bg-white/20",
                  filter.comingSoon && !filter.propertyType && "opacity-80"
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
                {filter.comingSoon && (
                  <span className="text-[10px] font-medium opacity-70">· {t.home.comingSoon}</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
