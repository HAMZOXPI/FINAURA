import type {
  Profile,
  Property,
  SellerPublicProfile,
  SellerReview,
  SellerReviewSummary,
  SellerStats,
  SellerVerification,
} from "@/types/database";
import { createClient } from "@/lib/supabase/server";

const EMPTY_SUMMARY: SellerReviewSummary = {
  averageRating: 0,
  totalReviews: 0,
  communication: 0,
  accuracy: 0,
  responsiveness: 0,
  trust: 0,
};

function buildVerification(profile: Profile): SellerVerification {
  const emailVerified = profile.email_verified ?? Boolean(profile.email);
  const phoneVerified = profile.phone_verified ?? Boolean(profile.phone);
  const identityVerified =
    profile.identity_verified ??
    (profile.role === "agent" || profile.role === "admin");

  return {
    verifiedSeller:
      profile.verified_seller ??
      (emailVerified && phoneVerified && identityVerified),
    identityVerified,
    phoneVerified,
    emailVerified,
  };
}

function buildReviewSummary(reviews: SellerReview[]): SellerReviewSummary {
  if (reviews.length === 0) return EMPTY_SUMMARY;

  const total = reviews.length;
  const sum = reviews.reduce(
    (acc, review) => {
      acc.rating += Number(review.rating);
      acc.communication += review.communication_rating;
      acc.accuracy += review.accuracy_rating;
      acc.responsiveness += review.responsiveness_rating;
      acc.trust += review.trust_rating;
      return acc;
    },
    { rating: 0, communication: 0, accuracy: 0, responsiveness: 0, trust: 0 }
  );

  return {
    averageRating: Math.round((sum.rating / total) * 10) / 10,
    totalReviews: total,
    communication: Math.round((sum.communication / total) * 10) / 10,
    accuracy: Math.round((sum.accuracy / total) * 10) / 10,
    responsiveness: Math.round((sum.responsiveness / total) * 10) / 10,
    trust: Math.round((sum.trust / total) * 10) / 10,
  };
}

async function getSellerReviewCache(sellerId: string): Promise<{ averageRating: number; totalReviews: number } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seller_profiles")
    .select("average_rating, total_reviews")
    .eq("id", sellerId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    averageRating: Number(data.average_rating),
    totalReviews: Number(data.total_reviews),
  };
}

async function getSellerReviews(sellerId: string, limit?: number): Promise<SellerReview[]> {
  const supabase = await createClient();
  let query = supabase
    .from("seller_reviews")
    .select("*, reviewer:profiles!seller_reviews_reviewer_id_fkey(id, full_name, avatar_url)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("getSellerReviews:", error.message);
    return [];
  }

  return (data as SellerReview[]) ?? [];
}

async function getSellerStats(profile: Profile): Promise<Omit<SellerStats, "averageRating" | "totalReviews">> {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, status, listing_status")
    .eq("owner_id", profile.id);

  const rows = (properties ?? []) as Pick<Property, "id" | "status" | "listing_status">[];
  const publishedCount = rows.filter((row) => row.listing_status === "published").length;
  const soldCount = Math.max(
    profile.listings_sold_count ?? 0,
    rows.filter((row) => row.status === "sold").length
  );

  return {
    totalListings: publishedCount,
    listingsSold: soldCount,
    responseRate: profile.response_rate ?? 98,
    avgResponseTimeHours: profile.avg_response_time_hours ?? 2,
  };
}

export async function canUserReviewSeller(
  userId: string | undefined,
  sellerId: string
): Promise<boolean> {
  if (!userId || userId === sellerId) return false;

  const supabase = await createClient();

  const [{ data: existingReview }, { data: inquiries }] = await Promise.all([
    supabase
      .from("seller_reviews")
      .select("id")
      .eq("seller_id", sellerId)
      .eq("reviewer_id", userId)
      .maybeSingle(),
    supabase
      .from("contact_inquiries")
      .select("id, property:properties(owner_id)")
      .eq("sender_id", userId),
  ]);

  if (existingReview) return false;

  return (
    inquiries?.some(
      (row) =>
        (row as { property?: { owner_id?: string } }).property?.owner_id === sellerId
    ) ?? false
  );
}

export async function getSellerPublicProfile(
  sellerId: string,
  viewerId?: string | null,
  reviewLimit = 10
): Promise<SellerPublicProfile | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", sellerId)
    .single();

  if (error || !profile) return null;

  const sellerProfile = profile as Profile;
  const [reviews, reviewCache] = await Promise.all([
    getSellerReviews(sellerId, reviewLimit),
    getSellerReviewCache(sellerId),
  ]);
  const computedSummary = buildReviewSummary(reviews);
  const reviewSummary: SellerReviewSummary = reviewCache
    ? {
        ...computedSummary,
        averageRating: reviewCache.averageRating,
        totalReviews: reviewCache.totalReviews,
      }
    : computedSummary;
  const baseStats = await getSellerStats(sellerProfile);
  const verification = buildVerification(sellerProfile);

  const stats: SellerStats = {
    ...baseStats,
    averageRating: reviewSummary.averageRating,
    totalReviews: reviewSummary.totalReviews,
  };

  let isFavorite = false;
  let helpfulReviewIds: string[] = [];
  let canReview = false;
  let hasReviewed = false;

  if (viewerId) {
    const [{ data: favorite }, { data: helpfulVotes }, canReviewResult, existingReview] =
      await Promise.all([
        supabase
          .from("seller_favorites")
          .select("id")
          .eq("user_id", viewerId)
          .eq("seller_id", sellerId)
          .maybeSingle(),
        supabase.from("review_helpful_votes").select("review_id").eq("user_id", viewerId),
        canUserReviewSeller(viewerId, sellerId),
        supabase
          .from("seller_reviews")
          .select("id")
          .eq("seller_id", sellerId)
          .eq("reviewer_id", viewerId)
          .maybeSingle(),
      ]);

    isFavorite = Boolean(favorite);
    helpfulReviewIds =
      helpfulVotes?.map((vote) => (vote as { review_id: string }).review_id) ?? [];
    canReview = canReviewResult;
    hasReviewed = Boolean(existingReview);
  }

  return {
    profile: sellerProfile,
    stats,
    reviewSummary,
    reviews,
    verification,
    isFavorite,
    canReview,
    hasReviewed,
    helpfulReviewIds,
  };
}

export async function getSellerActiveListings(sellerId: string): Promise<Property[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, owner:profiles(*)")
    .eq("owner_id", sellerId)
    .eq("listing_status", "published")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as Property[]) ?? [];
}

export async function getAllSellerReviews(sellerId: string): Promise<SellerReview[]> {
  return getSellerReviews(sellerId);
}
