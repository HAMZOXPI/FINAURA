import type { SubscriptionPlan } from "@/types/database";

export type BillingInterval = "monthly" | "yearly";

export type ComparisonCell =
  | { kind: "included" }
  | { kind: "excluded" }
  | { kind: "text"; value: string }
  | { kind: "coming_soon" };

export interface PricingComparisonRow {
  key:
    | "listings"
    | "boostMarketplace"
    | "favorites"
    | "messages"
    | "prioritySupport"
    | "analytics"
    | "verification"
    | "premiumBadge"
    | "api"
    | "teamMembers"
    | "customBranding";
  free: ComparisonCell;
  pro: ComparisonCell;
  enterprise: ComparisonCell;
}

export interface PlanVisualConfig {
  gradient: string;
  glow: string;
  border: string;
  accent: string;
  buttonVariant: "primary" | "secondary" | "outline";
  featureIconBg: string;
  featureIconText: string;
  hoverGlow: string;
  isDark?: boolean;
}

export function getPlanBySlug(
  plans: SubscriptionPlan[],
  slug: string
): SubscriptionPlan | undefined {
  return plans.find((plan) => plan.slug === slug);
}

export function formatListingsLimit(
  plan: SubscriptionPlan | undefined,
  unlimitedLabel: string,
  upToTemplate: (count: number) => string
): ComparisonCell {
  if (!plan) return { kind: "coming_soon" };
  if (plan.max_listings === null) return { kind: "text", value: unlimitedLabel };
  if (plan.max_listings <= 0) return { kind: "excluded" };
  return { kind: "text", value: upToTemplate(plan.max_listings) };
}

export function formatFavoritesLimit(
  plan: SubscriptionPlan | undefined,
  unlimitedLabel: string,
  upToTemplate: (count: number) => string
): ComparisonCell {
  if (!plan) return { kind: "coming_soon" };
  if (plan.max_favorites === null) return { kind: "text", value: unlimitedLabel };
  return { kind: "text", value: upToTemplate(plan.max_favorites) };
}

export function buildPricingComparisonRows(input: {
  plans: SubscriptionPlan[];
  unlimitedLabel: string;
  upToListings: (count: number) => string;
  upToFavorites: (count: number) => string;
}): PricingComparisonRow[] {
  const free = getPlanBySlug(input.plans, "free");
  const pro = getPlanBySlug(input.plans, "pro");
  const enterprise = getPlanBySlug(input.plans, "enterprise");

  return [
    {
      key: "listings",
      free: formatListingsLimit(free, input.unlimitedLabel, input.upToListings),
      pro: formatListingsLimit(pro, input.unlimitedLabel, input.upToListings),
      enterprise: formatListingsLimit(enterprise, input.unlimitedLabel, input.upToListings),
    },
    {
      key: "boostMarketplace",
      free: { kind: "coming_soon" },
      pro: { kind: "included" },
      enterprise: { kind: "included" },
    },
    {
      key: "favorites",
      free: formatFavoritesLimit(free, input.unlimitedLabel, input.upToFavorites),
      pro: formatFavoritesLimit(pro, input.unlimitedLabel, input.upToFavorites),
      enterprise: formatFavoritesLimit(enterprise, input.unlimitedLabel, input.upToFavorites),
    },
    {
      key: "messages",
      free: { kind: "included" },
      pro: { kind: "included" },
      enterprise: { kind: "included" },
    },
    {
      key: "prioritySupport",
      free: { kind: "excluded" },
      pro: { kind: "included" },
      enterprise: { kind: "included" },
    },
    {
      key: "analytics",
      free: { kind: "coming_soon" },
      pro: { kind: "included" },
      enterprise: { kind: "included" },
    },
    {
      key: "verification",
      free: { kind: "included" },
      pro: { kind: "included" },
      enterprise: { kind: "included" },
    },
    {
      key: "premiumBadge",
      free: { kind: "excluded" },
      pro: { kind: "included" },
      enterprise: { kind: "included" },
    },
    {
      key: "api",
      free: { kind: "coming_soon" },
      pro: { kind: "coming_soon" },
      enterprise: { kind: "included" },
    },
    {
      key: "teamMembers",
      free: { kind: "excluded" },
      pro: { kind: "excluded" },
      enterprise: { kind: "included" },
    },
    {
      key: "customBranding",
      free: { kind: "coming_soon" },
      pro: { kind: "coming_soon" },
      enterprise: { kind: "coming_soon" },
    },
  ];
}

