"use client";



import Link from "next/link";

import { PropertyCard } from "@/components/properties/property-card";

import { PropertyGrid } from "@/components/properties/property-grid";

import { DashboardAccountSummary } from "@/components/dashboard/workspace/dashboard-account-summary";

import { DashboardActivityTimeline } from "@/components/dashboard/workspace/dashboard-activity-timeline";

import { DashboardAnalyticsSection } from "@/components/dashboard/workspace/dashboard-analytics-section";

import { DashboardKpiGrid } from "@/components/dashboard/workspace/dashboard-kpi-grid";

import { DashboardProfileCompleteness } from "@/components/dashboard/workspace/dashboard-profile-completeness";

import { DashboardQuickActions } from "@/components/dashboard/workspace/dashboard-quick-actions";

import { DashboardRecommendations } from "@/components/dashboard/workspace/dashboard-recommendations";

import { DashboardWorkspaceHeader } from "@/components/dashboard/workspace/dashboard-workspace-header";

import type {

  AccountHealthData,

  DashboardActivityItem,

  DashboardRecommendation,

  ListingAnalyticsMetrics,

  ListingPerformanceRow,

  ProfileCompletenessField,

  SmartInsight,

  VerificationInsightsData,

} from "@/lib/dashboard/workspace-display";

import type { BoostCenterData } from "@/types/boost";

import type { Property } from "@/types/database";

import type { EffectiveUserPlan } from "@/services/subscription.service";

import type { SellerVerificationStatus } from "@/services/verification.service";

import type { DashboardStats } from "@/types/database";

import { useTranslation } from "@/i18n/locale-provider";



interface DashboardWorkspaceProps {

  userName: string;

  subtitleKey: "overview" | "ready" | "performance";

  isPremium: boolean;

  effectivePlan: EffectiveUserPlan;

  planSlug: string | null;

  expiresAt: string | null;

  boostCredits: number;

  stats: DashboardStats;

  draftsCount: number;

  verificationStatus: SellerVerificationStatus;

  boostData: BoostCenterData;

  activity: DashboardActivityItem[];

  profileFields: ProfileCompletenessField[];

  recommendations: DashboardRecommendation[];

  favorites: Property[];

  listingMetrics: ListingAnalyticsMetrics;

  performanceRows: ListingPerformanceRow[];

  verificationData: VerificationInsightsData;

  accountHealth: AccountHealthData;

  smartInsights: SmartInsight[];

}



export function DashboardWorkspace({

  userName,

  subtitleKey,

  isPremium,

  effectivePlan,

  planSlug,

  expiresAt,

  boostCredits,

  stats,

  draftsCount,

  verificationStatus,

  boostData,

  activity,

  profileFields,

  recommendations,

  favorites,

  listingMetrics,

  performanceRows,

  verificationData,

  accountHealth,

  smartInsights,

}: DashboardWorkspaceProps) {

  const { t } = useTranslation();

  const ws = t.dashboard.workspace;



  return (

    <div className="space-y-8">

      <DashboardWorkspaceHeader

        userName={userName}

        subtitleKey={subtitleKey}

        isPremium={isPremium}

      />



      <DashboardAccountSummary

        initialPlan={effectivePlan}

        planSlug={planSlug}

        expiresAt={expiresAt}

        boostCredits={boostCredits}

      />



      <DashboardKpiGrid

        listingsCount={stats.listings_count}

        publishedCount={stats.published_count}

        draftsCount={draftsCount}

        messagesCount={stats.messages_count}

        favoritesCount={stats.favorites_count}

        activeBoosts={boostData.active.length}

        verificationStatus={verificationStatus}

      />



      <DashboardAnalyticsSection

        listingMetrics={listingMetrics}

        performanceRows={performanceRows}

        activeBoosts={boostData.active}

        verificationData={verificationData}

        accountHealth={accountHealth}

        smartInsights={smartInsights}

        isPremium={isPremium}

      />



      <DashboardQuickActions />



      <div className="grid gap-6 xl:grid-cols-2">

        <section className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5">

            <h2 className="text-lg font-bold tracking-tight text-surface-900">

              {ws.activityTitle}

            </h2>

            <p className="mt-1 text-sm text-surface-500">{ws.activitySubtitle}</p>

          </div>

          <DashboardActivityTimeline items={activity} />

        </section>



        <DashboardProfileCompleteness fields={profileFields} />

      </div>



      <DashboardRecommendations items={recommendations} />



      {favorites.length > 0 && (

        <section>

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold tracking-tight text-surface-900">

              {t.dashboard.recentFavorites}

            </h2>

            <Link

              href="/dashboard/favorites"

              className="text-sm font-semibold text-brand-600 hover:text-brand-700"

            >

              {t.dashboard.viewAll}

            </Link>

          </div>

          <PropertyGrid className="mt-4">

            {favorites.slice(0, 3).map((property) => (

              <PropertyCard key={property.id} property={property} />

            ))}

          </PropertyGrid>

        </section>

      )}

    </div>

  );

}

