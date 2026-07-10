"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { DashboardAccountInsights } from "@/components/dashboard/workspace/dashboard-account-insights";
import { DashboardBoostInsights } from "@/components/dashboard/workspace/dashboard-boost-insights";
import { DashboardListingAnalytics } from "@/components/dashboard/workspace/dashboard-listing-analytics";
import { DashboardListingPerformance } from "@/components/dashboard/workspace/dashboard-listing-performance";
import { DashboardSmartInsights } from "@/components/dashboard/workspace/dashboard-smart-insights";
import { DashboardVerificationInsights } from "@/components/dashboard/workspace/dashboard-verification-insights";
import type {
  AccountHealthData,
  ListingAnalyticsMetrics,
  ListingPerformanceRow,
  SmartInsight,
  VerificationInsightsData,
} from "@/lib/dashboard/workspace-display";
import type { BoostCenterCampaign } from "@/types/boost";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardAnalyticsSectionProps {
  listingMetrics: ListingAnalyticsMetrics;
  performanceRows: ListingPerformanceRow[];
  activeBoosts: BoostCenterCampaign[];
  verificationData: VerificationInsightsData;
  accountHealth: AccountHealthData;
  smartInsights: SmartInsight[];
  isPremium: boolean;
}

export function DashboardAnalyticsSection({
  listingMetrics,
  performanceRows,
  activeBoosts,
  verificationData,
  accountHealth,
  smartInsights,
  isPremium,
}: DashboardAnalyticsSectionProps) {
  const { t } = useTranslation();
  const analytics = t.dashboard.workspace.analytics;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-surface-900">
            <BarChart3 className="h-5 w-5 text-brand-600" />
            {analytics.sectionTitle}
          </h2>
          <p className="mt-1 text-sm text-surface-500">{analytics.sectionSubtitle}</p>
        </div>
      </div>

      <DashboardListingAnalytics metrics={listingMetrics} />

      <DashboardListingPerformance rows={performanceRows} isPremium={isPremium} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardBoostInsights activeBoosts={activeBoosts} />
        <DashboardVerificationInsights data={verificationData} />
        <DashboardAccountInsights data={accountHealth} />
        <DashboardSmartInsights items={smartInsights} />
      </div>
    </motion.section>
  );
}
