import type { Property, SellerPublicProfile, SellerVerification } from "@/types/database";

export type SellerSubtitleKey = "agent" | "private" | "agency" | "admin";

export function getSellerSubtitleKey(profile: SellerPublicProfile["profile"]): SellerSubtitleKey {
  if (profile.role === "admin") return "admin";
  if (profile.role === "agent") return "agent";
  return "private";
}

export function getSellerCity(listings: Property[]): string | null {
  const first = listings[0];
  if (!first?.city) return null;
  return first.state ? `${first.city}, ${first.state}` : first.city;
}

export function isPremiumSeller(
  seller: SellerPublicProfile,
  listings: Property[]
): boolean {
  if (seller.profile.verified_seller && seller.profile.role === "agent") return true;
  return listings.some((listing) => listing.is_featured);
}

export function calculateTrustScore(
  verification: SellerVerification,
  stats: SellerPublicProfile["stats"],
  isPremium: boolean
): number {
  let score = 40;
  if (verification.identityVerified) score += 15;
  if (verification.emailVerified) score += 10;
  if (verification.phoneVerified) score += 10;
  if (verification.verifiedSeller) score += 10;
  if (isPremium) score += 5;
  score += Math.min(Math.round(stats.responseRate) / 10, 10);
  return Math.min(score, 99);
}

export interface TrustScoreItem {
  key: string;
  label: string;
  value: number;
  active: boolean;
}

export function buildTrustScoreItems(
  verification: SellerVerification,
  stats: SellerPublicProfile["stats"],
  isPremium: boolean,
  labels: {
    verifiedIdentity: string;
    verifiedEmail: string;
    verifiedPhone: string;
    premiumSeller: string;
    responseQuality: string;
  }
): TrustScoreItem[] {
  return [
    {
      key: "identity",
      label: labels.verifiedIdentity,
      value: verification.identityVerified ? 100 : 0,
      active: verification.identityVerified,
    },
    {
      key: "email",
      label: labels.verifiedEmail,
      value: verification.emailVerified ? 100 : 0,
      active: verification.emailVerified,
    },
    {
      key: "phone",
      label: labels.verifiedPhone,
      value: verification.phoneVerified ? 100 : 0,
      active: verification.phoneVerified,
    },
    {
      key: "premium",
      label: labels.premiumSeller,
      value: isPremium ? 100 : 0,
      active: isPremium,
    },
    {
      key: "response",
      label: labels.responseQuality,
      value: Math.round(stats.responseRate),
      active: stats.responseRate >= 80,
    },
  ];
}

export interface AchievementItem {
  key: string;
  label: string;
  unlocked: boolean;
}

export function buildAchievements(
  seller: SellerPublicProfile,
  listings: Property[],
  isPremium: boolean,
  labels: Record<string, string>
): AchievementItem[] {
  const yearsOnPlatform =
    (Date.now() - new Date(seller.profile.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  return [
    {
      key: "verified",
      label: labels.verifiedSeller,
      unlocked: seller.verification.verifiedSeller,
    },
    {
      key: "premium",
      label: labels.premiumSeller,
      unlocked: isPremium,
    },
    {
      key: "quick",
      label: labels.quickResponder,
      unlocked: seller.stats.avgResponseTimeHours <= 4,
    },
    {
      key: "top",
      label: labels.topAdvertiser,
      unlocked: seller.stats.totalListings >= 3,
    },
    {
      key: "trusted",
      label: labels.trustedMember,
      unlocked: seller.reviewSummary.averageRating >= 4.5 && seller.reviewSummary.totalReviews >= 3,
    },
    {
      key: "years",
      label: labels.yearsOnPlatform,
      unlocked: yearsOnPlatform >= 1,
    },
    {
      key: "boosted",
      label: labels.boostedListing,
      unlocked: listings.some((l) => l.is_featured),
    },
  ];
}

export interface TimelineItem {
  key: string;
  label: string;
  date?: string;
  comingSoon?: boolean;
}

export function buildTimeline(
  seller: SellerPublicProfile,
  listings: Property[],
  labels: Record<string, string>,
  formatDate: (date: string) => string
): TimelineItem[] {
  const items: TimelineItem[] = [
    {
      key: "joined",
      label: labels.joined,
      date: formatDate(seller.profile.created_at),
    },
  ];

  if (seller.verification.verifiedSeller) {
    items.push({
      key: "verified",
      label: labels.gotVerified,
      comingSoon: true,
    });
  }

  const newestListing = listings[0];
  if (newestListing) {
    items.push({
      key: "published",
      label: labels.publishedListing,
      date: formatDate(newestListing.created_at),
    });
  }

  const featured = listings.find((l) => l.is_featured);
  if (featured) {
    items.push({
      key: "boosted",
      label: labels.boostedListing,
      date: formatDate(featured.created_at),
    });
  }

  return items;
}

export interface CompletenessItem {
  key: string;
  label: string;
  complete: boolean;
}

export function buildCompleteness(
  seller: SellerPublicProfile,
  labels: Record<string, string>
): { items: CompletenessItem[]; percent: number } {
  const items: CompletenessItem[] = [
    { key: "identity", label: labels.identity, complete: seller.verification.identityVerified },
    { key: "phone", label: labels.phone, complete: seller.verification.phoneVerified },
    { key: "email", label: labels.email, complete: seller.verification.emailVerified },
    { key: "bio", label: labels.bio, complete: Boolean(seller.profile.bio?.trim()) },
    {
      key: "listings",
      label: labels.listings,
      complete: seller.stats.totalListings > 0,
    },
  ];

  const completeCount = items.filter((item) => item.complete).length;
  const percent = Math.round((completeCount / items.length) * 100);

  return { items, percent };
}

export interface PerformanceMetric {
  key: string;
  label: string;
  value: string;
  percent: number;
  comingSoon?: boolean;
}

export function buildPerformanceMetrics(
  seller: SellerPublicProfile,
  listings: Property[],
  labels: Record<string, string>,
  formatResponse: (hours: number) => string
): PerformanceMetric[] {
  const qualityScore = seller.reviewSummary.totalReviews > 0
    ? Math.round((seller.reviewSummary.averageRating / 5) * 100)
    : 72;

  return [
    {
      key: "published",
      label: labels.listingsPublished,
      value: String(seller.stats.totalListings),
      percent: Math.min(seller.stats.totalListings * 10, 100),
    },
    {
      key: "response",
      label: labels.responseRate,
      value: `${Math.round(seller.stats.responseRate)}%`,
      percent: Math.round(seller.stats.responseRate),
    },
    {
      key: "quality",
      label: labels.listingQuality,
      value: seller.reviewSummary.totalReviews > 0
        ? `${seller.reviewSummary.averageRating.toFixed(1)}/5`
        : labels.comingSoon,
      percent: qualityScore,
      comingSoon: seller.reviewSummary.totalReviews === 0,
    },
    {
      key: "activity",
      label: labels.averageActivity,
      value: formatResponse(seller.stats.avgResponseTimeHours),
      percent: Math.max(100 - seller.stats.avgResponseTimeHours * 8, 20),
    },
  ];
}
