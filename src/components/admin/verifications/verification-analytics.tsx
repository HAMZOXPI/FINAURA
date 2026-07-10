"use client";

import { motion } from "framer-motion";
import { BarChart3, CalendarDays, CalendarRange, Clock, Percent, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  computeVerificationPageAnalytics,
  type VerificationPageAnalytics,
} from "@/lib/admin/verification-review-drawer-display";
import type { AdminVerificationStats } from "@/services/admin-verification.service";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface VerificationAnalyticsProps {
  stats: AdminVerificationStats;
}

function AnalyticsCard({
  label,
  value,
  suffix,
  icon: Icon,
  accent,
  delay,
  unavailable,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  icon: LucideIcon;
  accent: string;
  delay: number;
  unavailable?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-surface-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-surface-900">
            {unavailable || value === null ? (
              <span className="text-sm font-semibold text-surface-300">
                {t.admin.verifications.comingSoon}
              </span>
            ) : (
              <>
                <AnimatedCounter value={value} />
                {suffix && (
                  <span className="ms-0.5 text-base font-semibold text-surface-500">{suffix}</span>
                )}
              </>
            )}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/[0.04]",
            accent
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}

export function VerificationAnalytics({ stats }: VerificationAnalyticsProps) {
  const { t } = useTranslation();
  const analytics: VerificationPageAnalytics = computeVerificationPageAnalytics(stats);

  const cards = [
    {
      label: t.admin.verifications.analytics.approvalRate,
      value: analytics.approvalRate,
      suffix: "%",
      icon: Percent,
      accent: "bg-emerald-50 text-emerald-600",
      delay: 0.04,
      unavailable: analytics.approvalRate === null,
    },
    {
      label: t.admin.verifications.analytics.rejectionRate,
      value: analytics.rejectionRate,
      suffix: "%",
      icon: TrendingDown,
      accent: "bg-red-50 text-red-600",
      delay: 0.08,
      unavailable: analytics.rejectionRate === null,
    },
    {
      label: t.admin.verifications.analytics.avgWaitingTime,
      value: analytics.avgWaitingTime,
      icon: Clock,
      accent: "bg-indigo-50 text-indigo-600",
      delay: 0.12,
      unavailable: true,
    },
    {
      label: t.admin.verifications.analytics.requestsThisWeek,
      value: analytics.requestsThisWeek,
      icon: CalendarDays,
      accent: "bg-blue-50 text-blue-600",
      delay: 0.16,
      unavailable: true,
    },
    {
      label: t.admin.verifications.analytics.requestsThisMonth,
      value: analytics.requestsThisMonth,
      icon: CalendarRange,
      accent: "bg-purple-50 text-purple-600",
      delay: 0.2,
      unavailable: true,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-brand-600" />
        <h2 className="text-lg font-bold tracking-tight text-surface-900">
          {t.admin.verifications.analytics.title}
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <AnalyticsCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}
