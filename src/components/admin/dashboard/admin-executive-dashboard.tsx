"use client";

import {
  Banknote,
  Building2,
  CalendarRange,
  CreditCard,
  Flag,
  Rocket,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import type { AdminBoostHistoryRow, AdminBoostStats, AdminFeaturedListingRow } from "@/services/admin-boost.service";
import type { BoostSettings } from "@/services/boost-settings.service";
import type { AdminDashboardStats, AdminActivityItem } from "@/services/admin.service";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { AdminPlatformHealth } from "@/components/admin/dashboard/admin-platform-health";
import { AdminLiveBoostMonitor } from "@/components/admin/dashboard/admin-live-boost-monitor";
import { AdminActivityCenter } from "@/components/admin/dashboard/admin-activity-center";
import { AdminDashboardHeader } from "@/components/admin/dashboard/admin-dashboard-header";
import { AdminKpiCard } from "@/components/admin/dashboard/admin-kpi-card";
import { AdminPlatformSummary } from "@/components/admin/dashboard/admin-platform-summary";
import { AdminRevenueAnalytics } from "@/components/admin/dashboard/admin-revenue-analytics";

interface AdminExecutiveDashboardProps {
  stats: AdminDashboardStats;
  boostStats: AdminBoostStats;
  boostHistory: AdminBoostHistoryRow[];
  activity: AdminActivityItem[];
  featuredListings: AdminFeaturedListingRow[];
  boostSettings: BoostSettings;
}

export function AdminExecutiveDashboard({
  stats,
  boostStats,
  boostHistory,
  activity,
  featuredListings,
  boostSettings,
}: AdminExecutiveDashboardProps) {
  const { t, locale } = useTranslation();

  const kpiCards = [
    {
      title: t.admin.kpiRevenueToday,
      value: boostStats.todayRevenue,
      valueDisplay: formatPrice(boostStats.todayRevenue, undefined, locale),
      secondaryLabel: t.admin.kpiSecondaryBoostMarketplace,
      icon: Banknote,
      accent: "emerald" as const,
      delay: 0.04,
    },
    {
      title: t.admin.kpiRevenueMonth,
      value: null,
      secondaryLabel: t.admin.kpiSecondaryComingSoon,
      icon: CalendarRange,
      accent: "emerald" as const,
      delay: 0.08,
    },
    {
      title: t.admin.activeListings,
      value: stats.activeListings,
      secondaryLabel: t.admin.kpiSecondaryPublished,
      icon: Building2,
      accent: "indigo" as const,
      delay: 0.12,
    },
    {
      title: t.admin.kpiActiveBoosts,
      value: boostStats.activeBoosts,
      secondaryLabel: t.admin.kpiSecondaryActiveCampaigns,
      icon: Rocket,
      accent: "gold" as const,
      delay: 0.16,
    },
    {
      title: t.admin.kpiPendingPayments,
      value: null,
      secondaryLabel: t.admin.kpiSecondaryComingSoon,
      icon: CreditCard,
      accent: "blue" as const,
      delay: 0.2,
    },
    {
      title: t.admin.kpiNewUsersToday,
      value: null,
      secondaryLabel: t.admin.kpiSecondaryTotalUsers.replace(
        "{count}",
        stats.totalUsers.toLocaleString(locale === "ar" ? "ar-MA" : "fr-FR")
      ),
      icon: UserPlus,
      accent: "purple" as const,
      delay: 0.24,
    },
    {
      title: t.admin.pendingVerification,
      value: stats.pendingVerification,
      secondaryLabel: t.admin.kpiSecondaryToProcess,
      icon: ShieldCheck,
      accent: "orange" as const,
      delay: 0.28,
    },
    {
      title: t.admin.kpiOpenReports,
      value: null,
      secondaryLabel: t.admin.kpiSecondaryComingSoon,
      icon: Flag,
      accent: "red" as const,
      delay: 0.32,
    },
  ];

  return (
    <div className="space-y-8">
      <AdminDashboardHeader />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <AdminKpiCard key={card.title} {...card} />
        ))}
      </div>

      <AdminRevenueAnalytics boostStats={boostStats} boostHistory={boostHistory} />

      <AdminLiveBoostMonitor
        boostStats={boostStats}
        featuredListings={featuredListings}
        boostSettings={boostSettings}
      />

      <AdminPlatformHealth stats={stats} boostStats={boostStats} />

      <AdminActivityCenter activity={activity} boostHistory={boostHistory} />

      <AdminPlatformSummary stats={stats} boostStats={boostStats} />
    </div>
  );
}
