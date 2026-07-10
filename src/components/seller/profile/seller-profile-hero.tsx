"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Crown, MapPin, Star } from "lucide-react";
import type { Property, SellerPublicProfile } from "@/types/database";
import { VerifiedSellerBadge } from "@/components/seller/verified-badge";
import { StarRating } from "@/components/seller/star-rating";
import {
  getSellerCity,
  getSellerSubtitleKey,
  isPremiumSeller,
} from "@/lib/seller/profile-display";
import { formatDate, getInitials, interpolate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerProfileHeroProps {
  seller: SellerPublicProfile;
  listings: Property[];
}

export function SellerProfileHero({ seller, listings }: SellerProfileHeroProps) {
  const { t, locale } = useTranslation();
  const name = seller.profile.full_name ?? t.properties.defaultAgent;
  const premium = isPremiumSeller(seller, listings);
  const city = getSellerCity(listings);
  const subtitleKey = getSellerSubtitleKey(seller.profile);

  const subtitles: Record<string, string> = {
    agent: t.seller.subtitleAgent,
    private: t.seller.subtitlePrivate,
    agency: t.seller.subtitleAgency,
    admin: t.seller.subtitleAgency,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_12px_48px_-16px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:p-10"
      aria-label={name}
    >
      <div
        className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-brand-200/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -start-12 h-48 w-48 rounded-full bg-amber-200/15 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          {seller.profile.avatar_url ? (
            <Image
              src={seller.profile.avatar_url}
              alt={name}
              width={128}
              height={128}
              className="h-32 w-32 rounded-full object-cover ring-4 ring-white shadow-[0_8px_32px_-8px_rgba(0,105,198,0.25)] transition-transform duration-[250ms] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02]"
              priority
            />
          ) : (
            <span className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-50 text-4xl font-bold text-brand-700 ring-4 ring-white shadow-[0_8px_32px_-8px_rgba(0,105,198,0.25)]">
              {getInitials(name)}
            </span>
          )}
          {premium && (
            <span className="absolute -end-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg ring-2 ring-white">
              <Crown className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-start">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              {name}
            </h1>
            {seller.verification.verifiedSeller && <VerifiedSellerBadge />}
            {premium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/95 to-amber-600/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-950 ring-1 ring-amber-300/50">
                <Crown className="h-3 w-3" strokeWidth={2.25} aria-hidden />
                {t.seller.premiumSeller}
              </span>
            )}
          </div>

          <p className="mt-2 text-base font-medium text-brand-700">{subtitles[subtitleKey]}</p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-surface-500 sm:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-600" aria-hidden />
              {interpolate(t.propertyDetail.memberSince, {
                date: formatDate(seller.profile.created_at, locale),
              })}
            </span>
            {city && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand-600" aria-hidden />
                {city}
              </span>
            )}
          </div>

          {seller.reviewSummary.totalReviews > 0 ? (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <StarRating rating={seller.reviewSummary.averageRating} size="lg" />
              <span className="text-2xl font-bold text-surface-900">
                {seller.reviewSummary.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-surface-500">
                ({interpolate(t.seller.reviewsCount, { count: seller.reviewSummary.totalReviews })})
              </span>
            </div>
          ) : (
            <p className="mt-5 inline-flex items-center gap-1.5 text-sm text-surface-500">
              <Star className="h-4 w-4 text-amber-500" aria-hidden />
              {t.seller.noReviewsShort}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {seller.verification.verifiedSeller && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/60">
                {t.seller.verifiedSeller}
              </span>
            )}
            <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-500 ring-1 ring-surface-200/60">
              {t.seller.profileViewsComingSoon}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
