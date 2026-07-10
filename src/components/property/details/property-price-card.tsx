"use client";

import { motion } from "framer-motion";
import type { Property, PropertyStatus } from "@/types/database";
import type { Locale } from "@/i18n/config";
import { formatDetailPrice, getStatusBadgeClass } from "@/lib/property/details-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyPriceCardProps {
  property: Property;
  statusLabel: string;
  className?: string;
}

export function PropertyPriceCard({ property, statusLabel, className }: PropertyPriceCardProps) {
  const { t, locale } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-[24px] border border-surface-200/80 bg-white p-6",
        "shadow-[0_8px_32px_-12px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-500">
        {t.propertyDetail.priceLabel}
      </p>
      <p
        className="mt-2 text-3xl font-bold tracking-tight text-surface-900"
        dir={locale === "ar" ? "ltr" : undefined}
      >
        <span className="[unicode-bidi:isolate]">
          {formatDetailPrice(property.price, property.status, locale)}
        </span>
      </p>
      <span
        className={cn(
          "mt-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
          getStatusBadgeClass(property.status)
        )}
      >
        {statusLabel}
      </span>
      <p className="mt-4 text-sm leading-relaxed text-surface-500">{t.propertyDetail.priceHint}</p>
    </motion.div>
  );
}

export function formatCompactPrice(price: number, status: PropertyStatus, locale: Locale): string {
  return formatDetailPrice(price, status, locale);
}
