"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { notifyCustom } from "@/lib/notifications/dispatch";
import { createClient } from "@/lib/supabase/server";
import {
  resolveBroadcastRecipients,
  searchUsersForBroadcast,
} from "@/services/admin-notification.service";
import type { NotificationAudience, NotificationPriority } from "@/types/database";

function revalidateNotificationPaths() {
  revalidatePath("/admin/notifications");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function searchBroadcastUsers(query: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error, users: [] as never[] };

  const users = await searchUsersForBroadcast(query);
  return { success: true, users };
}

export async function sendBroadcastNotification(payload: {
  title: string;
  body: string;
  audience: NotificationAudience;
  targetUserId?: string | null;
  targetCity?: string | null;
  priority?: NotificationPriority;
  actionUrl?: string | null;
  templateKey?: string | null;
}) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const title = payload.title.trim();
  const body = payload.body.trim();
  if (title.length < 2) return { error: "Title is required" };
  if (body.length < 2) return { error: "Message is required" };

  if (payload.audience === "single_user" && !payload.targetUserId) {
    return { error: "Select a user for this broadcast" };
  }

  if (payload.audience === "city_users" && !payload.targetCity?.trim()) {
    return { error: "Select a city for this broadcast" };
  }

  const recipientIds = await resolveBroadcastRecipients(
    payload.audience,
    payload.targetUserId,
    payload.targetCity
  );

  if (recipientIds.length === 0) {
    return { error: "No recipients found for this audience" };
  }

  const supabase = await createClient();
  const priority = payload.priority ?? "info";

  const { data: broadcast, error: broadcastError } = await supabase
    .from("notification_broadcasts")
    .insert({
      title,
      body,
      notification_type: "admin_broadcast",
      priority,
      audience: payload.audience,
      target_user_id: payload.targetUserId ?? null,
      target_city: payload.targetCity?.trim() || null,
      template_key: payload.templateKey ?? null,
      sent_by: session.user.id,
      recipient_count: recipientIds.length,
      metadata: { action_url: payload.actionUrl ?? null },
    })
    .select("id")
    .single();

  if (broadcastError) return { error: broadcastError.message };

  await Promise.all(
    recipientIds.map((userId) =>
      notifyCustom(userId, {
        type: "admin_broadcast",
        priority,
        title,
        body,
        actionUrl: payload.actionUrl,
        broadcastId: broadcast.id,
        templateKey: payload.templateKey,
        metadata: { audience: payload.audience },
      })
    )
  );

  await supabase.from("notification_audit_log").insert({
    action: "broadcast",
    broadcast_id: broadcast.id,
    actor_id: session.user.id,
    metadata: {
      audience: payload.audience,
      recipient_count: recipientIds.length,
      title,
    },
  });

  revalidateNotificationPaths();
  return { success: true, recipientCount: recipientIds.length, broadcastId: broadcast.id };
}
