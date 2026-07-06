import { createClient } from "@/lib/supabase/server";

import type {

  Notification,

  NotificationPriority,

  NotificationType,

} from "@/types/database";



export interface CreateNotificationInput {

  userId: string;

  type: NotificationType;

  priority: NotificationPriority;

  title: string;

  body: string;

  actionUrl?: string | null;

  templateKey?: string | null;

  metadata?: Record<string, unknown>;

  broadcastId?: string | null;

  dedupKey?: string | null;

}



export interface UserNotificationFilters {

  search?: string;

  type?: NotificationType | "all";

  read?: "all" | "read" | "unread";

  dateFrom?: string;

  dateTo?: string;

  page?: number;

  pageSize?: number;

}



export interface UserNotificationListResult {

  rows: Notification[];

  total: number;

  page: number;

  pageSize: number;

  totalPages: number;

  unreadCount: number;

}



export async function createNotification(input: CreateNotificationInput): Promise<string | null> {
  const supabase = await createClient();

  const metadata = {
    ...(input.metadata ?? {}),
    ...(input.dedupKey ? { dedup_key: input.dedupKey } : {}),
  };

  const rpcPayload = {
    p_user_id: input.userId,
    p_notification_type: input.type,
    p_priority: input.priority,
    p_title: input.title,
    p_body: input.body,
    p_action_url: input.actionUrl ?? null,
    p_template_key: input.templateKey ?? null,
    p_metadata: metadata,
    p_broadcast_id: input.broadcastId ?? null,
  };

  const { data, error } = await supabase.rpc("create_user_notification", rpcPayload);



  if (error) {

    console.error("createNotification:", error.message);

    return null;

  }



  return data as string;

}



export async function getUnreadNotificationCount(userId: string): Promise<number> {

  const supabase = await createClient();

  const { count, error } = await supabase

    .from("notifications")

    .select("id", { count: "exact", head: true })

    .eq("user_id", userId)

    .eq("is_read", false);



  if (error) {

    console.error("getUnreadNotificationCount:", error.message);

    return 0;

  }



  return count ?? 0;

}



export async function getUserNotifications(

  userId: string,

  limit = 20

): Promise<Notification[]> {

  const supabase = await createClient();

  const { data, error } = await supabase

    .from("notifications")

    .select("*")

    .eq("user_id", userId)

    .order("created_at", { ascending: false })

    .limit(limit);



  if (error) {

    console.error("getUserNotifications:", error.message);

    return [];

  }



  return (data as Notification[]) ?? [];

}



export async function getUserNotificationsPaginated(

  userId: string,

  filters: UserNotificationFilters = {}

): Promise<UserNotificationListResult> {

  const supabase = await createClient();

  const page = Math.max(1, filters.page ?? 1);

  const pageSize = filters.pageSize ?? 15;

  const from = (page - 1) * pageSize;

  const to = from + pageSize - 1;



  let query = supabase

    .from("notifications")

    .select("*", { count: "exact" })

    .eq("user_id", userId)

    .order("created_at", { ascending: false });



  if (filters.type && filters.type !== "all") {

    query = query.eq("notification_type", filters.type);

  }



  if (filters.read === "read") query = query.eq("is_read", true);

  if (filters.read === "unread") query = query.eq("is_read", false);



  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);



  if (filters.dateTo) {

    const end = new Date(filters.dateTo);

    end.setHours(23, 59, 59, 999);

    query = query.lte("created_at", end.toISOString());

  }



  if (filters.search?.trim()) {

    const term = filters.search.trim();

    query = query.or(`title.ilike.%${term}%,body.ilike.%${term}%`);

  }



  const [unreadResult, listResult] = await Promise.all([
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false),
    query.range(from, to),
  ]);



  if (listResult.error) {

    console.error("getUserNotificationsPaginated:", listResult.error.message);

    return { rows: [], total: 0, page, pageSize, totalPages: 0, unreadCount: 0 };

  }



  const total = listResult.count ?? 0;

  return {

    rows: (listResult.data as Notification[]) ?? [],

    total,

    page,

    pageSize,

    totalPages: Math.ceil(total / pageSize) || 0,

    unreadCount: unreadResult.count ?? 0,

  };

}



export async function markNotificationRead(

  userId: string,

  notificationId: string

): Promise<boolean> {

  const supabase = await createClient();

  const readAt = new Date().toISOString();



  const { error } = await supabase

    .from("notifications")

    .update({ is_read: true, read_at: readAt })

    .eq("id", notificationId)

    .eq("user_id", userId);



  if (error) {

    console.error("markNotificationRead:", error.message);

    return false;

  }



  await supabase.from("notification_audit_log").insert({

    action: "read",

    notification_id: notificationId,

    actor_id: userId,

    user_id: userId,

  });



  return true;

}



export async function markAllNotificationsRead(userId: string): Promise<boolean> {

  const supabase = await createClient();

  const readAt = new Date().toISOString();



  const { error } = await supabase

    .from("notifications")

    .update({ is_read: true, read_at: readAt })

    .eq("user_id", userId)

    .eq("is_read", false);



  if (error) {

    console.error("markAllNotificationsRead:", error.message);

    return false;

  }



  await supabase.from("notification_audit_log").insert({

    action: "read_all",

    actor_id: userId,

    user_id: userId,

  });



  return true;

}



export async function deleteNotification(

  userId: string,

  notificationId: string

): Promise<boolean> {

  const supabase = await createClient();



  const { error } = await supabase

    .from("notifications")

    .delete()

    .eq("id", notificationId)

    .eq("user_id", userId);



  if (error) {

    console.error("deleteNotification:", error.message);

    return false;

  }



  await supabase.from("notification_audit_log").insert({

    action: "delete",

    notification_id: notificationId,

    actor_id: userId,

    user_id: userId,

  });



  return true;

}



export async function deleteNotifications(

  userId: string,

  notificationIds: string[]

): Promise<boolean> {

  if (notificationIds.length === 0) return true;



  const supabase = await createClient();

  const { error } = await supabase

    .from("notifications")

    .delete()

    .eq("user_id", userId)

    .in("id", notificationIds);



  if (error) {

    console.error("deleteNotifications:", error.message);

    return false;

  }



  await supabase.from("notification_audit_log").insert(

    notificationIds.map((id) => ({

      action: "delete" as const,

      notification_id: id,

      actor_id: userId,

      user_id: userId,

    }))

  );



  return true;

}



export async function cleanupOldNotifications(): Promise<number> {

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("cleanup_old_notifications");



  if (error) {

    console.error("cleanupOldNotifications:", error.message);

    return 0;

  }



  return (data as number) ?? 0;

}


