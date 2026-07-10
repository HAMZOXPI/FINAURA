import { BOOST_BID_INCREMENT } from "@/lib/boost/constants";
import type { BoostCenterCampaign, BoostCenterHistoryEntry } from "@/types/boost";
import type { Notification, Profile, Property, VerificationRequest } from "@/types/database";
import type { SellerVerificationStatus } from "@/services/verification.service";
import type { DashboardStats } from "@/types/database";

export type DashboardActivityType =
  | "listing_created"
  | "boost_activated"
  | "verification"
  | "message"
  | "notification";

export interface DashboardActivityItem {
  id: string;
  type: DashboardActivityType;
  title: string;
  subtitle: string;
  createdAt: string;
}

export interface ProfileCompletenessField {
  key: "avatar" | "phone" | "email" | "verification" | "bio";
  complete: boolean;
}

export interface DashboardRecommendation {
  id: string;
  titleKey: string;
  descriptionKey: string;
  href: string;
  priority: number;
}

export function getDashboardSubtitleKey(input: {
  stats: DashboardStats;
  publishedCount: number;
  verificationStatus: SellerVerificationStatus;
}): "overview" | "ready" | "performance" {
  if (input.publishedCount > 0) return "performance";
  if (input.stats.listings_count === 0 && input.verificationStatus === "not_verified") {
    return "ready";
  }
  return "overview";
}

export function countDraftListings(properties: Property[]): number {
  return properties.filter((property) => property.listing_status === "draft").length;
}

export function buildProfileCompleteness(
  profile: Profile | null,
  email: string,
  verificationStatus: SellerVerificationStatus
): ProfileCompletenessField[] {
  return [
    { key: "avatar", complete: Boolean(profile?.avatar_url) },
    { key: "phone", complete: Boolean(profile?.phone?.trim()) },
    { key: "email", complete: Boolean(email.trim()) },
    {
      key: "verification",
      complete: verificationStatus === "verified",
    },
    { key: "bio", complete: Boolean(profile?.bio?.trim()) },
  ];
}

export function getProfileCompletenessPercent(fields: ProfileCompletenessField[]): number {
  if (fields.length === 0) return 0;
  const complete = fields.filter((field) => field.complete).length;
  return Math.round((complete / fields.length) * 100);
}

export function buildDashboardActivity(input: {
  properties: Property[];
  boostHistory: BoostCenterHistoryEntry[];
  latestVerification: VerificationRequest | null;
  verificationStatus: SellerVerificationStatus;
  notifications: Notification[];
  messagesCount: number;
}): DashboardActivityItem[] {
  const items: DashboardActivityItem[] = [];

  for (const property of input.properties.slice(0, 4)) {
    items.push({
      id: `listing-${property.id}`,
      type: "listing_created",
      title: property.title,
      subtitle: property.listing_status,
      createdAt: property.created_at,
    });
  }

  for (const entry of input.boostHistory.slice(0, 4)) {
    if (entry.action === "activated" || entry.action === "created") {
      items.push({
        id: `boost-${entry.id}`,
        type: "boost_activated",
        title: entry.listingTitle,
        subtitle: entry.action,
        createdAt: entry.createdAt,
      });
    }
  }

  if (input.latestVerification) {
    items.push({
      id: `verification-${input.latestVerification.id}`,
      type: "verification",
      title: input.verificationStatus,
      subtitle: input.latestVerification.status,
      createdAt: input.latestVerification.created_at,
    });
  }

  if (input.messagesCount > 0) {
    items.push({
      id: "messages-summary",
      type: "message",
      title: String(input.messagesCount),
      subtitle: "messages",
      createdAt: new Date().toISOString(),
    });
  }

  for (const notification of input.notifications.slice(0, 4)) {
    items.push({
      id: `notification-${notification.id}`,
      type: "notification",
      title: notification.title,
      subtitle: notification.notification_type,
      createdAt: notification.created_at,
    });
  }

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
}

