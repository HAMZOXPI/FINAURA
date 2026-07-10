"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import type { Property, SellerPublicProfile } from "@/types/database";
import { buildPerformanceMetrics } from "@/lib/seller/profile-display";
import { cn, interpolate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerPerformanceCardProps {
  seller: SellerPublicProfile;
  listings: Property[];
}

export function SellerPerformanceCard({ seller, listings }: SellerPerformanceCardProps) {
  const { t } = useTranslation();

  const metrics = buildPerformanceMetrics(
    seller,
    listings,
    {
      listingsPublished: t.seller.perfListingsPublished,
      responseRate: t.seller.responseRate,
      listingQuality: t.seller.perfListingQuality,
      averageActivity: t.seller.perfAverageActivity,
      comingSoon: t.seller.comingSoon,
    },
    (hours) => interpolate(t.seller.withinHours, { hours })
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="performance-heading"
      className="rounded-[24px] border border-surface-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <BarChart3 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h2 id="performance-heading" className="text-xl font-bold text-surface-900 sm:text-2xl">
            {t.seller.performanceTitle}
          </h2>
          <p className="text-sm text-surface-500">{t.seller.performanceSubtitle}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="rounded-2xl border border-surface-100 bg-surface-50/50 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-600">{metric.label}</p>
              <p
                className={cn(
                  "text-lg font-bold text-surface-900",
                  metric.comingSoon && "text-sm text-surface-400"
                )}
              >
                {metric.value}
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-200/80">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${metric.percent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
