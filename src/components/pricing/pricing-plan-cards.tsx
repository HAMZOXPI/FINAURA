"use client";

import { motion } from "framer-motion";
import { Building2, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingFeatureIcon } from "@/components/pricing/pricing-feature-icon";
import type { BillingInterval } from "@/lib/pricing/pricing-display";
import {
  getPlanCtaHref,
  getPlanVisualConfig,
  sortPlansForDisplay,
} from "@/lib/pricing/pricing-display";
import { cn, formatPlanPrice, interpolate } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types/database";
import { useTranslation } from "@/i18n/locale-provider";

interface PricingPlanCardsProps {
  plans: SubscriptionPlan[];
  currentPlanSlug: string | null;
  billingInterval: BillingInterval;
}

function PlanBadge({
  label,
  tone,
}: {
  label: string;
  tone: "popular" | "current" | "enterprise";
}) {
  const tones = {
    popular:
      "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-[0_2px_10px_rgba(0,105,198,0.22)]",
    current:
      "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_2px_10px_rgba(16,185,129,0.22)]",
    enterprise:
      "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_2px_10px_rgba(91,33,182,0.22)]",
  };

  return (
    <motion.span
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
        tones[tone]
      )}
    >
      {label}
    </motion.span>
  );
}

/** Fixed-height slot so every card aligns regardless of badge presence. */
function PlanCardHeader({
  badge,
}: {
  badge: { label: string; tone: "popular" | "current" | "enterprise" } | null;
}) {
  return (
    <div className="flex h-9 shrink-0 items-center">
      {badge ? <PlanBadge label={badge.label} tone={badge.tone} /> : null}
    </div>
  );
}

function AnimatedBorderGlow({
  active,
  tone,
}: {
  active: boolean;
  tone: "brand" | "emerald" | "violet" | "neutral";
}) {
  const gradients = {
    brand: "from-brand-400/0 via-brand-400/70 to-brand-400/0",
    emerald: "from-emerald-400/0 via-emerald-400/70 to-emerald-400/0",
    violet: "from-violet-400/0 via-violet-400/70 to-violet-400/0",
    neutral: "from-surface-300/0 via-surface-300/50 to-surface-300/0",
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[1.75rem] transition-opacity duration-500",
        active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}
    >
      <div
        className={cn(
          "absolute inset-[-1px] animate-[spin_5s_linear_infinite] rounded-[1.75rem] bg-gradient-to-r opacity-60 blur-[0.5px]",
          gradients[tone]
        )}
      />
    </div>
  );
}

