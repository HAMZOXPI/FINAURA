"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, Home, MessageSquare, TrendingUp } from "lucide-react";
import type { SellerPublicProfile } from "@/types/database";
import { VerifiedSellerBadge } from "@/components/seller/verified-badge";
import { StarRating } from "@/components/seller/star-rating";
import { Button } from "@/components/ui/button";
import { formatDate, getInitials, interpolate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerCardProps {
  seller: SellerPublicProfile;
  onContactSeller?: () => void;
}

export function SellerCard({ seller, onContactSeller }: SellerCardProps) {
  const { t, locale } = useTranslation();
  const name = seller.profile.full_name ?? t.properties.defaultAgent;
  const profileHref = `/seller/${seller.profile.id}`;
  const hasReviews = seller.reviewSummary.totalReviews > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-[24px] border border-surface-200/80 bg-white shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12)]"
    >
      <div className="bg-gradient-to-br from-brand-50/80 via-white to-white px-6 pb-5 pt-6">
        <div className="flex items-start gap-4">
          <Link href={profileHref} className="shrink-0">
            {seller.profile.avatar_url ? (
              <Image
                src={seller.profile.avatar_url}
                alt={name}
                width={72}
                height={72}
                className="h-[72px] w-[72px] rounded-full object-cover ring-[3px] ring-white shadow-md"
              />
            ) : (
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700 ring-[3px] ring-white shadow-md">
                {getInitials(name)}
              </span>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={profileHref}
                className="truncate text-lg font-bold text-surface-900 transition-colors hover:text-brand-700"
              >
                {name}
              </Link>
              {seller.verification.verifiedSeller && <VerifiedSellerBadge />}
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
              <p className="mt-2 text-sm text-surface-500">{t.seller.noReviewsShort}</p>
            )}

            <p className="mt-2 flex items-center gap-1.5 text-xs text-surface-500">
              <Calendar className="h-3.5 w-3.5" />
              {interpolate(t.propertyDetail.memberSince, {
                date: formatDate(seller.profile.created_at, locale),
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-surface-100 px-6 py-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-surface-500">
              {t.seller.responseRate}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-surface-900">
              <TrendingUp className="h-3.5 w-3.5 text-brand-600" />
              {Math.round(seller.stats.responseRate)}%
            </p>
          </div>
          <div className="rounded-xl bg-surface-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-surface-500">
              {t.seller.responseTime}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-surface-900">
              <Clock className="h-3.5 w-3.5 text-brand-600" />
              {interpolate(t.seller.withinHours, { hours: seller.stats.avgResponseTimeHours })}
            </p>
          </div>
          <div className="rounded-xl bg-surface-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-surface-500">
              {t.seller.totalListings}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-surface-900">
              <Home className="h-3.5 w-3.5 text-brand-600" />
              {seller.stats.totalListings}
            </p>
          </div>
          <div className="rounded-xl bg-surface-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-surface-500">
              {t.seller.totalReviews}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-surface-900">
              <MessageSquare className="h-3.5 w-3.5 text-brand-600" />
              {seller.stats.totalReviews}
            </p>
          </div>
        </div>

        {onContactSeller && (
          <Button
            type="button"
            className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm"
            onClick={onContactSeller}
          >
            {t.properties.contactSeller}
          </Button>
        )}

        <Link
          href={profileHref}
          className="inline-flex text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          {t.seller.viewProfile}
        </Link>
      </div>
    </motion.div>
  );
}
