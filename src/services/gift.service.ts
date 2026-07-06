import type { AdminGift, AdminGiftType } from "@/types/database";
import { resolveEffectiveGiftStatus } from "@/lib/gifts/constants";
import { createClient } from "@/lib/supabase/server";

export interface ListingGiftAdjustments {
  unlimited: boolean;
  extraCredits: number;
}

function isGiftCurrentlyActive(gift: AdminGift): boolean {
  return resolveEffectiveGiftStatus(gift.status, gift.expires_at) === "active";
}

export async function getActiveGiftsForUser(userId: string): Promise<AdminGift[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_gifts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getActiveGiftsForUser:", error.message);
    return [];
  }

  return ((data as AdminGift[]) ?? []).filter(isGiftCurrentlyActive);
}

export async function getListingGiftAdjustments(userId: string): Promise<ListingGiftAdjustments> {
  const gifts = await getActiveGiftsForUser(userId);

  let unlimited = false;
  let extraCredits = 0;

  for (const gift of gifts) {
    if (gift.gift_type === "unlimited_listings") {
      unlimited = true;
    }
    if (gift.gift_type === "extra_listing_credits") {
      extraCredits += gift.quantity_remaining ?? gift.quantity ?? 0;
    }
  }

  return { unlimited, extraCredits };
}

export async function getUserCreditBalance(
  userId: string,
  giftType: Extract<AdminGiftType, "featured_listing_credits" | "boost_credits">
): Promise<number> {
  const gifts = await getActiveGiftsForUser(userId);
  return gifts
    .filter((gift) => gift.gift_type === giftType)
    .reduce((total, gift) => total + (gift.quantity_remaining ?? gift.quantity ?? 0), 0);
}

export async function getActiveDiscountCoupons(userId: string) {
  const gifts = await getActiveGiftsForUser(userId);
  return gifts
    .filter((gift) => gift.gift_type === "discount_coupon")
    .map((gift) => ({
      id: gift.id,
      code: String(gift.metadata?.coupon_code ?? ""),
      discountPercent: Number(gift.metadata?.discount_percent ?? gift.quantity ?? 0),
      expiresAt: gift.expires_at,
    }))
    .filter((coupon) => coupon.code);
}

export async function activatePremiumGift(
  userId: string,
  expiresAt: string | null,
  planSlug = "pro"
): Promise<{ previousPlanId?: string; previousPeriodEnd?: string | null; premiumPlanSlug: string }> {
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("id")
    .eq("slug", planSlug)
    .maybeSingle();

  if (!plan) {
    throw new Error(`Subscription plan "${planSlug}" not found`);
  }

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("plan_id, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      plan_id: plan.id,
      status: "active",
      current_period_end: expiresAt,
    })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return {
    previousPlanId: subscription?.plan_id,
    previousPeriodEnd: subscription?.current_period_end ?? null,
    premiumPlanSlug: planSlug,
  };
}

export async function activatePremiumExtension(
  userId: string,
  expiresAt: string | null,
  durationDays?: number | null
): Promise<{
  previousPlanId?: string;
  previousPeriodEnd?: string | null;
}> {
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("plan_id, current_period_end, plan:subscription_plans(slug)")
    .eq("user_id", userId)
    .maybeSingle();

  if (!subscription) {
    throw new Error("User subscription not found");
  }

  let nextPeriodEnd = expiresAt;

  if (!nextPeriodEnd && durationDays && durationDays > 0) {
    const baseDate =
      subscription.current_period_end && new Date(subscription.current_period_end) > new Date()
        ? new Date(subscription.current_period_end)
        : new Date();
    baseDate.setDate(baseDate.getDate() + durationDays);
    nextPeriodEnd = baseDate.toISOString();
  }

  if (!nextPeriodEnd) {
    throw new Error("Expiration date or duration is required for premium extension");
  }

  const planSlug = (subscription.plan as { slug?: string } | null)?.slug ?? "free";
  const updates: Record<string, unknown> = {
    current_period_end: nextPeriodEnd,
    status: "active",
  };

  if (planSlug === "free") {
    const { data: proPlan } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("slug", "pro")
      .maybeSingle();
    if (proPlan) updates.plan_id = proPlan.id;
  }

  const { error } = await supabase.from("user_subscriptions").update(updates).eq("user_id", userId);

  if (error) throw new Error(error.message);

  return {
    previousPlanId: subscription.plan_id,
    previousPeriodEnd: subscription.current_period_end ?? null,
  };
}

export async function restorePremiumGift(
  userId: string,
  metadata: Record<string, unknown>,
  giftType?: AdminGiftType
): Promise<void> {
  const supabase = await createClient();

  if (giftType === "premium_extension") {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        current_period_end: (metadata.previous_period_end as string | null) ?? null,
      })
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return;
  }

  const previousPlanId = metadata.previous_plan_id as string | undefined;
  if (!previousPlanId) return;

  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      plan_id: previousPlanId,
      current_period_end: (metadata.previous_period_end as string | null) ?? null,
      status: "active",
    })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function syncPremiumGiftExpiration(userId: string, expiresAt: string | null): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_subscriptions")
    .update({ current_period_end: expiresAt })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function markExpiredGifts(): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  await supabase
    .from("admin_gifts")
    .update({ status: "expired" })
    .eq("status", "active")
    .not("expires_at", "is", null)
    .lte("expires_at", now);
}
