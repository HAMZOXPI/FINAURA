"use client";

import { motion } from "framer-motion";
import { CheckCircle2, CircleDashed } from "lucide-react";
import type { ProfileCompletenessField } from "@/lib/dashboard/workspace-display";
import { getProfileCompletenessPercent } from "@/lib/dashboard/workspace-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardProfileCompletenessProps {
  fields: ProfileCompletenessField[];
}

export function DashboardProfileCompleteness({ fields }: DashboardProfileCompletenessProps) {
  const { t } = useTranslation();
  const ws = t.dashboard.workspace;
  const percent = getProfileCompletenessPercent(fields);

  const labels: Record<ProfileCompletenessField["key"], string> = {
    avatar: ws.profileAvatar,
    phone: ws.profilePhone,
    email: ws.profileEmail,
    verification: ws.profileVerification,
    bio: ws.profileBio,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-surface-900">
            {ws.profileTitle}
          </h2>
          <p className="mt-1 text-sm text-surface-500">{ws.profileSubtitle}</p>
        </div>
        <div className="text-end">
          <p className="text-2xl font-bold text-brand-600">{percent}%</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-surface-400">
            {ws.profileComplete}
          </p>
        </div>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-surface-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500"
        />
      </div>

      <ul className="space-y-2">
        {fields.map((field, index) => (
          <motion.li
            key={field.key}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className={cn(
              "flex items-center justify-between rounded-xl border px-3 py-2.5",
              field.complete
                ? "border-emerald-100 bg-emerald-50/40"
                : "border-surface-100 bg-surface-50/50"
            )}
          >
            <span className="text-sm font-medium text-surface-800">{labels[field.key]}</span>
            {field.complete ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <CircleDashed className="h-4 w-4 text-surface-400" />
            )}
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
