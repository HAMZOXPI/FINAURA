"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Home, MessageSquare, TrendingUp, Trophy } from "lucide-react";
import type { Property, SellerPublicProfile } from "@/types/database";
import { PropertyCard } from "@/components/properties/property-card";
import { SellerFavoriteButton } from "@/components/seller/seller-favorite-button";
import { SellerVerificationBadges } from "@/components/seller/seller-verification-badges";
import { SellerReviewsSection } from "@/components/seller/seller-reviews-section";
import { StarRating } from "@/components/seller/star-rating";
import { VerifiedSellerBadge } from "@/components/seller/verified-badge";
import { formatDate, getInitials, interpolate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerProfileViewProps {
  seller: SellerPublicProfile;
  listings: Property[];
}

export function SellerProfileView({ seller, listings }: SellerProfileViewProps) {
  const { t, locale } = useTranslation();
  const name = seller.profile.full_name ?? t.properties.defaultAgent;

  const stats = [
    {
      label: t.seller.totalListings,
      value: seller.stats.totalListings,
      icon: Home,
    },
    {
      label: t.seller.listingsSold,
      value: seller.stats.listingsSold,
      icon: Trophy,
    },
    {
      label: t.seller.responseRate,
      value: `${Math.round(seller.stats.responseRate)}%`,
      icon: TrendingUp,
    },
    {
      label: t.seller.responseTime,
      value: interpolate(t.seller.withinHours, { hours: seller.stats.avgResponseTimeHours }),
      icon: Clock,
    },
    {
      label: t.seller.totalReviews,
      value: seller.stats.totalReviews,
      icon: MessageSquare,
    },
  ];

  return (
    <div className="container-app py-8 lg:py-12">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-[24px] border border-surface-200/80 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)]"
      >
        <div className="bg-gradient-to-br from-brand-50 via-white to-white px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              {seller.profile.avatar_url ? (
                <Image
                  src={seller.profile.avatar_url}
                  alt={name}
                  width={112}
                  height={112}
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <span className="flex h-28 w-28 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700 ring-4 ring-white shadow-lg">
                  {getInitials(name)}
                </span>
              )}

              <div className="text-center sm:text-start">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
                    {name}
                  </h1>
                  {seller.verification.verifiedSeller && <VerifiedSellerBadge />}
                </div>

                <p className="mt-2 text-sm text-surface-500">
                  {interpolate(t.propertyDetail.memberSince, {
                    date: formatDate(seller.profile.created_at, locale),
                  })}
                </p>

                {seller.reviewSummary.totalReviews > 0 && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <StarRating rating={seller.reviewSummary.averageRating} size="lg" />
                    <span className="text-xl font-bold text-surface-900">
                      {seller.reviewSummary.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-surface-500">
                      ({interpolate(t.seller.reviewsCount, { count: seller.reviewSummary.totalReviews })})
                    </span>
                  </div>
                )}

                {seller.profile.bio && (
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-surface-600">
                    {seller.profile.bio}
                  </p>
                )}

                <div className="mt-5">
                  <SellerVerificationBadges verification={seller.verification} />
                </div>
              </div>
            </div>

            <SellerFavoriteButton
              sellerId={seller.profile.id}
              initialFavorited={seller.isFavorite}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-surface-100 px-6 py-6 sm:grid-cols-3 lg:grid-cols-5 sm:px-10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="rounded-2xl bg-surface-50 p-4"
            >
              <div className="flex items-center gap-2 text-surface-500">
                <stat.icon className="h-4 w-4 text-brand-600" />
                <p className="text-xs font-medium uppercase tracking-wide">{stat.label}</p>
              </div>
              <p className="mt-2 text-xl font-bold text-surface-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-surface-900">{t.seller.activeListings}</h2>
        <p className="mt-2 text-surface-500">{t.seller.activeListingsSubtitle}</p>

        {listings.length === 0 ? (
          <p className="mt-8 rounded-[20px] border border-dashed border-surface-300 bg-surface-50 px-6 py-10 text-center text-sm text-surface-500">
            {t.seller.noActiveListings}
          </p>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            {listings.map((property) => (
              <motion.div
                key={property.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <SellerReviewsSection seller={seller} showForm={false} />
    </div>
  );
}
