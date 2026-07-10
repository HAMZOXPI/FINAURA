"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

export function AdminActivityEmptyState({ tabLabel }: { tabLabel?: string }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center px-6 py-14 text-center"
    >
      <div className="relative">
        <div className="absolute inset-0 scale-150 rounded-full bg-surface-100 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-surface-200/80">
          <Activity className="h-7 w-7 text-surface-400" strokeWidth={1.75} />
        </div>
      </div>
      <p className="mt-6 text-base font-semibold text-surface-900">
        {tabLabel ? t.admin.activity.emptyTabTitle.replace("{tab}", tabLabel) : t.admin.activity.emptyTitle}
      </p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-surface-500">
        {t.admin.activity.emptySubtitle}
      </p>
    </motion.div>
  );
}
