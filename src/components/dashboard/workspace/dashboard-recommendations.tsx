"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lightbulb } from "lucide-react";
import type { DashboardRecommendation } from "@/lib/dashboard/workspace-display";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardRecommendationsProps {
  items: DashboardRecommendation[];
}

export function DashboardRecommendations({ items }: DashboardRecommendationsProps) {
  const { t } = useTranslation();
  const rec = t.dashboard.workspace.recommendations;

  if (items.length === 0) return null;

  const titles: Record<string, string> = {
    completeProfile: rec.completeProfile,
    verifyAccount: rec.verifyAccount,
    boostListing: rec.boostListing,
    secondListing: rec.secondListing,
    upgradePlan: rec.upgradePlan,
  };

  const descriptions: Record<string, string> = {
    completeProfile: rec.completeProfileDesc,
    verifyAccount: rec.verifyAccountDesc,
    boostListing: rec.boostListingDesc,
    secondListing: rec.secondListingDesc,
    upgradePlan: rec.upgradePlanDesc,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="space-y-4"
    >
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-surface-900">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          {rec.title}
        </h2>
        <p className="mt-1 text-sm text-surface-500">{rec.subtitle}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <Link
              href={item.href}
              className="group flex items-start justify-between gap-3 rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div>
                <p className="font-semibold text-surface-900">
                  {titles[item.titleKey] ?? item.titleKey}
                </p>
                <p className="mt-1 text-sm text-surface-500">
                  {descriptions[item.descriptionKey] ?? item.descriptionKey}
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-surface-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