export function buildDashboardRecommendations(input: {
  profileFields: ProfileCompletenessField[];
  verificationStatus: SellerVerificationStatus;
  listingsCount: number;
  publishedCount: number;
  activeBoosts: number;
  isPremium: boolean;
  listingLimitAllowed: boolean;
}): DashboardRecommendation[] {
  const recommendations: DashboardRecommendation[] = [];
  const completeness = getProfileCompletenessPercent(input.profileFields);

  if (completeness < 100) {
    recommendations.push({
      id: "complete-profile",
      titleKey: "completeProfile",
      descriptionKey: "completeProfileDesc",
      href: "/dashboard/settings",
      priority: 1,
    });
  }

  if (input.verificationStatus !== "verified") {
    recommendations.push({
      id: "verify-account",
      titleKey: "verifyAccount",
      descriptionKey: "verifyAccountDesc",
      href: "/dashboard/settings",
      priority: 2,
    });
  }

  if (input.publishedCount > 0 && input.activeBoosts === 0) {
    recommendations.push({
      id: "boost-listing",
      titleKey: "boostListing",
      descriptionKey: "boostListingDesc",
      href: "/dashboard/boost",
      priority: 3,
    });
  }

  if (input.listingsCount === 1 && input.listingLimitAllowed) {
    recommendations.push({
      id: "second-listing",
      titleKey: "secondListing",
      descriptionKey: "secondListingDesc",
      href: "/dashboard/new",
      priority: 4,
    });
  }

  if (!input.isPremium && !input.listingLimitAllowed) {
    recommendations.push({
      id: "upgrade-plan",
      titleKey: "upgradePlan",
      descriptionKey: "upgradePlanDesc",
      href: "/pricing",
      priority: 5,
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

export function getTopListing(properties: Property[]): Property | null {
  const published = properties.filter((property) => property.listing_status === "published");
  if (published.length === 0) return properties[0] ?? null;
  const featured = published.find((property) => property.is_featured);
  return featured ?? published[0];
}

export function isPremiumPlan(planSlug: string | undefined | null): boolean {
  return planSlug === "pro" || planSlug === "enterprise";
}

export function getListingsRemaining(
  current: number,
  max: number | null
): number | null {
  if (max === null) return null;
  return Math.max(0, max - current);
}

export interface ListingAnalyticsMetrics {
  total: number;
  active: number;
  featured: number;
  boosted: number;
  drafts: number;
}

export function buildListingAnalyticsMetrics(input: {
  properties: Property[];
  activeBoosts: BoostCenterCampaign[];
  draftsCount: number;
  publishedCount: number;
  listingsCount: number;
}): ListingAnalyticsMetrics {
  const boostedIds = new Set(input.activeBoosts.map((campaign) => campaign.listingId));
  const published = input.properties.filter(
    (property) => property.listing_status === "published"
  );

  return {
    total: input.listingsCount || input.properties.length,
    active: input.publishedCount || published.length,
    featured: published.filter((property) => property.is_featured).length,
    boosted: input.properties.filter((property) => boostedIds.has(property.id)).length,
    drafts: input.draftsCount,
  };
}

export interface ListingPerformanceRow {
  property: Property;
  activeBoost: BoostCenterCampaign | null;
  positionLabel: string | null;
}

export function buildListingPerformanceRows(input: {
  properties: Property[];
  activeBoosts: BoostCenterCampaign[];
}): ListingPerformanceRow[] {
  const boostByListing = new Map(
    input.activeBoosts.map((campaign) => [campaign.listingId, campaign])
  );

  return [...input.properties]
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .map((property) => {
      const activeBoost = boostByListing.get(property.id) ?? null;
      return {
        property,
        activeBoost,
        positionLabel: activeBoost ? String(activeBoost.position) : null,
      };
    });
}

export type AccountHealthScore = "excellent" | "good" | "needs_attention";

export interface AccountHealthData {
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  profileCompletion: number;
  isPremium: boolean;
  score: AccountHealthScore;
}

export function buildAccountHealth(input: {
  profile: Profile | null;
  profileFields: ProfileCompletenessField[];
  isPremium: boolean;
  verificationStatus: SellerVerificationStatus;
}): AccountHealthData {
  const emailVerified = Boolean(input.profile?.email_verified);
  const phoneVerified = Boolean(input.profile?.phone_verified);
  const identityVerified =
    input.verificationStatus === "verified" || Boolean(input.profile?.identity_verified);
  const profileCompletion = getProfileCompletenessPercent(input.profileFields);

  const checks = [
    emailVerified,
    phoneVerified,
    identityVerified,
    profileCompletion >= 80,
    input.isPremium,
  ];
  const passed = checks.filter(Boolean).length;

  let score: AccountHealthScore = "needs_attention";
  if (passed >= 4) score = "excellent";
  else if (passed >= 2) score = "good";

  return {
    emailVerified,
    phoneVerified,
    identityVerified,
    profileCompletion,
    isPremium: input.isPremium,
    score,
  };
}

export interface VerificationInsightsData {
  status: SellerVerificationStatus;
  documentsUploaded: number;
  documentsTotal: number;
  reviewStatus: VerificationRequest["status"] | null;
  reviewedAt: string | null;
}

export function buildVerificationInsights(input: {
  verificationStatus: SellerVerificationStatus;
  latestVerification: VerificationRequest | null;
}): VerificationInsightsData {
  const docs = input.latestVerification
    ? [
        input.latestVerification.id_front,
        input.latestVerification.id_back,
        input.latestVerification.selfie,
        input.latestVerification.proof_of_address,
      ].filter(Boolean)
    : [];

  return {
    status: input.verificationStatus,
    documentsUploaded: docs.length,
    documentsTotal: 4,
    reviewStatus: input.latestVerification?.status ?? null,
    reviewedAt: input.latestVerification?.reviewed_at ?? null,
  };
}

export interface SmartInsight {
  id: string;
  titleKey: string;
  descriptionKey: string;
  href: string;
  tone: "info" | "success" | "warning" | "brand";
}

export function buildSmartInsights(input: {
  properties: Property[];
  profileFields: ProfileCompletenessField[];
  verificationStatus: SellerVerificationStatus;
  activeBoosts: BoostCenterCampaign[];
  isPremium: boolean;
  expiresAt: string | null;
}): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const profileCompletion = getProfileCompletenessPercent(input.profileFields);
  const published = input.properties.filter(
    (property) => property.listing_status === "published"
  );
  const featuredListing = published.find((property) => property.is_featured);

  if (featuredListing) {
    insights.push({
      id: "featured-listing",
      titleKey: "featuredListing",
      descriptionKey: "featuredListingDesc",
      href: `/dashboard/${featuredListing.id}/edit`,
      tone: "success",
    });
  }

  for (const boost of input.activeBoosts) {
    if (!boost.expiresAt) continue;
    const msLeft = new Date(boost.expiresAt).getTime() - Date.now();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
    if (msLeft > 0 && msLeft <= twoDaysMs) {
      insights.push({
        id: `boost-expiring-${boost.id}`,
        titleKey: "boostExpiring",
        descriptionKey: "boostExpiringDesc",
        href: "/dashboard/boost",
        tone: "warning",
      });
      break;
    }
  }

  if (profileCompletion < 100) {
    insights.push({
      id: "complete-profile",
      titleKey: "completeProfile",
      descriptionKey: "completeProfileDesc",
      href: "/dashboard/settings",
      tone: "brand",
    });
  }

  const lowPhotoListing = input.properties.find(
    (property) => property.images.length < 3 && property.listing_status !== "archived"
  );
  if (lowPhotoListing) {
    insights.push({
      id: "upload-photos",
      titleKey: "uploadPhotos",
      descriptionKey: "uploadPhotosDesc",
      href: `/dashboard/${lowPhotoListing.id}/edit`,
      tone: "info",
    });
  }

  if (input.verificationStatus !== "verified") {
    insights.push({
      id: "verify-account",
      titleKey: "verifyAccount",
      descriptionKey: "verifyAccountDesc",
      href: "/dashboard/settings",
      tone: "warning",
    });
  }

  if (input.expiresAt) {
    const msLeft = new Date(input.expiresAt).getTime() - Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (msLeft > 0 && msLeft <= sevenDaysMs) {
      insights.push({
        id: "renew-subscription",
        titleKey: "renewSubscription",
        descriptionKey: "renewSubscriptionDesc",
        href: "/pricing",
        tone: "warning",
      });
    }
  }

  if (published.length > 0 && input.activeBoosts.length === 0) {
    insights.push({
      id: "boost-listing",
      titleKey: "boostListing",
      descriptionKey: "boostListingDesc",
      href: "/dashboard/boost",
      tone: "brand",
    });
  }

  if (!input.isPremium) {
    insights.push({
      id: "upgrade-premium",
      titleKey: "upgradePremium",
      descriptionKey: "upgradePremiumDesc",
      href: "/pricing",
      tone: "info",
    });
  }

  return insights.slice(0, 6);
}

export function estimateMinimumNextBid(currentBid: number): number {
  return currentBid + BOOST_BID_INCREMENT;
}
