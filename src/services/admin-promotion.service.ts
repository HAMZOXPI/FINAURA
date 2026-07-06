import type {
  AdminGiftAuditAction,
  AdminGiftPaymentSource,
  AdminGiftStatus,
  AdminGiftType,
  Profile,
  SubscriptionPlan,
} from "@/types/database";
import { isPremiumGiftType, resolveAdminGiftPaymentSource, resolveEffectiveGiftStatus } from "@/lib/gifts/constants";
import { isUuid } from "@/lib/admin/property-status";
import { getActiveGiftsForUser } from "@/services/gift.service";
import { getUserSubscription } from "@/services/subscription.service";
import { createClient } from "@/lib/supabase/server";
import { sanitizeIlikePattern } from "@/lib/property-search";

const PAGE_SIZE_DEFAULT = 12;

export type AdminGiftRecipient = Pick<Profile, "id" | "full_name" | "email" | "avatar_url"> & {
  plan_name?: string | null;
  plan_slug?: string | null;
};

export type AdminGiftGranter = Pick<Profile, "id" | "full_name" | "email">;

export interface AdminGiftRow {
  id: string;
  user_id: string;
  gift_type: AdminGiftType;
  quantity: number | null;
  quantity_remaining: number | null;
  duration_days: number | null;
  expires_at: string | null;
  status: AdminGiftStatus;
  granted_by: string | null;
  notes: string | null;
  payment_source: AdminGiftPaymentSource;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  recipient: AdminGiftRecipient | null;
  granter: AdminGiftGranter | null;
  effective_status: AdminGiftStatus;
}

