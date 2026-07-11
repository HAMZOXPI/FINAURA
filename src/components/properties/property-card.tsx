"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bed, Bath, Maximize, MapPin, Calendar } from "lucide-react";
import type { Property, PropertyStatus } from "@/types/database";
import type { Locale } from "@/i18n/config";
import type { PremiumDisplayMeta } from "@/types/property-display";
import { resolvePremiumMeta } from "@/types/property-display";
import { PremiumBadgeGroup } from "@/components/ui/finaura-premium-badge";
import {
  cn,
  formatArea,
  formatDate,
  getInitials,
  getPropertyStatusLabel,
} from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { PropertyCardShareButton } from "@/components/properties/property-card-share-button";
import { PropertyActionsSheet } from "@/components/properties/property-actions-sheet";
import {
  propertyPhotoLayoutId,
  propertyTitleLayoutId,
  SHARED_ELEMENT_DURATION,
} from "@/lib/properties/shared-transition";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyCardProps {
  property: Property;
  variant?: "grid" | "list";
  premiumMeta?: PremiumDisplayMeta;
  /** Marks the image as above-the-fold to avoid lazy-load frame drops on first paint. */
  priority?: boolean;
}

function formatCardPrice(price: number, status: PropertyStatus, locale: Locale): string {
  const num = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace(/\u00a0/g, " ");

  const base = `${num} DH`;
  const rentSuffix = locale === "ar" ? "/شهر" : "/mois";
  return status === "for_rent" ? `${base}${rentSuffix}` : base;
}

function statusBadgeClass(status: PropertyStatus): string {
  switch (status) {
    case "for_rent":
      return "text-brand-700";
    case "sold":
      return "text-surface-600";
    case "pending":
      return "text-amber-700";
    default:
      return "text-emerald-700";
  }
}

function getFeaturedStyles(isFeatured: boolean) {
  if (!isFeatured) {
    return {
      card: "border-surface-200/80 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.14)]",
      image: "",
      imageHover: "group-hover:scale-105",
      glow: "",
      accent: "",
    };
  }

  return {
    card: cn(
      "border-amber-300/55 ring-1 ring-amber-200/45",
      "shadow-[0_4px_28px_rgba(251,191,36,0.14),0_2px_16px_-4px_rgba(0,0,0,0.08)]",
      "[@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02]",
      "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_24px_52px_-14px_rgba(251,191,36,0.32),0_8px_24px_-8px_rgba(0,0,0,0.12)]",
      "[@media(hover:hover)_and_(pointer:fine)]:hover:ring-amber-300/60"
    ),
    image: "ring-[1.5px] ring-inset ring-amber-400/35",
    imageHover:
      "group-hover:scale-[1.03] [@media(hover:hover)_and_(pointer:fine)]:group-hover:brightness-[1.04]",
    glow: "pointer-events-none absolute -inset-px z-0 rounded-[21px] bg-gradient-to-br from-amber-400/15 via-amber-500/5 to-transparent opacity-70 transition-opacity duration-[250ms] [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100",
    accent:
      "pointer-events-none absolute inset-x-0 top-0 z-[2] h-[2px] bg-gradient-to-r from-amber-300/80 via-yellow-400/90 to-amber-400/80",
  };
}

