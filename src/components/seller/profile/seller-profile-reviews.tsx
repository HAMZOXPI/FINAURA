"use client";

import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import type { SellerPublicProfile } from "@/types/database";
import { ReviewItem } from "@/components/seller/review-item";
import { ReviewSummaryPanel } from "@/components/seller/review-summary-panel";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerProfileReviewsProps {
  seller: SellerPublicProfile;
}

function ReviewsEmptyState() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-surface-200/80 bg-gradient-to-br from-surface-50 via-white to-brand-50/30 px-8 py-14 text-center shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[20px] bg-white shadow-[0_4px_20px_-6px_rgba(0,105,198,0.15)] ring-1 ring-surface-200/80">
        <MessageSquare className="h-9 w-9 text-brand-600" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-6 text-xl font-bold text-surface-900 sm:text-2xl">
        {t.seller.reviewsEmptyTitle}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-surface-500">
        {t.seller.noReviews}
      </p>
    </div>
  );
}

export function SellerProfileReviews({ seller }: SellerProfileReviewsProps) {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="seller-reviews-heading" className="scroll-mt-24">
      <h2 id="seller-reviews-heading" className="text-xl font-bold text-surface-900 sm:text-2xl">
        {t.seller.reviewsTitle}
      </h2>
      <p className="mt-2 text-surface-500">{t.seller.reviewsSubtitle}</p>

      {seller.reviewSummary.totalReviews > 0 && (
        <div className="mt-8">
          <ReviewSummaryPanel summary={seller.reviewSummary} />
        </div>
      )}

      {seller.reviews.length === 0 ? (
        <div className="mt-8">
          <ReviewsEmptyState />
        </div>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          className="mt-8 space-y-4"
        >
          {seller.reviews.map((review) => (
            <motion.div
              key={review.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <ReviewItem
                review={review}
                initiallyHelpful={seller.helpfulReviewIds.includes(review.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
