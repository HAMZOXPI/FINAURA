"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/locale-provider";

function formatExecutiveDate(locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function AdminDashboardHeader() {
  const { t, locale } = useTranslation();

  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
          {t.admin.executiveTitle}
        </h1>
        <p className="mt-2 text-base text-surface-500">{t.admin.dashboardSubtitle}</p>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <time
          dateTime={new Date().toISOString().slice(0, 10)}
          className="text-sm font-medium text-surface-500"
        >
          {formatExecutiveDate(locale)}
        </time>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {t.admin.systemOnline}
        </span>
      </div>
    </motion.header>
  );
}
