"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { SellerPublicProfile } from "@/types/database";
import { ReviewItem } from "@/components/seller/review-item";
import { ReviewSummaryPanel } from "@/components/seller/review-summary-panel";
import { SellerReviewForm } from "@/components/seller/seller-review-form";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerReviewsSectionProps {
  seller: SellerPublicProfile;
  propertyId?: string;
  showForm?: boolean;
}

export function SellerReviewsSection({
  seller,
  propertyId,
  showForm = true,
}: SellerReviewsSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="mt-12 border-t border-surface-200 pt-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">{t.seller.reviewsTitle}</h2>
          <p className="mt-2 text-surface-500">{t.seller.reviewsSubtitle}</p>
        </div>
        <Link
          href={`/seller/${seller.profile.id}`}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          {t.seller.viewAllReviews}
        </Link>
      </div>

      <ReviewSummaryPanel summary={seller.reviewSummary} />

      {showForm && seller.canReview && !seller.hasReviewed && (
        <div className="mt-8">
          <SellerReviewForm sellerId={seller.profile.id} propertyId={propertyId} />
        </div>
      )}

      {seller.reviews.length === 0 ? (
        <p className="mt-8 rounded-[20px] border border-dashed border-surface-300 bg-surface-50 px-6 py-10 text-center text-sm text-surface-500">
          {t.seller.noReviews}
        </p>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
          className="mt-8 space-y-4"
        >
          {seller.reviews.map((review) => (
            <motion.div
              key={review.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
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
