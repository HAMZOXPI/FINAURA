"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, MapPin, Sparkles, Zap } from "lucide-react";
import type { ConversationWithMeta } from "@/types/database";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { getSafePropertyImage } from "@/lib/messaging/messaging-display";
import { cn, formatPrice, getPropertyStatusLabel } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyPreviewCardProps {
  conversation: ConversationWithMeta;
  variant?: "bar" | "luxury";
  className?: string;
}

export function PropertyPreviewCard({
  conversation,
  variant = "luxury",
  className,
}: PropertyPreviewCardProps) {
  const { t, locale } = useTranslation();
  const property = conversation?.property;
  if (!property?.id) return null;

  const image = getSafePropertyImage(property?.images, PLACEHOLDER_IMAGE);
  const propertyTitle = property?.title ?? "";
  const propertyCity = property?.city ?? "";
  const propertyPrice = property?.price ?? 0;
  const propertyStatus = property?.status;

  if (variant === "bar") {
    return (
      <div className={cn("shrink-0 border-b border-white/60 bg-white/70 px-4 py-3 backdrop-blur-xl", className)}>
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl shadow-sm">
            <Image src={image} alt={propertyTitle} fill className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-surface-900">{propertyTitle}</p>
            <p className="text-sm font-bold text-brand-700">
              {formatPrice(propertyPrice, propertyStatus, locale)}
            </p>
          </div>
          {property?.id && (
          <Link
            href={`/properties/${property.id}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
          >
            {t.messaging.openListing}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "mx-4 mb-3 overflow-hidden rounded-[20px] border border-white/70",
        "bg-white/90 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.18)] backdrop-blur-xl",
        className
      )}
    >
      <div className="relative h-28 w-full">
        <Image src={image} alt={propertyTitle} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
          {propertyStatus && (
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-surface-700 backdrop-blur-sm">
            {getPropertyStatusLabel(propertyStatus, t)}
          </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-600/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            <Sparkles className="h-3 w-3" aria-hidden />
            {t.messaging.premiumBadge}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            <Zap className="h-3 w-3" aria-hidden />
            {t.messaging.boostBadge}
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-lg font-bold text-brand-700">
          {formatPrice(propertyPrice, propertyStatus, locale)}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-surface-900">{propertyTitle}</p>
        {propertyCity && (
        <p className="mt-1 flex items-center gap-1 text-xs text-surface-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {propertyCity}
        </p>
        )}
        {property?.id && (
        <Link
          href={`/properties/${property.id}`}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(0,105,198,0.55)] transition-transform hover:-translate-y-0.5"
        >
          {t.messaging.openListing}
          <ExternalLink className="h-4 w-4" />
        </Link>
        )}
      </div>
    </motion.div>
  );
}
