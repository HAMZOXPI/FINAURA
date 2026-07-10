"use client";

import { motion } from "framer-motion";
import {
  countUploadedDocuments,
  formatReviewDuration,
} from "@/lib/admin/verification-review-drawer-display";
import type { AdminVerificationRequestRow } from "@/services/admin-verification.service";
import type { Locale } from "@/i18n/config";
import { cn, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface VerificationSummaryCardProps {
  request: AdminVerificationRequestRow;
  locale: Locale;
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs font-medium text-surface-500">{label}</span>
      <span
        className={cn(
          "text-end text-sm font-semibold",
          highlight ? "text-brand-700" : "text-surface-900"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function VerificationSummaryCard({ request, locale }: VerificationSummaryCardProps) {
  const { t } = useTranslation();

  const statusLabel =
    request.status === "pending"
      ? t.admin.verifications.statusPending
      : request.status === "approved"
        ? t.admin.verifications.statusApproved
        : t.admin.verifications.statusRejected;

  const reviewDuration = formatReviewDuration(request.created_at, request.reviewed_at);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
        {t.admin.verifications.summary.title}
      </h3>
      <div className="mt-2 divide-y divide-surface-100">
        <SummaryRow
          label={t.admin.verifications.summary.documentsUploaded}
          value={String(countUploadedDocuments(request))}
          highlight
        />
        <SummaryRow
          label={t.admin.verifications.summary.verificationStatus}
          value={statusLabel}
        />
        <SummaryRow
          label={t.admin.verifications.summary.submissionDate}
          value={formatDate(request.created_at, locale)}
        />
        <SummaryRow
          label={t.admin.verifications.summary.reviewDuration}
          value={reviewDuration ?? "—"}
        />
        <SummaryRow
          label={t.admin.verifications.summary.reviewer}
          value="—"
        />
      </div>
    </motion.section>
  );
}
