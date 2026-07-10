"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import type { VerificationInsightsData } from "@/lib/dashboard/workspace-display";
import type { SellerVerificationStatus } from "@/services/verification.service";
import { cn, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardVerificationInsightsProps {
  data: VerificationInsightsData;
}

function StatusPill({
  label,
  active,
  tone,
}: {
  label: string;
  active: boolean;
  tone: "emerald" | "amber" | "red" | "surface";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    amber: "bg-amber-50 text-amber-700 ring-amber-200/80",
    red: "bg-red-50 text-red-700 ring-red-200/80",
    surface: "bg-surface-100 text-surface-500 ring-surface-200/80",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        active ? tones[tone] : tones.surface
      )}
    >
      {label}
    </span>
  );
}

export function DashboardVerificationInsights({ data }: DashboardVerificationInsightsProps) {
  const { t, locale } = useTranslation();
  const analytics = t.dashboard.workspace.analytics;
  const ws = t.dashboard.workspace;

  const statusLabels: Record<SellerVerificationStatus, string> = {
    verified: t.dashboard.verificationVerified,
    pending: t.dashboard.verificationPending,
    rejected: t.dashboard.verificationRejected,
    not_verified: t.dashboard.verificationNotVerified,
  };

  const reviewLabels = {
    approved: analytics.reviewApproved,
    pending: analytics.reviewPending,
    rejected: analytics.reviewRejected,
  };

  if (data.status === "verified") {
    return (
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        whileHover={{ y: -2 }}
        className="h-full overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-5 shadow-[0_1px_3px_rgba(16,185,129,0.08),0_12px_32px_rgba(16,185,129,0.12)] sm:p-6"
      >
        <div className="flex flex-col items-center py-4 text-center sm:py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200/80">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h3 className="mt-4 text-xl font-bold tracking-tight text-emerald-900">
            {analytics.verificationSuccessTitle}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-emerald-700/80">
            {analytics.verificationSuccessDesc}
          </p>
          {data.reviewedAt && (
            <p className="mt-3 text-xs font-medium text-emerald-600/70">
              {analytics.reviewedOn} {formatDate(data.reviewedAt, locale)}
            </p>
          )}
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      whileHover={{ y: -2 }}
      className="h-full rounded-2xl border border-surface-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)] sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-surface-900">
            {analytics.verificationInsightsTitle}
          </h3>
          <p className="mt-1 text-sm text-surface-500">
            {analytics.verificationInsightsSubtitle}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-surface-400">
            {ws.verificationStatus}
          </p>
          <p className="mt-1 text-base font-bold text-surface-900">
            {statusLabels[data.status]}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusPill
            label={analytics.approved}
            active={data.reviewStatus === "approved"}
            tone="emerald"
          />
          <StatusPill
            label={analytics.pending}
            active={data.reviewStatus === "pending" || data.status === "pending"}
            tone="amber"
          />
          <StatusPill
            label={analytics.rejected}
            active={data.reviewStatus === "rejected" || data.status === "rejected"}
            tone="red"
          />
        </div>

        <div className="rounded-xl border border-surface-100 bg-surface-50/60 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-surface-500">{analytics.documentsUploaded}</span>
            <span className="text-sm font-bold text-surface-900">
              {data.documentsUploaded} / {data.documentsTotal}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(data.documentsUploaded / data.documentsTotal) * 100}%`,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-indigo-500"
            />
          </div>
        </div>

        {data.reviewStatus && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-surface-500">{analytics.reviewStatus}</span>
            <span className="font-semibold text-surface-900">
              {reviewLabels[data.reviewStatus]}
            </span>
          </div>
        )}

        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          {analytics.completeVerification}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.section>
  );
}
