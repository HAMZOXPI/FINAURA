"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Copy, FileSearch, ScanFace, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

function RiskMetric({
  icon: Icon,
  label,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  delay: number;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
      whileHover={{ y: -2 }}
      className="flex items-center justify-between gap-3 rounded-xl border border-surface-100 bg-white px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-100 text-surface-500">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="text-sm font-medium text-surface-700">{label}</span>
      </div>
      <span className="shrink-0 rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-semibold text-surface-400 ring-1 ring-surface-200/80">
        {t.admin.verifications.comingSoon}
      </span>
    </motion.div>
  );
}

export function VerificationRiskPanel() {
  const { t } = useTranslation();

  const metrics = [
    { icon: ShieldAlert, label: t.admin.verifications.risk.score, delay: 0.04 },
    { icon: ScanFace, label: t.admin.verifications.risk.identityMatch, delay: 0.08 },
    { icon: FileSearch, label: t.admin.verifications.risk.documentQuality, delay: 0.12 },
    { icon: Copy, label: t.admin.verifications.risk.duplicateDetection, delay: 0.16 },
    { icon: AlertTriangle, label: t.admin.verifications.risk.faceMatch, delay: 0.2 },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-surface-200/80 bg-gradient-to-br from-surface-50/80 to-white shadow-sm">
      <div className="border-b border-surface-100 bg-surface-950/[0.02] px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-surface-900">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          {t.admin.verifications.risk.title}
        </h3>
        <p className="mt-0.5 text-xs text-surface-500">{t.admin.verifications.risk.subtitle}</p>
      </div>
      <div className="space-y-2 p-3">
        {metrics.map((metric) => (
          <RiskMetric key={metric.label} {...metric} />
        ))}
      </div>
    </section>
  );
}
