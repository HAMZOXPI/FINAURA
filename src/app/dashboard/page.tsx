import { fetchBoostCenterData } from "@/actions/boost.actions";
import { DashboardWorkspace } from "@/components/dashboard/workspace/dashboard-workspace";
import { resolveUserId } from "@/lib/supabase/auth";
import {
  buildAccountHealth,
  buildDashboardActivity,
  buildDashboardRecommendations,
  buildListingAnalyticsMetrics,
  buildListingPerformanceRows,
  buildProfileCompleteness,
  buildSmartInsights,
  buildVerificationInsights,
  countDraftListings,
  getDashboardSubtitleKey,
  isPremiumPlan,
} from "@/lib/dashboard/workspace-display";
import { getUserCreditBalance } from "@/services/gift.service";
import { getDashboardStats } from "@/services/dashboard.service";
import { getUserNotifications } from "@/services/notification.service";
import { getUserFavorites, getUserProperties } from "@/services/property.service";
import { getEffectiveUserPlan, getUserSubscription } from "@/services/subscription.service";
import { getProfile, getCurrentUser } from "@/services/user.service";
import {
  getLatestVerificationRequest,
  resolveSellerVerificationStatus,
} from "@/services/verification.service";
import type { VerificationRequest } from "@/types/database";

export default async function DashboardOverviewPage() {
  const userId = await resolveUserId();
  const user = await getCurrentUser();

  const [
    stats,
    favorites,
    effectivePlan,
    profile,
    properties,
    subscription,
    boostCredits,
    boostData,
    latestVerificationRaw,
    recentNotifications,
  ] = await Promise.all([
    getDashboardStats(userId),
    getUserFavorites(userId),
    getEffectiveUserPlan(userId),
    getProfile(userId),
    getUserProperties(userId),
    getUserSubscription(userId),
    getUserCreditBalance(userId, "boost_credits"),
    fetchBoostCenterData(),
    getLatestVerificationRequest(userId),
    getUserNotifications(userId, 6),
  ]);

  if (!effectivePlan) {
    return null;
  }

  const latestVerification = latestVerificationRaw as VerificationRequest | null;
  const verificationStatus = resolveSellerVerificationStatus(
    {
      is_verified: profile?.is_verified,
      verified_seller: profile?.verified_seller,
    },
    latestVerification
  );

  const draftsCount = countDraftListings(properties);
  const planSlug = subscription?.plan?.slug ?? null;
  const isPremium = isPremiumPlan(planSlug);
  const userName = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";
  const email = profile?.email ?? user?.email ?? "";

  const profileFields = buildProfileCompleteness(profile, email, verificationStatus);
  const subtitleKey = getDashboardSubtitleKey({
    stats,
    publishedCount: stats.published_count,
    verificationStatus,
  });

  const activity = buildDashboardActivity({
    properties,
    boostHistory: boostData.history,
    latestVerification,
    verificationStatus,
    notifications: recentNotifications,
    messagesCount: stats.messages_count,
  });

  const recommendations = buildDashboardRecommendations({
    profileFields,
    verificationStatus,
    listingsCount: stats.listings_count,
    publishedCount: stats.published_count,
    activeBoosts: boostData.active.length,
    isPremium,
    listingLimitAllowed: effectivePlan.listingLimit.allowed,
  });

  const listingMetrics = buildListingAnalyticsMetrics({
    properties,
    activeBoosts: boostData.active,
    draftsCount,
    publishedCount: stats.published_count,
    listingsCount: stats.listings_count,
  });

  const performanceRows = buildListingPerformanceRows({
    properties,
    activeBoosts: boostData.active,
  });

  const verificationData = buildVerificationInsights({
    verificationStatus,
    latestVerification,
  });

  const accountHealth = buildAccountHealth({
    profile,
    profileFields,
    isPremium,
    verificationStatus,
  });

  const smartInsights = buildSmartInsights({
    properties,
    profileFields,
    verificationStatus,
    activeBoosts: boostData.active,
    isPremium,
    expiresAt: subscription?.current_period_end ?? null,
  });

  return (
    <DashboardWorkspace
      userName={userName}
      subtitleKey={subtitleKey}
      isPremium={isPremium}
      effectivePlan={effectivePlan}
      planSlug={planSlug}
      expiresAt={subscription?.current_period_end ?? null}
      boostCredits={boostCredits}
      stats={stats}
      draftsCount={draftsCount}
      verificationStatus={verificationStatus}
      boostData={boostData}
      activity={activity}
      profileFields={profileFields}
      recommendations={recommendations}
      favorites={favorites}
      listingMetrics={listingMetrics}
      performanceRows={performanceRows}
      verificationData={verificationData}
      accountHealth={accountHealth}
      smartInsights={smartInsights}
    />
  );
}
