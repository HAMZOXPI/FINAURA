"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Home,
  Rocket,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import type { ListingAnalyticsMetrics } from "@/lib/dashboard/workspace-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardListingAnalyticsProps {
  metrics: ListingAnalyticsMetrics;
}

function AnalyticsMetricCard({
  label,
  value,
  icon: Icon,
  accent,
  delay,
  comingSoon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  delay: number;
  comingSoon?: boolean;
}) {
  const { t } = useTranslation();
  const analytics = t.dashboard.workspace.analytics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-surface-500 sm:text-sm">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
            {comingSoon ? (
              <span className="text-sm font-semibold text-surface-400">
                {analytics.comingSoon}
              </span>
            ) : (
              <AnimatedCounter value={value} />
            )}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/[0.04] sm:h-11 sm:w-11",
            accent
          )}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardListingAnalytics({ metrics }: DashboardListingAnalyticsProps) {
  const { t } = useTranslation();
  const analytics = t.dashboard.workspace.analytics;

  const cards = [
    {
      key: "total",
      label: analytics.totalListings,
      value: metrics.total,
      icon: Home,
      accent: "bg-brand-50 text-brand-600",
    },
    {
      key: "active",
      label: analytics.activeListings,
      value: metrics.active,
      icon: TrendingUp,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      key: "featured",
      label: analytics.featuredListings,
      value: metrics.featured,
      icon: Star,
      accent: "bg-amber-50 text-amber-600",
    },
    {
      key: "boosted",
      label: analytics.boostedListings,
      value: metrics.boosted,
      icon: Rocket,
      accent: "bg-orange-50 text-orange-600",
    },
    {
      key: "drafts",
      label: analytics.draftListings,
      value: metrics.drafts,
      icon: FileText,
      accent: "bg-surface-100 text-surface-600",
    },
    {
      key: "sold",
      label: analytics.soldRentedListings,
      value: 0,
      icon: Sparkles,
      accent: "bg-violet-50 text-violet-600",
      comingSoon: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <AnalyticsMetricCard
          key={card.key}
          label={card.label}
          value={card.value}
          icon={card.icon}
          accent={card.accent}
          delay={index * 0.04}
          comingSoon={"comingSoon" in card ? card.comingSoon : false}
        />
      ))}
    </div>
  );
}
