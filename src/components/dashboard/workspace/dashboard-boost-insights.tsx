"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Rocket, Sparkles } from "lucide-react";
import { BoostCountdown } from "@/components/boost/boost-countdown";
import type { BoostCenterCampaign } from "@/types/boost";
import { estimateMinimumNextBid } from "@/lib/dashboard/workspace-display";
import { cn, formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardBoostInsightsProps {
  activeBoosts: BoostCenterCampaign[];
}

function InsightRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-surface-100 py-3 last:border-0 last:pb-0 first:pt-0">
      <span className="text-sm text-surface-500">{label}</span>
      <span className="text-sm font-semibold text-surface-900">{value}</span>
    </div>
  );
}

export function DashboardBoostInsights({ activeBoosts }: DashboardBoostInsightsProps) {
  const { t, locale } = useTranslation();
  const analytics = t.dashboard.workspace.analytics;
  const boost = activeBoosts[0] ?? null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      whileHover={{ y: -2 }}
      className="h-full rounded-2xl border border-surface-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)] sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-surface-900">
            {analytics.boostInsightsTitle}
          </h3>
          <p className="mt-1 text-sm text-surface-500">{analytics.boostInsightsSubtitle}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
          <Rocket className="h-5 w-5" />
        </div>
      </div>

      {!boost ? (
        <div className="rounded-2xl border border-dashed border-orange-200/80 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 px-5 py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-orange-100">
            <Sparkles className="h-7 w-7 text-orange-500" />
          </div>
          <p className="mt-4 text-base font-bold text-surface-900">
            {analytics.boostEmptyTitle}
          </p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-surface-500">
            {analytics.boostEmptyDesc}
          </p>
          <Link
            href="/dashboard/boost"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
          >
            {analytics.boostEmptyCta}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          <InsightRow
            label={analytics.currentBoost}
            value={
              <span className="max-w-[160px] truncate text-right">
                {boost.listingTitle}
              </span>
            }
          />
          <InsightRow
            label={analytics.homepagePosition}
            value={
              boost.position === 1
                ? t.dashboard.promoteHomepagePositionOne
                : `#${boost.position}`
            }
          />
          <InsightRow
            label={analytics.remainingTime}
            value={
              <BoostCountdown
                expiresAt={boost.expiresAt}
                compact
                variant="light"
                urgency
              />
            }
          />
          <InsightRow
            label={analytics.currentBid}
            value={formatPrice(boost.amount, undefined, locale)}
          />
          <InsightRow
            label={analytics.minimumNextBid}
            value={formatPrice(estimateMinimumNextBid(boost.amount), undefined, locale)}
          />
          <InsightRow
            label={analytics.boostStatusLabel}
            value={
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
                  boost.status === "active"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200/80"
                    : "bg-surface-100 text-surface-600 ring-surface-200/80"
                )}
              >
                {boost.status}
              </span>
            }
          />
          <Link
            href="/dashboard/boost"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {analytics.manageBoost}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </motion.section>
  );
}
