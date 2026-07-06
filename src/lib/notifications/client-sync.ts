import type { Notification } from "@/types/database";

export const NOTIFICATIONS_SYNC_EVENT = "finaura-notifications-sync";
export const NOTIFICATION_INSERT_EVENT = "finaura-notification-insert";

const CELEBRATION_TYPES = new Set([
  "gift_granted",
  "premium_activated",
  "subscription_changed",
  "subscription_renewed",
]);

export function dispatchNotificationInsert(notification: Notification) {
  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_INSERT_EVENT, { detail: notification })
  );
}

export function dispatchNotificationsSync(
  notifications: Notification[],
  inserted: Notification[]
) {
  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_SYNC_EVENT, {
      detail: { notifications, inserted },
    })
  );
}

export function isCelebrationType(type: string | undefined): boolean {
  return type != null && CELEBRATION_TYPES.has(type);
}

export async function fetchRecentNotificationsClient(
  userId: string,
  limit = 25
): Promise<Notification[]> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("fetchRecentNotificationsClient:", error.message);
    return [];
  }

  return (data as Notification[]) ?? [];
}

export async function fetchNotificationByIdClient(
  userId: string,
  notificationId: string
): Promise<Notification | null> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("id", notificationId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Notification;
}

export async function fetchUnseenCelebrationNotificationsClient(
  userId: string,
  seenIds: string[],
  limit = 10
): Promise<Notification[]> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .in("notification_type", [
      "gift_granted",
      "premium_activated",
      "subscription_changed",
      "subscription_renewed",
    ])
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("fetchUnseenCelebrationNotificationsClient:", error.message);
    return [];
  }

  const seen = new Set(seenIds);
  return ((data as Notification[]) ?? []).filter((row) => !seen.has(row.id));
}

export function diffNewNotifications(
  previousIds: Set<string>,
  notifications: Notification[]
): Notification[] {
  return notifications.filter((row) => !previousIds.has(row.id));
}
