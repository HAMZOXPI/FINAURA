"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  Lightbulb,
  Rocket,
  Sparkles,
  Star,
} from "lucide-react";
import type { SmartInsight } from "@/lib/dashboard/workspace-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardSmartInsightsProps {
  items: SmartInsight[];
}

const toneStyles = {
  info: {
    icon: Sparkles,
    ring: "ring-sky-100",
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "hover:border-sky-200/80",
  },
  success: {
    icon: Star,
    ring: "ring-emerald-100",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "hover:border-emerald-200/80",
  },
  warning: {
    icon: AlertTriangle,
    ring: "ring-amber-100",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "hover:border-amber-200/80",
  },
  brand: {
    icon: Rocket,
    ring: "ring-brand-100",
    bg: "bg-brand-50",
    text: "text-brand-600",
    border: "hover:border-brand-200/80",
  },
};

export function DashboardSmartInsights({ items }: DashboardSmartInsightsProps) {
  const { t } = useTranslation();
  const analytics = t.dashboard.workspace.analytics;
  const insightsCopy = analytics.insights;

  if (items.length === 0) return null;

  const titles: Record<string, string> = {
    featuredListing: insightsCopy.featuredListing,
    boostExpiring: insightsCopy.boostExpiring,
    completeProfile: insightsCopy.completeProfile,
    uploadPhotos: insightsCopy.uploadPhotos,
    verifyAccount: insightsCopy.verifyAccount,
    renewSubscription: insightsCopy.renewSubscription,
    boostListing: insightsCopy.boostListing,
    upgradePremium: insightsCopy.upgradePremium,
  };

  const descriptions: Record<string, string> = {
    featuredListing: insightsCopy.featuredListingDesc,
    boostExpiring: insightsCopy.boostExpiringDesc,
    completeProfile: insightsCopy.completeProfileDesc,
    uploadPhotos: insightsCopy.uploadPhotosDesc,
    verifyAccount: insightsCopy.verifyAccountDesc,
    renewSubscription: insightsCopy.renewSubscriptionDesc,
    boostListing: insightsCopy.boostListingDesc,
    upgradePremium: insightsCopy.upgradePremiumDesc,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      className="h-full rounded-2xl border border-surface-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:p-6"
    >
      <div className="mb-5">
        <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-surface-900">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          {analytics.smartInsightsTitle}
        </h3>
        <p className="mt-1 text-sm text-surface-500">{analytics.smartInsightsSubtitle}</p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const tone = toneStyles[item.tone];
          const Icon = tone.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border border-surface-100 bg-surface-50/40 p-3.5 transition-all hover:bg-white hover:shadow-md",
                  tone.border
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
                    tone.bg,
                    tone.text,
                    tone.ring
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-surface-900">
                    {titles[item.titleKey] ?? item.titleKey}
                  </p>
                  <p className="mt-0.5 text-sm text-surface-500">
                    {descriptions[item.descriptionKey] ?? item.descriptionKey}
                  </p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-surface-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
