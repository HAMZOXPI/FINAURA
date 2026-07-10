"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardWorkspaceHeaderProps {
  userName: string;
  subtitleKey: "overview" | "ready" | "performance";
  isPremium: boolean;
}

function formatExecutiveDate(locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function DashboardWorkspaceHeader({
  userName,
  subtitleKey,
  isPremium,
}: DashboardWorkspaceHeaderProps) {
  const { t, locale } = useTranslation();
  const ws = t.dashboard.workspace;
  const [dateLabel, setDateLabel] = useState(() => formatExecutiveDate(locale));

  useEffect(() => {
    setDateLabel(formatExecutiveDate(locale));
  }, [locale]);

  const subtitles = {
    overview: ws.subtitleOverview,
    ready: ws.subtitleReady,
    performance: ws.subtitlePerformance,
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
          {ws.greeting.replace("{name}", userName || ws.defaultName)}
        </h1>
        <p className="mt-2 max-w-2xl text-surface-500">{subtitles[subtitleKey]}</p>
      </div>

      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            {ws.welcomeBadge}
          </span>
          {isPremium && (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <Crown className="h-3.5 w-3.5" />
              {ws.premiumBadge}
            </span>
          )}
        </div>
        <time
          dateTime={new Date().toISOString().slice(0, 10)}
          className={cn("text-sm font-medium text-surface-500", "sm:text-end")}
        >
          {dateLabel}
        </time>
      </div>
    </motion.header>
  );
}
