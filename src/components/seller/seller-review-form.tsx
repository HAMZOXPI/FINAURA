"use client";

import { useState, useTransition } from "react";
import { submitSellerReview } from "@/actions/review.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/seller/star-rating";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerReviewFormProps {
  sellerId: string;
  propertyId?: string;
}

export function SellerReviewForm({ sellerId, propertyId }: SellerReviewFormProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [accuracy, setAccuracy] = useState(5);
  const [responsiveness, setResponsiveness] = useState(5);
  const [trust, setTrust] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const formData = new FormData();
    formData.set("seller_id", sellerId);
    if (propertyId) formData.set("property_id", propertyId);
    formData.set("rating", String(rating));
    formData.set("communication_rating", String(communication));
    formData.set("accuracy_rating", String(accuracy));
    formData.set("responsiveness_rating", String(responsiveness));
    formData.set("trust_rating", String(trust));
    formData.set("review_text", reviewText);

    startTransition(async () => {
      const result = await submitSellerReview(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  };

  if (submitted) {
    return (
      <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-semibold text-emerald-900">{t.seller.reviewSubmitted}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[20px] border border-surface-200/80 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-bold text-surface-900">{t.seller.writeReview}</h3>
      <p className="mt-1 text-sm text-surface-500">{t.seller.reviewHint}</p>

      <div className="mt-6 space-y-5">
        <StarRatingInput value={rating} onChange={setRating} label={t.seller.overallRating} />
        <StarRatingInput
          value={communication}
          onChange={setCommunication}
          label={t.seller.communication}
        />
        <StarRatingInput value={accuracy} onChange={setAccuracy} label={t.seller.accuracy} />
        <StarRatingInput
          value={responsiveness}
          onChange={setResponsiveness}
          label={t.seller.responsiveness}
        />
        <StarRatingInput value={trust} onChange={setTrust} label={t.seller.trust} />

        <Textarea
          id="review_text"
          name="review_text"
          label={t.seller.reviewText}
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
          placeholder={t.seller.reviewPlaceholder}
          required
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <Button type="submit" className="mt-6 w-full" isLoading={isPending}>
        {t.seller.submitReview}
      </Button>
    </form>
  );
}
