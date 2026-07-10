"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { getCurrentPlan } from "@/lib/pricing/pricing-display";
import type { SubscriptionPlan } from "@/types/database";
import { useTranslation } from "@/i18n/locale-provider";

interface PricingCurrentPlanBannerProps {
  plans: SubscriptionPlan[];
  currentPlanSlug: string | null;
}

export function PricingCurrentPlanBanner({
  plans,
  currentPlanSlug,
}: PricingCurrentPlanBannerProps) {
  const { t } = useTranslation();
  const banner = t.pricing.banner;
  const currentPlan = getCurrentPlan(plans, currentPlanSlug);

  if (!currentPlan) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8 overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/50 p-4 shadow-[0_1px_2px_rgba(16,185,129,0.06),0_8px_24px_rgba(16,185,129,0.08)] sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200/80">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700/80">
              {banner.currentPlanLabel}
            </p>
            <p className="mt-0.5 text-lg font-bold text-surface-900">{currentPlan.name}</p>
            <p className="mt-1 text-sm text-surface-500">{banner.currentPlanDesc}</p>
          </div>
        </div>
        <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/80">
          {banner.activeBadge}
        </span>
      </div>
    </motion.div>
  );
}
