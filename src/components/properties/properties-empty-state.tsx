"use client";

import { motion } from "framer-motion";
import { Building2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertiesEmptyStateProps {
  onClear?: () => void;
}

export function PropertiesEmptyState({ onClear }: PropertiesEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center rounded-[20px] border border-dashed border-surface-300 bg-gradient-to-b from-surface-50 to-white px-6 py-16 text-center sm:py-20"
    >
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-brand-50 text-brand-600 shadow-[0_8px_24px_-8px_rgba(0,105,198,0.25)]">
          <Building2 className="h-11 w-11" strokeWidth={1.5} />
        </div>
        <span className="absolute -bottom-1 -end-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-surface-100 text-surface-500">
          <SearchX className="h-4 w-4" />
        </span>
      </div>
      <h3 className="text-xl font-bold text-surface-900">{t.properties.noResults}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-surface-500">
        {t.properties.noResultsHint}
      </p>
      {onClear ? (
        <Button type="button" variant="outline" className="mt-8" onClick={onClear}>
          {t.filters.clear}
        </Button>
      ) : (
        <Button href="/properties" variant="outline" className="mt-8">
          {t.filters.clear}
        </Button>
      )}
    </motion.div>
  );
}
