"use client";

import { motion } from "framer-motion";
import { Calendar, Eye, Heart, MapPin } from "lucide-react";
import type { Property } from "@/types/database";
import { PremiumBadgeGroup } from "@/components/ui/finaura-premium-badge";
import {
  formatDetailPrice,
  getStatusBadgeClass,
  isPremiumProperty,
} from "@/lib/property/details-display";
import { cn, formatDate, interpolate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyHeroProps {
  property: Property;
  statusLabel: string;
  featuredPosition?: number;
}

export function PropertyHero({ property, statusLabel, featuredPosition }: PropertyHeroProps) {
  const { t, locale } = useTranslation();
  const premium = isPremiumProperty(property);

  const chips = [
    {
      key: "status",
      label: statusLabel,
      className: getStatusBadgeClass(property.status),
      show: true,
    },
    {
      key: "negotiable",
      label: t.propertyDetail.negotiable,
      className: "bg-violet-50 text-violet-700 ring-violet-200/60",
      show: property.status === "for_sale" || property.status === "for_rent",
    },
    {
      key: "available",
      label: t.propertyDetail.availableNow,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
      show: property.status !== "sold",
    },
    {
      key: "verified",
      label: t.propertyDetail.verifiedListing,
      className: "bg-sky-50 text-sky-700 ring-sky-200/60",
      show: premium,
    },
    {
      key: "premium",
      label: t.propertyDetail.premiumListing,
      className: "bg-amber-50 text-amber-800 ring-amber-200/60",
      show: premium,
    },
  ].filter((chip) => chip.show);

  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative",
        premium &&
          "rounded-[24px] border border-amber-200/40 bg-gradient-to-br from-amber-50/30 via-white to-white p-6 shadow-[0_8px_32px_-12px_rgba(251,191,36,0.15)]"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {premium && <PremiumBadgeGroup homepagePosition={featuredPosition} />}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-600 ring-1 ring-surface-200/60">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          {interpolate(t.propertyDetail.publishedOn, {
            date: formatDate(property.created_at, locale),
          })}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-500 ring-1 ring-surface-200/60">
          <Eye className="h-3.5 w-3.5" aria-hidden />
          {t.propertyDetail.viewsComingSoon}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-500 ring-1 ring-surface-200/60">
          <Heart className="h-3.5 w-3.5" aria-hidden />
          {t.propertyDetail.favoritesComingSoon}
        </span>
      </div>

      <h1 className="mt-5 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
        {property.title}
      </h1>

      <p className="mt-4 flex items-start gap-2.5 text-base text-surface-600 sm:text-lg">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
        <span>
          {property.city}
          {property.state ? `, ${property.state}` : ""}
        </span>
      </p>

      <p
        className="mt-6 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl lg:hidden"
        dir={locale === "ar" ? "ltr" : undefined}
      >
        <span className="[unicode-bidi:isolate]">
          {formatDetailPrice(property.price, property.status, locale)}
        </span>
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.key}
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
              chip.className
            )}
          >
            {chip.label}
          </span>
        ))}
      </div>
    </motion.header>
  );
}
