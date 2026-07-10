"use client";

import { motion } from "framer-motion";
import { CheckCircle2, CircleDashed, ImageIcon, Star, Store } from "lucide-react";
import { areCoreDocumentsComplete } from "@/lib/admin/verification-review-drawer-display";
import type { AdminVerificationRequestRow } from "@/services/admin-verification.service";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface VerificationQuickInsightsProps {
  request: AdminVerificationRequestRow;
  isPremium: boolean | null;
  listingsCount: number | null;
  loading?: boolean;
}

function InsightCard({
  label,
  available,
  positive,
  delay,
}: {
  label: string;
  available: boolean | null;
  positive?: boolean;
  delay: number;
}) {
  const { t } = useTranslation();
  const showComingSoon = available === null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
      whileHover={{ y: -3 }}
      className={cn(
        "min-w-[9.5rem] shrink-0 rounded-xl border px-3 py-3 shadow-sm transition-shadow hover:shadow-md sm:min-w-[10.5rem]",
        showComingSoon
          ? "border-surface-200/80 bg-surface-50/60"
          : positive
            ? "border-emerald-200/80 bg-emerald-50/50"
            : "border-surface-200/80 bg-white"
      )}
    >
      <div className="flex items-start gap-2">
        {showComingSoon ? (
          <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
        ) : positive ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        ) : (
          <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-snug text-surface-800">{label}</p>
          <p className="mt-1 text-[10px] font-medium text-surface-400">
            {showComingSoon
              ? t.admin.verifications.comingSoon
              : positive
                ? t.admin.verifications.insights.confirmed
                : t.admin.verifications.insights.notMet}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function InsightSkeleton() {
  return (
    <div className="min-w-[9.5rem] shrink-0 animate-pulse rounded-xl border border-surface-200 bg-surface-50 px-3 py-3 sm:min-w-[10.5rem]">
      <div className="h-4 w-24 rounded bg-surface-200" />
      <div className="mt-2 h-3 w-16 rounded bg-surface-100" />
    </div>
  );
}

export function VerificationQuickInsights({
  request,
  isPremium,
  listingsCount,
  loading,
}: VerificationQuickInsightsProps) {
  const { t } = useTranslation();

  const documentsComplete = areCoreDocumentsComplete(request);
  const imagesUploaded = documentsComplete;

  const insights = [
    {
      icon: CheckCircle2,
      label: t.admin.verifications.insights.documentsComplete,
      available: loading ? null : documentsComplete,
      positive: documentsComplete,
      delay: 0.02,
    },
    {
      icon: ImageIcon,
      label: t.admin.verifications.insights.imagesUploaded,
      available: loading ? null : imagesUploaded,
      positive: imagesUploaded,
      delay: 0.06,
    },
    {
      icon: Star,
      label: t.admin.verifications.insights.premiumUser,
      available: loading ? null : isPremium,
      positive: Boolean(isPremium),
      delay: 0.1,
    },
    {
      icon: Store,
      label: t.admin.verifications.insights.activeSeller,
      available: loading ? null : listingsCount === null ? null : listingsCount > 0,
      positive: Boolean(listingsCount && listingsCount > 0),
      delay: 0.14,
    },
  ];

  return (
    <section aria-label={t.admin.verifications.insights.title} className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
        {t.admin.verifications.insights.title}
      </h3>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <InsightSkeleton key={index} />)
          : insights.map((insight) => (
              <InsightCard
                key={insight.label}
                label={insight.label}
                available={insight.available}
                positive={insight.positive}
                delay={insight.delay}
              />
            ))}
      </div>
    </section>
  );
}
