"use client";

import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PropertyType } from "@/types/database";
import { cn, getPropertyTypeLabel } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface HeroStickySearchProps {
  visible: boolean;
  city: string;
  propertyType: string;
  onExpand: () => void;
}

export function HeroStickySearch({
  visible,
  city,
  propertyType,
  onExpand,
}: HeroStickySearchProps) {
  const { t } = useTranslation();
  const typeLabel = propertyType
    ? getPropertyTypeLabel(propertyType as PropertyType, t)
    : t.home.allTypes;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 top-0 z-50 border-b border-surface-200/80 bg-white/90 px-4 py-3 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] backdrop-blur-xl md:hidden"
          role="region"
          aria-label={t.home.stickySearchLabel}
        >
          <button
            type="button"
            onClick={onExpand}
            className={cn(
              "mx-auto flex w-full max-w-lg items-center gap-3 rounded-full border border-surface-200/80 bg-white px-4 py-3",
              "shadow-sm transition-all duration-[250ms] hover:border-brand-200 hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70"
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
              <Search className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-start">
              <span className="block truncate text-sm font-semibold text-surface-900">
                {city || t.home.searchCityPlaceholder}
              </span>
              <span className="block truncate text-xs text-surface-500">{typeLabel}</span>
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
