"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Crown,
  Home,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import type { SellerPublicProfile } from "@/types/database";
import { VerifiedSellerBadge } from "@/components/seller/verified-badge";
import { StarRating } from "@/components/seller/star-rating";
import { Button } from "@/components/ui/button";
import { formatDate, getInitials, interpolate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertySellerCardProps {
  seller: SellerPublicProfile;
  onContactSeller?: () => void;
  isPremiumListing?: boolean;
}

export function PropertySellerCard({
  seller,
  onContactSeller,
  isPremiumListing = false,
}: PropertySellerCardProps) {
  const { t, locale } = useTranslation();
  const name = seller.profile.full_name ?? t.properties.defaultAgent;
  const profileHref = `/seller/${seller.profile.id}`;
  const hasReviews = seller.reviewSummary.totalReviews > 0;

  const stats = [
    {
      key: "response-rate",
      label: t.seller.responseRate,
      value: `${Math.round(seller.stats.responseRate)}%`,
      icon: TrendingUp,
    },
    {
      key: "response-time",
      label: t.seller.responseTime,
      value: interpolate(t.seller.withinHours, { hours: seller.stats.avgResponseTimeHours }),
      icon: Clock,
    },
    {
      key: "listings",
      label: t.seller.totalListings,
      value: String(seller.stats.totalListings),
      icon: Home,
    },
    {
      key: "reviews",
      label: t.seller.totalReviews,
      value: hasReviews
        ? String(seller.stats.totalReviews)
        : t.propertyDetail.reviewsComingSoon,
      icon: MessageSquare,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-[24px] border border-surface-200/80 bg-white shadow-[0_12px_40px_-14px_rgba(0,0,0,0.12)] transition-shadow duration-[250ms] [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_20px_48px_-14px_rgba(0,105,198,0.15)]"
    >
      <div className="relative bg-gradient-to-br from-brand-50/70 via-white to-amber-50/20 px-6 pb-6 pt-6">
        {isPremiumListing && (
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300/80 via-yellow-400/90 to-amber-400/80" aria-hidden />
        )}

        <div className="flex items-start gap-4">
          <Link href={profileHref} className="group shrink-0">
            {seller.profile.avatar_url ? (
              <Image
                src={seller.profile.avatar_url}
                alt={name}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover ring-[3px] ring-white shadow-lg transition-transform duration-[250ms] group-hover:scale-105"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700 ring-[3px] ring-white shadow-lg transition-transform duration-[250ms] group-hover:scale-105">
                {getInitials(name)}
              </span>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={profileHref}
                className="truncate text-xl font-bold text-surface-900 transition-colors duration-[250ms] hover:text-brand-700"
              >
                {name}
              </Link>
              {seller.verification.verifiedSeller && <VerifiedSellerBadge />}
              {isPremiumListing && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/95 to-amber-600/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950 ring-1 ring-amber-300/50">
                  <Crown className="h-3 w-3" strokeWidth={2.25} aria-hidden />
                  {t.properties.premiumBadge}
                </span>
              )}
            </div>

            {hasReviews ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StarRating rating={seller.reviewSummary.averageRating} />
                <span className="text-sm font-bold text-surface-900">
                  {seller.reviewSummary.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-surface-500">
                  ({interpolate(t.seller.reviewsCount, { count: seller.reviewSummary.totalReviews })})
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-surface-500">{t.propertyDetail.reviewsComingSoon}</p>
            )}

            <p className="mt-2 flex items-center gap-1.5 text-xs text-surface-500">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {interpolate(t.propertyDetail.memberSince, {
                date: formatDate(seller.profile.created_at, locale),
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-surface-100 px-6 py-5">
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ key, label, value, icon: Icon }) => (
            <div
              key={key}
              className="rounded-xl border border-surface-100 bg-surface-50/80 px-3 py-2.5 transition-colors duration-[250ms] hover:border-brand-100 hover:bg-brand-50/30"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-500">
                {label}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm font-bold text-surface-900">
                <Icon className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden />
                <span className="truncate">{value}</span>
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-surface-400">{t.propertyDetail.salesComingSoon}</p>

        {onContactSeller && (
          <Button
            type="button"
            className="h-12 w-full rounded-xl text-sm font-semibold shadow-[0_4px_16px_-4px_rgba(0,105,198,0.4)] transition-all duration-[250ms] hover:shadow-[0_8px_24px_-6px_rgba(0,105,198,0.45)]"
            onClick={onContactSeller}
          >
            {t.properties.contactSeller}
          </Button>
        )}

        <Link
          href={profileHref}
          className="flex h-11 w-full items-center justify-center rounded-xl border border-surface-200 bg-white text-sm font-semibold text-brand-700 transition-all duration-[250ms] hover:border-brand-200 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2"
        >
          {t.seller.viewProfile}
        </Link>
      </div>
    </motion.div>
  );
}
