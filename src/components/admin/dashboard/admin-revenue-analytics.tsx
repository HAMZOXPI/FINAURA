"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  BarChart3,
  Gift,
  Megaphone,
  Rocket,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { AdminBoostHistoryRow, AdminBoostStats } from "@/services/admin-boost.service";
import {
  buildRevenueChartPoints,
  getAverageTransaction,
  getBoostRevenueShare,
  getFilteredRevenueTotal,
  type RevenueTimeRange,
} from "@/lib/admin/revenue-analytics";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { AdminRevenueChart } from "@/components/admin/dashboard/admin-revenue-chart";
import { AdminRevenuePerformanceCard } from "@/components/admin/dashboard/admin-revenue-performance-card";
import { AdminRevenueSourceCard } from "@/components/admin/dashboard/admin-revenue-source-card";

const TIME_RANGES: RevenueTimeRange[] = ["today", "week", "month", "year"];

interface AdminRevenueAnalyticsProps {
  boostStats: AdminBoostStats;
  boostHistory: AdminBoostHistoryRow[];
}

export function AdminRevenueAnalytics({ boostStats, boostHistory }: AdminRevenueAnalyticsProps) {
  const { t, locale } = useTranslation();
  const [range, setRange] = useState<RevenueTimeRange>("month");

  const chartPoints = useMemo(
    () => buildRevenueChartPoints(boostHistory, range, locale),
    [boostHistory, range, locale]
  );

  const filteredTotal = useMemo(
    () => getFilteredRevenueTotal(boostHistory, range),
    [boostHistory, range]
  );

  const averageTransaction = useMemo(() => getAverageTransaction(boostHistory), [boostHistory]);

  const totalKnownRevenue = boostStats.totalRevenue > 0 ? boostStats.totalRevenue : null;
  const boostShare = getBoostRevenueShare(boostStats.totalRevenue, boostStats.totalRevenue);

  const rangeLabels: Record<RevenueTimeRange, string> = {
    today: t.admin.revenue.filterToday,
    week: t.admin.revenue.filterWeek,
    month: t.admin.revenue.filterMonth,
    year: t.admin.revenue.filterYear,
  };

  const hasRevenueHistory = boostHistory.some((row) => row.amount > 0);
  const displayTotal =
    chartPoints.length > 0
      ? filteredTotal
      : !hasRevenueHistory && boostStats.totalRevenue > 0
        ? boostStats.totalRevenue
        : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.34 }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            {t.admin.revenue.title}
          </h2>
          <p className="mt-1 text-sm text-surface-500">{t.admin.revenue.subtitle}</p>
        </div>

        <div className="inline-flex flex-wrap gap-1 rounded-xl border border-surface-200/80 bg-white p-1 shadow-sm">
          {TIME_RANGES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                range === value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
              )}
            >
              {rangeLabels[value]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="border-b border-surface-100 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-surface-400">
                {t.admin.revenue.periodTotal}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-surface-900">
                {displayTotal !== null && displayTotal > 0
                  ? formatPrice(displayTotal, undefined, locale)
                  : "—"}
              </p>
            </div>
            <p className="text-xs text-surface-400">{t.admin.revenue.boostSourceNote}</p>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_280px]">
          <AdminRevenueChart points={chartPoints} />

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-surface-400">
              {t.admin.revenue.sourcesTitle}
            </p>
            <AdminRevenueSourceCard
              title={t.admin.revenue.sourceBoost}
              icon={Rocket}
              revenue={boostStats.totalRevenue > 0 ? boostStats.totalRevenue : null}
              percentage={boostShare}
              delay={0.38}
            />
            <AdminRevenueSourceCard
              title={t.admin.revenue.sourcePromotions}
              icon={Gift}
              revenue={null}
              percentage={null}
              comingSoon
              delay={0.42}
            />
            <AdminRevenueSourceCard
              title={t.admin.revenue.sourceSubscriptions}
              icon={Star}
              revenue={null}
              percentage={null}
              comingSoon
              delay={0.46}
            />
            <AdminRevenueSourceCard
              title={t.admin.revenue.sourceAdvertising}
              icon={Megaphone}
              revenue={null}
              percentage={null}
              comingSoon
              delay={0.5}
            />
          </div>
        </div>

        <div className="grid gap-3 border-t border-surface-100 px-5 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <AdminRevenuePerformanceCard
            title={t.admin.revenue.avgTransaction}
            value={
              averageTransaction !== null
                ? formatPrice(Math.round(averageTransaction), undefined, locale)
                : "—"
            }
            icon={Wallet}
            unavailable={averageTransaction === null}
            delay={0.52}
          />
          <AdminRevenuePerformanceCard
            title={t.admin.revenue.topSource}
            value={
              boostStats.totalRevenue > 0 ? t.admin.revenue.sourceBoost : t.admin.comingSoonShort
            }
            icon={BarChart3}
            unavailable={boostStats.totalRevenue <= 0}
            delay={0.56}
          />
          <AdminRevenuePerformanceCard
            title={t.admin.revenue.monthlyGrowth}
            value={t.admin.comingSoonShort}
            icon={TrendingUp}
            unavailable
            delay={0.6}
          />
          <AdminRevenuePerformanceCard
            title={t.admin.revenue.totalRevenue}
            value={
              totalKnownRevenue !== null
                ? formatPrice(totalKnownRevenue, undefined, locale)
                : "—"
            }
            icon={Banknote}
            unavailable={totalKnownRevenue === null}
            delay={0.64}
          />
        </div>
      </div>
    </motion.section>
  );
}
