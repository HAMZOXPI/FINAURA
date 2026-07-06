"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitSellerReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required" };

  const sellerId = formData.get("seller_id") as string;
  const propertyId = (formData.get("property_id") as string) || null;
  const rating = Number(formData.get("rating"));
  const communicationRating = Number(formData.get("communication_rating"));
  const accuracyRating = Number(formData.get("accuracy_rating"));
  const responsivenessRating = Number(formData.get("responsiveness_rating"));
  const trustRating = Number(formData.get("trust_rating"));
  const reviewText = (formData.get("review_text") as string)?.trim();

  if (!sellerId || user.id === sellerId) {
    return { error: "Invalid seller" };
  }

  if (
    !Number.isFinite(rating) ||
    rating < 1 ||
    rating > 5 ||
    [communicationRating, accuracyRating, responsivenessRating, trustRating].some(
      (value) => !Number.isFinite(value) || value < 1 || value > 5
    )
  ) {
    return { error: "Invalid rating" };
  }

  if (!reviewText || reviewText.length < 10) {
    return { error: "Review text is too short" };
  }

  const { data: inquiries } = await supabase
    .from("contact_inquiries")
    .select("id, property:properties(owner_id)")
    .eq("sender_id", user.id);

  const hasContacted = inquiries?.some(
    (row) => (row as { property?: { owner_id?: string } }).property?.owner_id === sellerId
  );

  if (!hasContacted) {
    return { error: "Contact the seller before leaving a review" };
  }

  const { error } = await supabase.from("seller_reviews").insert({
    seller_id: sellerId,
    reviewer_id: user.id,
    property_id: propertyId,
    rating,
    communication_rating: communicationRating,
    accuracy_rating: accuracyRating,
    responsiveness_rating: responsivenessRating,
    trust_rating: trustRating,
    review_text: reviewText,
  });

  if (error) return { error: error.message };

  revalidatePath(`/seller/${sellerId}`);
  revalidatePath(`/sellers/${sellerId}`);
  revalidatePath("/properties");

  return { success: true };
}

export async function toggleReviewHelpful(reviewId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required" };

  const { data: existing } = await supabase
    .from("review_helpful_votes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("review_helpful_votes")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: error.message };
    return { success: true, helpful: false };
  }

  const { error } = await supabase.from("review_helpful_votes").insert({
    review_id: reviewId,
    user_id: user.id,
  });

  if (error) return { error: error.message };
  return { success: true, helpful: true };
}

export async function toggleSellerFavorite(sellerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required" };
  if (user.id === sellerId) return { error: "Cannot favorite yourself" };

  const { data: existing } = await supabase
    .from("seller_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("seller_favorites").delete().eq("id", existing.id);
    if (error) return { error: error.message };
    revalidatePath(`/seller/${sellerId}`);
    revalidatePath(`/sellers/${sellerId}`);
    return { success: true, favorited: false };
  }

  const { error } = await supabase.from("seller_favorites").insert({
    user_id: user.id,
    seller_id: sellerId,
  });

  if (error) return { error: error.message };
  revalidatePath(`/seller/${sellerId}`);
  revalidatePath(`/sellers/${sellerId}`);
  return { success: true, favorited: true };
}
