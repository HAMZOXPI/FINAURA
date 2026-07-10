"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { VerificationExportBar } from "@/components/admin/verifications/verification-export-bar";
import { useTranslation } from "@/i18n/locale-provider";

function formatExecutiveDate(locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function formatLiveTime(locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function AdminVerificationsHeader() {
  const { t, locale } = useTranslation();
  const [liveTime, setLiveTime] = useState(() => formatLiveTime(locale));

  useEffect(() => {
    setLiveTime(formatLiveTime(locale));
    const timer = window.setInterval(() => setLiveTime(formatLiveTime(locale)), 30_000);
    return () => window.clearInterval(timer);
  }, [locale]);

  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
          <span aria-hidden>🛡️</span>
          {t.admin.verifications.title}
        </h1>
        <p className="mt-2 max-w-2xl text-surface-500">{t.admin.verifications.subtitle}</p>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:items-end">
        <VerificationExportBar />
        <div className="text-end">
          <time
            dateTime={new Date().toISOString().slice(0, 10)}
            className="block text-sm font-medium text-surface-500"
          >
            {formatExecutiveDate(locale)}
          </time>
          <p className="text-xs tabular-nums text-surface-400">{liveTime}</p>
        </div>
        <span className="inline-flex items-center gap-2 self-end rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {t.admin.verifications.systemOperational}
        </span>
      </div>
    </motion.header>
  );
}
