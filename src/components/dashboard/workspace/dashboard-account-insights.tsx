"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Crown, HeartPulse } from "lucide-react";
import type { AccountHealthData } from "@/lib/dashboard/workspace-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardAccountInsightsProps {
  data: AccountHealthData;
}

function HealthCheck({
  label,
  complete,
  delay,
}: {
  label: string;
  complete: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between gap-3 rounded-xl border border-surface-100 bg-surface-50/50 px-3 py-2.5"
    >
      <span className="text-sm text-surface-600">{label}</span>
      <span
        className={cn(
          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
          complete
            ? "bg-emerald-50 text-emerald-700"
            : "bg-surface-100 text-surface-400"
        )}
      >
        {complete ? "✓" : "—"}
      </span>
    </motion.div>
  );
}

export function DashboardAccountInsights({ data }: DashboardAccountInsightsProps) {
  const { t } = useTranslation();
  const analytics = t.dashboard.workspace.analytics;

  const scoreConfig = {
    excellent: {
      label: analytics.scoreExcellent,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
      bar: "bg-emerald-500",
    },
    good: {
      label: analytics.scoreGood,
      className: "bg-sky-50 text-sky-700 ring-sky-200/80",
      bar: "bg-sky-500",
    },
    needs_attention: {
      label: analytics.scoreNeedsAttention,
      className: "bg-amber-50 text-amber-700 ring-amber-200/80",
      bar: "bg-amber-500",
    },
  }[data.score];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      whileHover={{ y: -2 }}
      className="h-full rounded-2xl border border-surface-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)] sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-surface-900">
            {analytics.accountHealthTitle}
          </h3>
          <p className="mt-1 text-sm text-surface-500">{analytics.accountHealthSubtitle}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
          <HeartPulse className="h-5 w-5" />
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-surface-100 bg-gradient-to-br from-surface-50 to-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-surface-400">
              {analytics.overallScore}
            </p>
            <p className="mt-1 text-xl font-bold text-surface-900">{scoreConfig.label}</p>
          </div>
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset",
              scoreConfig.className
            )}
          >
            {data.profileCompletion}%
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.profileCompletion}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={cn("h-full rounded-full", scoreConfig.bar)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <HealthCheck
          label={analytics.emailVerified}
          complete={data.emailVerified}
          delay={0.05}
        />
        <HealthCheck
          label={analytics.phoneVerified}
          complete={data.phoneVerified}
          delay={0.08}
        />
        <HealthCheck
          label={analytics.identityVerified}
          complete={data.identityVerified}
          delay={0.11}
        />
        <HealthCheck
          label={analytics.profileCompletion}
          complete={data.profileCompletion >= 80}
          delay={0.14}
        />
        <HealthCheck
          label={analytics.premiumPlan}
          complete={data.isPremium}
          delay={0.17}
        />
      </div>

      {!data.isPremium && (
        <Link
          href="/pricing"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <Crown className="h-4 w-4" />
          {analytics.upgradeToPremium}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
    </motion.section>
  );
}