export function getPlanVisualConfig(slug: string): PlanVisualConfig {
  switch (slug) {
    case "pro":
      return {
        gradient: "from-brand-500/[0.06] via-brand-50/40 to-white",
        glow: "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,105,198,0.08),0_24px_64px_rgba(0,105,198,0.06)]",
        border: "border-brand-200/50",
        accent: "bg-brand-600",
        buttonVariant: "primary",
        featureIconBg: "bg-brand-50 ring-brand-100",
        featureIconText: "text-brand-600",
        hoverGlow:
          "group-hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_48px_rgba(0,105,198,0.14),0_32px_80px_rgba(0,105,198,0.1)]",
      };
    case "enterprise":
      return {
        gradient: "from-violet-600/[0.04] via-indigo-50/30 to-slate-50/20",
        glow: "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_rgba(91,33,182,0.1),0_24px_64px_rgba(49,46,129,0.08)]",
        border: "border-violet-200/60",
        accent: "bg-gradient-to-r from-violet-600 to-indigo-600",
        buttonVariant: "secondary",
        featureIconBg: "bg-violet-50 ring-violet-100",
        featureIconText: "text-violet-600",
        hoverGlow:
          "group-hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_48px_rgba(91,33,182,0.16),0_32px_80px_rgba(49,46,129,0.12)]",
        isDark: true,
      };
    default:
      return {
        gradient: "from-surface-100/40 via-white to-white",
        glow: "shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.04)]",
        border: "border-surface-200/70",
        accent: "bg-surface-700",
        buttonVariant: "outline",
        featureIconBg: "bg-surface-50 ring-surface-100",
        featureIconText: "text-surface-600",
        hoverGlow:
          "group-hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_rgba(0,0,0,0.08)]",
      };
  }
}

export function getRecommendedUpgradeSlug(
  currentPlanSlug: string | null
): "pro" | "enterprise" | null {
  if (!currentPlanSlug || currentPlanSlug === "free") return "pro";
  if (currentPlanSlug === "pro") return "enterprise";
  return null;
}

export function getCurrentPlan(
  plans: SubscriptionPlan[],
  currentPlanSlug: string | null
): SubscriptionPlan | null {
  if (!currentPlanSlug) return null;
  return getPlanBySlug(plans, currentPlanSlug) ?? null;
}

export function getPlanCtaHref(): string {
  return "/register";
}

export function sortPlansForDisplay(plans: SubscriptionPlan[]): SubscriptionPlan[] {
  const order = ["free", "pro", "enterprise"];
  return [...plans].sort(
    (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug) || a.price_monthly - b.price_monthly
  );
}

/** Marketing display prices (MAD) — UI only; does not affect billing. */
export const PLAN_DISPLAY_PRICES_MAD: Record<string, number> = {
  free: 0,
  pro: 49,
  enterprise: 195,
};

export function getPlanDisplayPrice(
  plan: Pick<SubscriptionPlan, "slug" | "price_monthly">
): number {
  const displayPrice = PLAN_DISPLAY_PRICES_MAD[plan.slug];
  return displayPrice !== undefined ? displayPrice : plan.price_monthly;
}

export function applyPlanDisplayPrices(plans: SubscriptionPlan[]): SubscriptionPlan[] {
  return plans.map((plan) => ({
    ...plan,
    price_monthly: getPlanDisplayPrice(plan),
  }));
}
