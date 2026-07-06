import type { SubscriptionPlan, UserSubscription } from "@/types/database";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { interpolate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { getActiveGiftsForUser, getListingGiftAdjustments } from "@/services/gift.service";
import { resolveEffectivePlanDisplayName } from "@/lib/subscriptions/effective-plan";

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price_monthly", { ascending: true });

  if (error) return [];
  return (data as SubscriptionPlan[]) ?? [];
}

export async function getUserSubscription(
  userId: string
): Promise<(UserSubscription & { plan: SubscriptionPlan }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*, plan:subscription_plans(*)")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as UserSubscription & { plan: SubscriptionPlan };
}

export interface EffectiveUserPlan {
  displayName: string;
  listingLimit: Awaited<ReturnType<typeof canCreateListing>>;
}

export async function getEffectiveUserPlan(userId: string): Promise<EffectiveUserPlan | null> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const subscription = await getUserSubscription(userId);

  if (!subscription) return null;

  const activeGifts = await getActiveGiftsForUser(userId);
  const listingLimit = await canCreateListing(userId);

  const displayName = resolveEffectivePlanDisplayName(
    subscription.plan,
    activeGifts.map((gift) => gift.gift_type),
    {
      premium: dict.dashboard.effectivePlanPremium,
      unlimitedListings: dict.dashboard.unlimitedListings,
    }
  );

  return { displayName, listingLimit };
}

export async function canCreateListing(userId: string): Promise<{
  allowed: boolean;
  current: number;
  max: number | null;
  message?: string;
}> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const subscription = await getUserSubscription(userId);
  const plan = subscription?.plan;

  if (!plan) {
    return {
      allowed: false,
      current: 0,
      max: 0,
      message: dict.errors.noSubscription,
    };
  }

  const maxListings = plan.max_listings;
  const giftAdjustments = await getListingGiftAdjustments(userId);

  const supabase = await createClient();
  const { count } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", userId)
    .neq("listing_status", "archived");

  const current = count ?? 0;

  if (giftAdjustments.unlimited || maxListings === null) {
    return { allowed: true, current, max: null };
  }

  const effectiveMax = maxListings + giftAdjustments.extraCredits;

  if (maxListings === 0 && giftAdjustments.extraCredits === 0) {
    return {
      allowed: false,
      current,
      max: 0,
      message: dict.errors.upgradeToList,
    };
  }

  if (current >= effectiveMax) {
    return {
      allowed: false,
      current,
      max: effectiveMax,
      message: interpolate(dict.errors.listingLimit, { max: effectiveMax }),
    };
  }

  return { allowed: true, current, max: effectiveMax };
}

export async function canAddFavorite(userId: string): Promise<{
  allowed: boolean;
  current: number;
  max: number | null;
  message?: string;
}> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const subscription = await getUserSubscription(userId);
  const plan = subscription?.plan;

  if (!plan) {
    return { allowed: true, current: 0, max: null };
  }

  const maxFavorites = plan.max_favorites;

  if (maxFavorites === null) {
    return { allowed: true, current: 0, max: null };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const current = count ?? 0;

  if (current >= maxFavorites) {
    return {
      allowed: false,
      current,
      max: maxFavorites,
      message: interpolate(dict.errors.favoriteLimit, { max: maxFavorites }),
    };
  }

  return { allowed: true, current, max: maxFavorites };
}
