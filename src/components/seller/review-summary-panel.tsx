"use client";

import { motion } from "framer-motion";
import type { SellerReviewSummary } from "@/types/database";
import { StarRating } from "@/components/seller/star-rating";
import { useTranslation } from "@/i18n/locale-provider";
import { interpolate } from "@/lib/utils";

interface ReviewSummaryPanelProps {
  summary: SellerReviewSummary;
}

export function ReviewSummaryPanel({ summary }: ReviewSummaryPanelProps) {
  const { t } = useTranslation();

  if (summary.totalReviews === 0) return null;

  const categories = [
    { key: "communication", label: t.seller.communication, value: summary.communication },
    { key: "accuracy", label: t.seller.accuracy, value: summary.accuracy },
    { key: "responsiveness", label: t.seller.responsiveness, value: summary.responsiveness },
    { key: "trust", label: t.seller.trust, value: summary.trust },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="rounded-[20px] border border-surface-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-center lg:text-start">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <StarRating rating={summary.averageRating} size="lg" />
            <span className="text-3xl font-bold text-surface-900">
              {summary.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="mt-2 text-sm text-surface-500">
            {interpolate(t.seller.reviewsCount, { count: summary.totalReviews })}
          </p>
        </div>

        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <div key={category.key}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-surface-700">{category.label}</span>
                <span className="font-semibold text-surface-900">{category.value.toFixed(1)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-100">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all duration-500"
                  style={{ width: `${(category.value / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