export function PropertyCard({
  property,
  variant = "grid",
  premiumMeta,
  priority = false,
}: PropertyCardProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const statusLabel = getPropertyStatusLabel(property.status, t);
  const showDetails = property.property_type !== "terrain";
  const agentName = property.owner?.full_name ?? t.properties.defaultAgent;
  const agentAvatar = property.owner?.avatar_url;
  const detailHref = `/properties/${property.id}`;
  const isList = variant === "list";
  const isFeatured = Boolean(property.is_featured);
  const premium = resolvePremiumMeta(property, premiumMeta);
  const styles = getFeaturedStyles(isFeatured);
  const photoLayoutId = propertyPhotoLayoutId(property.id);
  const titleLayoutId = propertyTitleLayoutId(property.id);

  // Warms the destination route ahead of the tap/click so the shared-element
  // transition has real content (not just the loading skeleton) to morph into.
  const prefetchDetail = () => router.prefetch(detailHref);

  const cardMotion = isFeatured
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.5, ease: "easeOut" as const },
      }
    : {
        whileHover: { y: isList ? -2 : -4 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.25, ease: "easeOut" as const },
      };

  const badgeRow = isFeatured && premium && (
    <PremiumBadgeGroup
      variant={premium.variant ?? "premium"}
      homepagePosition={premium.homepagePosition}
    />
  );

  if (isList) {
    return (
      <motion.article
        {...cardMotion}
        onPointerEnter={prefetchDetail}
        onTouchStart={prefetchDetail}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-[20px] border bg-white transition-all duration-[250ms] sm:flex-row",
          styles.card
        )}
      >
        {isFeatured && <div className={styles.glow} aria-hidden />}
        <motion.div
          layoutId={photoLayoutId}
          transition={{ duration: SHARED_ELEMENT_DURATION, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-video w-full shrink-0 sm:aspect-auto sm:h-56 sm:w-72 md:w-80"
        >
          {isFeatured && <div className={styles.accent} aria-hidden />}
          {isFeatured && (
            <div className="pointer-events-none absolute inset-y-0 start-0 z-[1] w-1 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500" />
          )}
          <Link href={detailHref} className="block h-full w-full" tabIndex={-1} aria-hidden>
            <Image
              src={property.images[0] || PLACEHOLDER_IMAGE}
              alt={property.title}
              fill
              priority={priority}
              loading={priority ? undefined : "lazy"}
              className={cn(
                "object-cover transition-all duration-[250ms] ease-out",
                styles.image,
                styles.imageHover
              )}
              sizes="320px"
            />
          </Link>
          <div className="absolute start-3 top-3 z-10 flex flex-wrap gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm",
                statusBadgeClass(property.status)
              )}
            >
              {statusLabel}
            </span>
            {badgeRow}
          </div>
          <div className="absolute end-3 top-3 z-10">
            <FavoriteButton propertyId={property.id} variant="overlay" />
          </div>
        </motion.div>

        <div className="flex min-w-0 flex-1 flex-col p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p
                className="text-xl font-bold text-surface-900"
                dir={locale === "ar" ? "ltr" : undefined}
              >
                <span className="[unicode-bidi:isolate]">
                  {formatCardPrice(property.price, property.status, locale)}
                </span>
              </p>
              <Link href={detailHref} className="mt-1 block">
                <motion.h3
                  layoutId={titleLayoutId}
                  transition={{ duration: SHARED_ELEMENT_DURATION, ease: [0.22, 1, 0.36, 1] }}
                  className="line-clamp-2 text-lg font-semibold text-surface-900 group-hover:text-brand-700"
                >
                  {property.title}
                </motion.h3>
              </Link>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-surface-500">
                <MapPin className="h-4 w-4 shrink-0" />
                {property.city}
                {property.state ? `, ${property.state}` : ""}
              </p>
            </div>
          </div>

          {showDetails && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-surface-600">
              <span className="inline-flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-surface-400" />
                {property.bedrooms} {t.properties.bedrooms}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-surface-400" />
                {property.bathrooms} {t.properties.bathrooms}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Maximize className="h-4 w-4 text-surface-400" />
                {formatArea(property.area_sqft, locale)}
              </span>
            </div>
          )}

          <div className="mt-auto flex items-center gap-2 pt-5">
            <Link
              href={detailHref}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 sm:flex-none sm:px-8"
            >
              {t.properties.view}
            </Link>
            <div className="hidden items-center gap-2 lg:flex">
              <FavoriteButton propertyId={property.id} variant="compact" />
              <PropertyCardShareButton propertyId={property.id} title={property.title} />
            </div>
            <div className="lg:hidden">
              <PropertyActionsSheet
                propertyId={property.id}
                propertyTitle={property.title}
                sellerId={property.owner_id}
              />
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      {...cardMotion}
      onPointerEnter={prefetchDetail}
      onTouchStart={prefetchDetail}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[20px] border bg-white transition-all duration-[250ms]",
        styles.card
      )}
    >
      {isFeatured && <div className={styles.glow} aria-hidden />}
      <motion.div
        layoutId={photoLayoutId}
        transition={{ duration: SHARED_ELEMENT_DURATION, ease: [0.22, 1, 0.36, 1] }}
        className="relative aspect-video overflow-hidden"
      >
        {isFeatured && <div className={styles.accent} aria-hidden />}
        <Link href={detailHref} className="block h-full w-full" tabIndex={-1} aria-hidden>
          <Image
            src={property.images[0] || PLACEHOLDER_IMAGE}
            alt={property.title}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className={cn(
              "object-cover transition-all duration-[250ms] ease-out",
              styles.image,
              styles.imageHover
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        </Link>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100" />

        <div className="absolute start-3 top-3 z-10 flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm",
              statusBadgeClass(property.status)
            )}
          >
            {statusLabel}
          </span>
          {badgeRow}
        </div>

        <div className="absolute end-3 top-3 z-10">
          <FavoriteButton propertyId={property.id} variant="overlay" />
        </div>
      </motion.div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p
          className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl"
          dir={locale === "ar" ? "ltr" : undefined}
        >
          <span className="[unicode-bidi:isolate]">{formatCardPrice(property.price, property.status, locale)}</span>
        </p>

        <Link href={detailHref} className="mt-2 block">
          <motion.h3
            layoutId={titleLayoutId}
            transition={{ duration: SHARED_ELEMENT_DURATION, ease: [0.22, 1, 0.36, 1] }}
            className="line-clamp-2 text-base font-semibold leading-snug text-surface-900 transition-colors duration-[250ms] group-hover:text-brand-700 sm:text-lg"
          >
            {property.title}
          </motion.h3>
        </Link>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-surface-500">
          <MapPin className="h-4 w-4 shrink-0 text-surface-400" aria-hidden />
          <span className="line-clamp-1">
            {property.city}
            {property.state ? `, ${property.state}` : ""}
          </span>
        </p>

        {showDetails && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-surface-600">
            <span className="inline-flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-surface-400" aria-hidden />
              {property.bedrooms} {t.properties.bedrooms}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-surface-400" aria-hidden />
              {property.bathrooms} {t.properties.bathrooms}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Maximize className="h-4 w-4 text-surface-400" aria-hidden />
              {formatArea(property.area_sqft, locale)}
            </span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-surface-100 pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {agentAvatar ? (
              <Image
                src={agentAvatar}
                alt={agentName}
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-2 ring-white">
                {getInitials(agentName)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-surface-800">{agentName}</p>
              <p className="flex items-center gap-1 text-xs text-surface-500">
                <Calendar className="h-3 w-3 shrink-0" aria-hidden />
                {formatDate(property.created_at, locale)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={detailHref}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-[250ms] hover:bg-brand-700 hover:shadow-md"
          >
            {t.properties.view}
          </Link>
          <div className="hidden items-center gap-2 lg:flex">
            <FavoriteButton propertyId={property.id} variant="compact" />
            <PropertyCardShareButton propertyId={property.id} title={property.title} />
          </div>
          <div className="lg:hidden">
            <PropertyActionsSheet
              propertyId={property.id}
              propertyTitle={property.title}
              sellerId={property.owner_id}
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