export function PricingPlanCards({
  plans,
  currentPlanSlug,
  billingInterval,
}: PricingPlanCardsProps) {
  const { t, locale } = useTranslation();
  const p = t.pricing;
  const cards = t.pricing.cards;
  const sorted = sortPlansForDisplay(plans);

  if (sorted.length === 0) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center sm:p-10">
        <p className="text-lg font-semibold text-surface-900">{p.dbSetupTitle}</p>
        <p className="mt-2 text-sm text-surface-600">{p.dbSetupDesc}</p>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-fr items-stretch gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-7">
      {sorted.map((plan, index) => {
        const visual = getPlanVisualConfig(plan.slug);
        const isPopular = plan.slug === "pro";
        const isEnterprise = plan.slug === "enterprise";
        const isCurrent = currentPlanSlug === plan.slug;
        const priceLabel = formatPlanPrice(plan.price_monthly, locale);
        const period =
          billingInterval === "yearly"
            ? p.billing.yearlyComingSoon
            : plan.price_monthly === 0
              ? p.forever
              : p.perMonth;

        const ctaLabel =
          plan.slug === "free"
            ? p.getStarted
            : plan.slug === "enterprise"
              ? p.upgradeToEnterprise
              : p.startPro;

        const glowTone = isCurrent
          ? "emerald"
          : isPopular
            ? "brand"
            : isEnterprise
              ? "violet"
              : "neutral";

        const headerBadge = isCurrent
          ? { label: cards.currentPlan, tone: "current" as const }
          : isPopular
            ? { label: p.mostPopular, tone: "popular" as const }
            : isEnterprise
              ? { label: cards.enterpriseBadge, tone: "enterprise" as const }
              : null;

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -10, scale: isPopular && !isCurrent ? 1.02 : 1.01 }}
            className={cn(
              "relative flex h-full flex-col",
              isPopular && !isCurrent && "lg:z-[1]"
            )}
          >
            <div
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-gradient-to-b p-[1px] transition-all duration-500",
                visual.border,
                visual.glow,
                visual.hoverGlow,
                isCurrent &&
                  "border-emerald-300/70 ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-white",
                isPopular && !isCurrent && "lg:-translate-y-1"
              )}
            >
              <AnimatedBorderGlow
                active={isCurrent || isPopular}
                tone={glowTone}
              />

              <div
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-[1.7rem] bg-gradient-to-b p-5 sm:p-7",
                  visual.gradient,
                  isCurrent && "from-emerald-50/50 via-white to-white",
                  isEnterprise &&
                    "from-slate-900/[0.02] via-indigo-50/20 to-violet-50/10"
                )}
              >
                {isEnterprise && (
                  <>
                    <div className="pointer-events-none absolute -end-8 top-12 h-32 w-32 rounded-full bg-violet-300/10 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-10 -start-6 h-28 w-28 rounded-full bg-indigo-300/10 blur-2xl" />
                    <Crown className="pointer-events-none absolute end-4 top-14 h-14 w-14 text-violet-200/30 sm:top-16 sm:h-16 sm:w-16" />
                  </>
                )}

                <PlanCardHeader badge={headerBadge} />

                <div className="relative mb-5 sm:mb-6">
                  <div className="mt-4 flex items-center gap-2">
                    {isEnterprise && (
                      <Building2 className="h-5 w-5 text-violet-500" />
                    )}
                    <h3
                      className={cn(
                        "text-xl font-bold tracking-tight text-surface-900",
                        isEnterprise && "text-violet-950"
                      )}
                    >
                      {plan.name}
                    </h3>
                    {isPopular && !isCurrent && (
                      <span className="rounded-full bg-brand-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                        {cards.recommended}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-end gap-2">
                    {billingInterval === "yearly" ? (
                      <span className="text-xl font-bold text-surface-400 sm:text-2xl">
                        {p.billing.yearlyComingSoon}
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl">
                          {priceLabel}
                        </span>
                        <span className="pb-1.5 text-sm font-medium text-surface-500">
                          {period}
                        </span>
                      </>
                    )}
                  </div>

                  {plan.max_listings !== null && plan.max_listings > 0 && (
                    <p className="mt-2 text-sm text-surface-500">
                      {interpolate(p.upToListings, { count: plan.max_listings })}
                    </p>
                  )}
                  {plan.max_listings === null && plan.slug !== "free" && (
                    <p className="mt-2 text-sm text-surface-500">{p.unlimitedListings}</p>
                  )}
                </div>

                <ul className="relative mb-6 flex-1 space-y-3 sm:mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <PricingFeatureIcon
                        index={featureIndex}
                        iconBg={visual.featureIconBg}
                        iconText={visual.featureIconText}
                      />
                      <span
                        className={cn(
                          "leading-relaxed text-surface-600",
                          isEnterprise && "text-surface-700"
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  href={isCurrent ? undefined : getPlanCtaHref()}
                  variant={isCurrent ? "outline" : visual.buttonVariant}
                  size="lg"
                  disabled={isCurrent}
                  className={cn(
                    "relative mt-auto w-full rounded-xl transition-all duration-300",
                    !isCurrent && "hover:-translate-y-1 hover:shadow-lg",
                    isCurrent &&
                      "border-emerald-300 bg-emerald-50/50 font-semibold text-emerald-700",
                    isPopular &&
                      !isCurrent &&
                      "shadow-[0_8px_24px_-8px_rgba(0,105,198,0.35)]",
                    isEnterprise &&
                      !isCurrent &&
                      "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  )}
                >
                  {isCurrent ? (
                    cards.currentPlan
                  ) : (
                    <>
                      {isEnterprise && <Sparkles className="h-4 w-4" />}
                      {ctaLabel}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
