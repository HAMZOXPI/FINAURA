"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Building2,
  CreditCard,
  MessageSquare,
  Rocket,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AdminBoostStats } from "@/services/admin-boost.service";
import type { AdminDashboardStats } from "@/services/admin.service";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

type SummaryTone = "success" | "neutral" | "warning" | "info";

const TONE_STYLES: Record<SummaryTone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
  neutral: "bg-surface-100 text-surface-600 ring-surface-200/80",
  warning: "bg-amber-50 text-amber-700 ring-amber-200/80",
  info: "bg-blue-50 text-blue-700 ring-blue-200/80",
};

interface SummaryItemProps {
  icon: LucideIcon;
  label: string;
  chip: string;
  tone: SummaryTone;
  delay: number;
}

function SummaryItem({ icon: Icon, label, chip, tone, delay }: SummaryItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32, ease: "easeOut" }}
      className="flex min-w-0 items-center gap-3 rounded-xl border border-surface-200/70 bg-white px-4 py-3 shadow-sm"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-50 text-surface-600 ring-1 ring-surface-200/60">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-surface-500">{label}</p>
        <span
          className={cn(
            "mt-1 inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
            TONE_STYLES[tone]
          )}
        >
          {chip}
        </span>
      </div>
    </motion.div>
  );
}

interface AdminPlatformSummaryProps {
  stats: AdminDashboardStats;
  boostStats: AdminBoostStats;
}

export function AdminPlatformSummary({ stats, boostStats }: AdminPlatformSummaryProps) {
  const { t } = useTranslation();

  const items: SummaryItemProps[] = [
    {
      icon: Activity,
      label: t.admin.summaryPlatform,
      chip: t.admin.statusOnline,
      tone: "success",
      delay: 0.42,
    },
    {
      icon: Users,
      label: t.admin.summaryUsers,
      chip:
        stats.totalUsers > 0
          ? t.admin.summaryUsersCount.replace("{count}", String(stats.totalUsers))
          : t.admin.statusInactive,
      tone: stats.totalUsers > 0 ? "info" : "neutral",
      delay: 0.46,
    },
    {
      icon: Building2,
      label: t.admin.summaryListings,
      chip:
        stats.activeListings > 0
          ? t.admin.summaryActiveListings.replace("{count}", String(stats.activeListings))
          : t.admin.statusInactive,
      tone: stats.activeListings > 0 ? "success" : "neutral",
      delay: 0.5,
    },
    {
      icon: Rocket,
      label: t.admin.summaryBoost,
      chip:
        boostStats.activeBoosts > 0
          ? t.admin.summaryActiveBoosts.replace("{count}", String(boostStats.activeBoosts))
          : t.admin.statusInactive,
      tone: boostStats.activeBoosts > 0 ? "warning" : "neutral",
      delay: 0.54,
    },
    {
      icon: CreditCard,
      label: t.admin.summaryPayments,
      chip: t.admin.comingSoonShort,
      tone: "neutral",
      delay: 0.58,
    },
    {
      icon: MessageSquare,
      label: t.admin.summaryMessages,
      chip:
        stats.totalMessages > 0
          ? t.admin.summaryMessagesCount.replace("{count}", String(stats.totalMessages))
          : t.admin.statusInactive,
      tone: stats.totalMessages > 0 ? "info" : "neutral",
      delay: 0.62,
    },
  ];

  return (
    <section className="space-y-4">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400"
      >
        {t.admin.platformSummary}
      </motion.h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => (
          <SummaryItem key={item.label} {...item} />
        ))}
      </div>
    </section>
  );
}
