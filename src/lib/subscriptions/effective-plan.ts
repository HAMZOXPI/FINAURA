import { isPremiumGiftType } from "@/lib/gifts/constants";
import type { AdminGiftType, SubscriptionPlan } from "@/types/database";

export interface EffectivePlanLabels {
  premium: string;
  unlimitedListings: string;
}

export function resolveEffectivePlanDisplayName(
  plan: Pick<SubscriptionPlan, "name" | "slug"> | null,
  activeGiftTypes: AdminGiftType[],
  labels: EffectivePlanLabels
): string {
  const planSlug = plan?.slug ?? "free";
  const planName = plan?.name ?? "Free";

  if (planSlug === "enterprise") {
    return planName;
  }

  if (planSlug === "pro") {
    return labels.premium;
  }

  if (activeGiftTypes.some(isPremiumGiftType)) {
    return labels.premium;
  }

  if (activeGiftTypes.includes("unlimited_listings")) {
    return labels.unlimitedListings;
  }

  return planName;
}
