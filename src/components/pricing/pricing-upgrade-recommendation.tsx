"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Crown, Sparkles } from "lucide-react";
import {
  getPlanBySlug,
  getRecommendedUpgradeSlug,
} from "@/lib/pricing/pricing-display";
import { cn, formatPlanPrice, interpolate } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types/database";
import { useTranslation } from "@/i18n/locale-provider";

interface PricingUpgradeRecommendationProps {
  plans: SubscriptionPlan[];
  currentPlanSlug: string | null;
}

export function PricingUpgradeRecommendation({
  plans,
  currentPlanSlug,
}: PricingUpgradeRecommendationProps) {
  const { t, locale } = useTranslation();
  const upgrade = t.pricing.upgrade;
  const recommendedSlug = getRecommendedUpgradeSlug(currentPlanSlug);

  if (!recommendedSlug) return null;

  const recommendedPlan = getPlanBySlug(plans, recommendedSlug);
  if (!recommendedPlan) return null;

  const isEnterprise = recommendedSlug === "enterprise";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.45 }}
      className="mb-8"
    >
      <Link
        href="/register"
        className="group block overflow-hidden rounded-2xl border border-brand-200/60 bg-gradient-to-r from-brand-50/60 via-white to-violet-50/40 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_rgba(0,105,198,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,105,198,0.12)] sm:p-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
                isEnterprise
                  ? "bg-violet-100 text-violet-600 ring-violet-200/80"
                  : "bg-brand-100 text-brand-600 ring-brand-200/80"
              )}
            >
              {isEnterprise ? (
                <Crown className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700/80">
                {upgrade.eyebrow}
              </p>
              <p className="mt-0.5 text-base font-bold text-surface-900 sm:text-lg">
                {interpolate(upgrade.title, { plan: recommendedPlan.name })}
              </p>
              <p className="mt-1 text-sm text-surface-500">
                {isEnterprise ? upgrade.enterpriseDesc : upgrade.proDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:shrink-0">
            <div className="text-end">
              <p className="text-lg font-bold text-surface-900">
                {formatPlanPrice(recommendedPlan.price_monthly, locale)}
              </p>
              <p className="text-xs text-surface-500">{t.pricing.perMonth}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform group-hover:translate-x-0.5">
              {upgrade.cta}
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
