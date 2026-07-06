import { isUuid } from "@/lib/admin/property-status";
import { sanitizeIlikePattern } from "@/lib/property-search";
import { createClient } from "@/lib/supabase/server";
import type {
  Notification,
  NotificationAudience,
  NotificationAuditLog,
  NotificationBroadcast,
  NotificationType,
  Profile,
} from "@/types/database";

const PAGE_SIZE_DEFAULT = 15;

export interface AdminNotificationFilters {
  search?: string;
  type?: NotificationType | "all";
  read?: "all" | "read" | "unread";
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminNotificationListResult {
  rows: AdminNotificationRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminNotificationRow extends Notification {
  recipient: Pick<Profile, "id" | "full_name" | "email" | "avatar_url"> | null;
}

export interface AdminNotificationStats {
  total: number;
  unread: number;
  read: number;
  today: number;
  broadcasts: number;
  byType: Record<string, number>;
}

export interface AdminBroadcastListResult {
  rows: (NotificationBroadcast & {
    sender: Pick<Profile, "id" | "full_name" | "email"> | null;
    delivered_count: number;
    read_count: number;
  })[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async function resolveUserIdsForSearch(search: string): Promise<string[] | null> {
  const supabase = await createClient();
  const trimmed = search.trim();
  if (!trimmed) return null;

  if (isUuid(trimmed)) return [trimmed];

  const term = sanitizeIlikePattern(trimmed);
  if (!term) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);

  return (data ?? []).map((row) => row.id);
}

export async function getAdminNotificationStats(): Promise<AdminNotificationStats> {
  const supabase = await createClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [total, unread, today, broadcasts] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfToday.toISOString()),
    supabase.from("notification_broadcasts").select("id", { count: "exact", head: true }),
  ]);

  const { data: typeRows } = await supabase.from("notifications").select("notification_type");

  const byType: Record<string, number> = {};
  for (const row of typeRows ?? []) {
    const key = row.notification_type as string;
    byType[key] = (byType[key] ?? 0) + 1;
  }

  const totalCount = total.count ?? 0;
  const unreadCount = unread.count ?? 0;

  return {
    total: totalCount,
    unread: unreadCount,
    read: totalCount - unreadCount,
    today: today.count ?? 0,
    broadcasts: broadcasts.count ?? 0,
    byType,
  };
}

export async function getAdminNotifications(
  filters: AdminNotificationFilters = {}
): Promise<AdminNotificationListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? PAGE_SIZE_DEFAULT;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("notifications")
    .select(
      "*, recipient:profiles!notifications_user_id_fkey(id, full_name, email, avatar_url)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (filters.type && filters.type !== "all") {
    query = query.eq("notification_type", filters.type);
  }

  if (filters.read === "read") query = query.eq("is_read", true);
  if (filters.read === "unread") query = query.eq("is_read", false);

  if (filters.userId) query = query.eq("user_id", filters.userId);

  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);

  if (filters.dateTo) {
    const end = new Date(filters.dateTo);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  if (filters.search?.trim()) {
    const userIds = await resolveUserIdsForSearch(filters.search);
    if (!userIds?.length) {
      return { rows: [], total: 0, page, pageSize, totalPages: 0 };
    }
    query = query.in("user_id", userIds);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("getAdminNotifications:", error.message);
    return { rows: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const total = count ?? 0;
  return {
    rows: (data as AdminNotificationRow[]) ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 0,
  };
}

export async function getAdminBroadcasts(page = 1, pageSize = 10): Promise<AdminBroadcastListResult> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("notification_broadcasts")
    .select(
      "*, sender:profiles!notification_broadcasts_sent_by_fkey(id, full_name, email)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("getAdminBroadcasts:", error.message);
    return { rows: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const broadcasts = (data ?? []) as (NotificationBroadcast & {
    sender: Pick<Profile, "id" | "full_name" | "email"> | null;
  })[];

  const rows = await Promise.all(
    broadcasts.map(async (broadcast) => {
      const [delivered, read] = await Promise.all([
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("broadcast_id", broadcast.id),
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("broadcast_id", broadcast.id)
          .eq("is_read", true),
      ]);

      return {
        ...broadcast,
        delivered_count: delivered.count ?? 0,
        read_count: read.count ?? 0,
      };
    })
  );

  const total = count ?? 0;
  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 0,
  };
}

export async function getNotificationAuditLog(limit = 30): Promise<NotificationAuditLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getNotificationAuditLog:", error.message);
    return [];
  }

  return (data as NotificationAuditLog[]) ?? [];
}

export async function resolveBroadcastRecipients(
  audience: NotificationAudience,
  targetUserId?: string | null,
  targetCity?: string | null
): Promise<string[]> {
  const supabase = await createClient();

  if (audience === "single_user") {
    if (!targetUserId) return [];
    return [targetUserId];
  }

  if (audience === "city_users") {
    const city = targetCity?.trim();
    if (!city) return [];

    const { data: propertyOwners } = await supabase
      .from("properties")
      .select("owner_id")
      .ilike("city", city);

    const ownerIds = [...new Set((propertyOwners ?? []).map((row) => row.owner_id))];
    if (ownerIds.length === 0) return [];

    return ownerIds;
  }

  if (audience === "verified_users") {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_verified", true);
    return (data ?? []).map((row) => row.id);
  }

  if (audience === "premium_users") {
    const { data } = await supabase
      .from("user_subscriptions")
      .select("user_id, plan:subscription_plans!inner(slug)")
      .eq("status", "active");

    return (data ?? [])
      .filter((row) => {
        const plan = row.plan as { slug?: string } | null;
        return plan?.slug === "pro" || plan?.slug === "enterprise";
      })
      .map((row) => row.user_id);
  }

  const { data } = await supabase.from("profiles").select("id");
  return (data ?? []).map((row) => row.id);
}

export async function getBroadcastCities(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("city")
    .not("city", "is", null);

  if (error) return [];

  const cities = [...new Set((data ?? []).map((row) => row.city).filter(Boolean))];
  return cities.sort((a, b) => a.localeCompare(b, "fr"));
}

export async function searchUsersForBroadcast(
  search: string,
  limit = 8
): Promise<Pick<Profile, "id" | "full_name" | "email" | "avatar_url">[]> {
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
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}
