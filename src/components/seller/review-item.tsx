"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ThumbsUp } from "lucide-react";
import type { SellerReview } from "@/types/database";
import { toggleReviewHelpful } from "@/actions/review.actions";
import { StarRating } from "@/components/seller/star-rating";
import { formatDate, getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface ReviewItemProps {
  review: SellerReview;
  initiallyHelpful?: boolean;
}

export function ReviewItem({ review, initiallyHelpful = false }: ReviewItemProps) {
  const { t, locale } = useTranslation();
  const [helpful, setHelpful] = useState(initiallyHelpful);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [isPending, startTransition] = useTransition();

  const reviewerName = review.reviewer?.full_name ?? t.seller.anonymousReviewer;

  const handleHelpful = () => {
    startTransition(async () => {
      const result = await toggleReviewHelpful(review.id);
      if (result?.success) {
        setHelpful(Boolean(result.helpful));
        setHelpfulCount((count) => count + (result.helpful ? 1 : -1));
      }
    });
  };

  return (
    <article className="rounded-[20px] border border-surface-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {review.reviewer?.avatar_url ? (
          <Image
            src={review.reviewer.avatar_url}
            alt={reviewerName}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
            {getInitials(reviewerName)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-surface-900">{reviewerName}</p>
              <p className="text-xs text-surface-500">
                {formatDate(review.created_at, locale)}
              </p>
            </div>
            <StarRating rating={Number(review.rating)} size="sm" />
          </div>

          <p className="mt-3 text-sm leading-relaxed text-surface-600">{review.review_text}</p>

          <button
            type="button"
            disabled={isPending}
            onClick={handleHelpful}
            className={cn(
              "mt-4 inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
              helpful
                ? "border-brand-200 bg-brand-50 text-brand-700"
                : "border-surface-200 bg-white text-surface-600 hover:border-brand-200"
            )}
          >
            <ThumbsUp className={cn("h-3.5 w-3.5", helpful && "fill-current")} />
            {t.seller.helpful} ({Math.max(helpfulCount, 0)})
          </button>
        </div>
      </div>
    </article>
  );
}