export interface AdminGiftFilters {
  search?: string;
  giftType?: AdminGiftType | "all";
  status?: AdminGiftStatus | "all";
  activeOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminGiftListResult {
  rows: AdminGiftRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminPromotionStats {
  activePromotions: number;
  expiredPromotions: number;
  unlimitedUsers: number;
  premiumGifts: number;
  totalGranted: number;
  grantedToday: number;
  grantedThisMonth: number;
}

export interface UserPromotionStatus {
  user: AdminGiftRecipient;
  planName: string;
  planSlug: string;
  isPremium: boolean;
  listingsUsed: number;
  listingsMax: number | null;
  premiumExpiresAt: string | null;
  activeGifts: AdminGiftRow[];
}

export interface AdminGiftAuditRow {
  id: string;
  gift_id: string | null;
  action: AdminGiftAuditAction;
  admin_id: string | null;
  user_id: string | null;
  reason: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  admin: AdminGiftGranter | null;
  user: AdminGiftRecipient | null;
  gift?: AdminGiftRow | null;
}

function enrichGiftRow(
  gift: AdminGiftRow | (Omit<AdminGiftRow, "effective_status" | "payment_source"> & {
    effective_status?: AdminGiftStatus;
    payment_source?: AdminGiftPaymentSource;
  })
): AdminGiftRow {
  return {
    ...gift,
    payment_source: resolveAdminGiftPaymentSource(gift),
    recipient: gift.recipient ?? null,
    granter: gift.granter ?? null,
    effective_status: resolveEffectiveGiftStatus(gift.status, gift.expires_at),
  };
}

async function resolveUserIdsForSearch(search: string): Promise<string[] | null> {
  const supabase = await createClient();
  const trimmed = search.trim();
  if (!trimmed) return null;

  if (isUuid(trimmed)) {
    return [trimmed];
  }

  const term = sanitizeIlikePattern(trimmed);
  if (!term) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);

  return (data ?? []).map((row) => row.id);
}

const GIFT_SELECT =
  "*, recipient:profiles!admin_gifts_user_id_fkey(id, full_name, email, avatar_url), granter:profiles!admin_gifts_granted_by_fkey(id, full_name, email)";

export async function searchAdminGiftUsers(
  search: string,
  limit = 8
): Promise<AdminGiftRecipient[]> {
  const supabase = await createClient();
  const trimmed = search.trim();
  if (trimmed.length < 2) return [];

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .limit(limit);

  if (isUuid(trimmed)) {
    query = query.eq("id", trimmed);
  } else {
    const term = sanitizeIlikePattern(trimmed);
    if (!term) return [];
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`).order("full_name", {
      ascending: true,
    });
  }

  const { data, error } = await query;

  if (error) {
    console.error("searchAdminGiftUsers:", error.message);
    return [];
  }

  const users = (data as AdminGiftRecipient[]) ?? [];
  const enriched = await Promise.all(
    users.map(async (user) => {
      const subscription = await getUserSubscription(user.id);
      return {
        ...user,
        plan_name: subscription?.plan?.name ?? "Free",
        plan_slug: subscription?.plan?.slug ?? "free",
      };
    })
  );

  return enriched;
}

export async function getUserPromotionStatus(userId: string): Promise<UserPromotionStatus | null> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return null;

  const subscription = await getUserSubscription(userId);
  const plan = subscription?.plan as SubscriptionPlan | undefined;

  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId)
    .neq("listing_status", "archived");

  const activeGiftsRaw = await getActiveGiftsForUser(userId);
  const activeGifts: AdminGiftRow[] = activeGiftsRaw.map((gift) =>
    enrichGiftRow({
      ...gift,
      recipient: profile as AdminGiftRecipient,
      granter: null,
    })
  );

  const planSlug = plan?.slug ?? "free";
  const isPremium = planSlug === "pro" || planSlug === "enterprise";

  let listingsMax = plan?.max_listings ?? null;
  for (const gift of activeGifts) {
    if (gift.gift_type === "unlimited_listings") listingsMax = null;
    if (gift.gift_type === "extra_listing_credits") {
      listingsMax = (listingsMax ?? 0) + (gift.quantity_remaining ?? gift.quantity ?? 0);
    }
  }

  return {
    user: {
      ...(profile as AdminGiftRecipient),
      plan_name: plan?.name ?? "Free",
      plan_slug: planSlug,
    },
    planName: plan?.name ?? "Free",
    planSlug,
    isPremium,
    listingsUsed: count ?? 0,
    listingsMax,
    premiumExpiresAt: subscription?.current_period_end ?? null,
    activeGifts,
  };
}

export async function getAdminPromotionStats(): Promise<AdminPromotionStats> {
  const supabase = await createClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

  const [active, expired, unlimited, premium, total, today, month] = await Promise.all([
    supabase.from("admin_gifts").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("admin_gifts").select("id", { count: "exact", head: true }).eq("status", "expired"),
    supabase
      .from("admin_gifts")
      .select("user_id", { count: "exact", head: true })
      .eq("gift_type", "unlimited_listings")
      .eq("status", "active"),
    supabase
      .from("admin_gifts")
      .select("id", { count: "exact", head: true })
      .in("gift_type", ["premium_subscription", "premium_extension"])
      .eq("status", "active"),
    supabase.from("admin_gifts").select("id", { count: "exact", head: true }),
    supabase
      .from("admin_gifts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfToday.toISOString()),
    supabase
      .from("admin_gifts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString()),
  ]);

  return {
    activePromotions: active.count ?? 0,
    expiredPromotions: expired.count ?? 0,
    unlimitedUsers: unlimited.count ?? 0,
    premiumGifts: premium.count ?? 0,
    totalGranted: total.count ?? 0,
    grantedToday: today.count ?? 0,
    grantedThisMonth: month.count ?? 0,
  };
}

export async function getAdminGifts(filters: AdminGiftFilters = {}): Promise<AdminGiftListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? PAGE_SIZE_DEFAULT;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("admin_gifts").select(GIFT_SELECT, { count: "exact" }).order("created_at", {
    ascending: false,
  });

  if (filters.activeOnly) {
    query = query.eq("status", "active");
  } else if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.giftType && filters.giftType !== "all") {
    query = query.eq("gift_type", filters.giftType);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }

  if (filters.dateTo) {
    const end = new Date(filters.dateTo);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  if (filters.search?.trim()) {
    const userIds = await resolveUserIdsForSearch(filters.search);
    if (!userIds || userIds.length === 0) {
      return { rows: [], total: 0, page, pageSize, totalPages: 0 };
    }
    query = query.in("user_id", userIds);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("getAdminGifts:", error.message);
    return { rows: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const rows = ((data ?? []) as AdminGiftRow[]).map(enrichGiftRow);
  const total = count ?? 0;

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 0,
  };
}

export async function getAdminGiftById(giftId: string): Promise<AdminGiftRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_gifts")
    .select(GIFT_SELECT)
    .eq("id", giftId)
    .maybeSingle();

  if (error || !data) return null;
  return enrichGiftRow(data as AdminGiftRow);
}

export async function getGiftAuditLog(
  giftId?: string,
  limit = 20
): Promise<AdminGiftAuditRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("admin_gift_audit_log")
    .select(
      "*, admin:profiles!admin_gift_audit_log_admin_id_fkey(id, full_name, email), user:profiles!admin_gift_audit_log_user_id_fkey(id, full_name, email, avatar_url)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (giftId) query = query.eq("gift_id", giftId);

  const { data, error } = await query;
  if (error) {
    console.error("getGiftAuditLog:", error.message);
    return [];
  }

  return (data as AdminGiftAuditRow[]) ?? [];
}

/** @deprecated use getAdminPromotionStats */
export async function getAdminGiftStats() {
  const stats = await getAdminPromotionStats();
  return {
    active: stats.activePromotions,
    expired: stats.expiredPromotions,
    revoked: 0,
    grantedToday: stats.grantedToday,
  };
}

export { isPremiumGiftType };
