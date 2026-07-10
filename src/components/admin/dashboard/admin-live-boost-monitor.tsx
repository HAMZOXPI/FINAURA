"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Rocket, Sparkles, Wallet } from "lucide-react";
import type { AdminBoostStats, AdminFeaturedListingRow } from "@/services/admin-boost.service";
import type { BoostSettings } from "@/services/boost-settings.service";
import {
  buildBoostMonitorSlots,
  countAvailablePositions,
  getNextExpiration,
} from "@/lib/admin/boost-monitor-display";
import { formatDate, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { AdminBoostPositionCard } from "@/components/admin/dashboard/admin-boost-position-card";
import { BoostCountdown } from "@/components/boost/boost-countdown";

interface AdminLiveBoostMonitorProps {
  boostStats: AdminBoostStats;
  featuredListings: AdminFeaturedListingRow[];
  boostSettings: BoostSettings;
}

export function AdminLiveBoostMonitor({
  boostStats,
  featuredListings,
  boostSettings,
}: AdminLiveBoostMonitorProps) {
  const { t, locale } = useTranslation();

  const slots = buildBoostMonitorSlots(featuredListings, boostSettings.featuredPositions);
  const availableCount = countAvailablePositions(slots);
  const nextExpiration = getNextExpiration(featuredListings);

  const kpiPills: Array<{
    label: string;
    value: ReactNode;
    icon: typeof Rocket;
    tone: string;
  }> = [
    {
      label: t.admin.boostMonitor.kpiActiveBoosts,
      value: String(boostStats.activeBoosts),
      icon: Rocket,
      tone: "bg-amber-50 text-amber-700 ring-amber-200/80",
    },
    {
      label: t.admin.boostMonitor.kpiAvailable,
      value: String(availableCount),
      icon: Sparkles,
      tone: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    },
    {
      label: t.admin.boostMonitor.kpiTodayRevenue,
      value: formatPrice(boostStats.todayRevenue, undefined, locale),
      icon: Wallet,
      tone: "bg-blue-50 text-blue-700 ring-blue-200/80",
    },
    {
      label: t.admin.boostMonitor.kpiNextExpiration,
      value: nextExpiration ? (
        <BoostCountdown expiresAt={nextExpiration} compact variant="light" urgency />
      ) : (
        "—"
      ),
      icon: Clock,
      tone: "bg-violet-50 text-violet-700 ring-violet-200/80",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.66 }}
      className="overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"
    >
      <div className="flex flex-col gap-4 border-b border-surface-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
            <span aria-hidden>🚀</span>
            {t.admin.boostMonitor.title}
          </h2>
          <p className="mt-1 text-sm text-surface-500">{t.admin.boostMonitor.subtitle}</p>
        </div>

        <Link
          href="/admin/boost"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50 hover:shadow-md"
        >
          {t.admin.boostMonitor.viewMarketplace}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-surface-100 px-5 py-4 sm:px-6">
        {kpiPills.map((pill, index) => {
          const Icon = pill.icon;

          return (
            <motion.div
              key={pill.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.04, duration: 0.3 }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset",
                pill.tone
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={2} />
              <span className="text-surface-500">{pill.label}</span>
              <span className="font-bold text-surface-900">{pill.value}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        {slots.map((slot, index) => (
          <AdminBoostPositionCard key={slot.position} slot={slot} index={index} />
        ))}
      </div>

      <div className="border-t border-surface-100 px-5 py-4 sm:px-6">
        <Link
          href="/admin/boost"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
        >
          {t.admin.boostMonitor.manageAll}
          <ArrowRight className="h-4 w-4" />
        </Link>
        {nextExpiration && (
          <p className="mt-2 text-xs text-surface-400">
            {t.admin.boostMonitor.nextExpirationHint.replace(
              "{date}",
              formatDate(nextExpiration, locale)
            )}
          </p>
        )}
      </div>
    </motion.section>
  );
}
