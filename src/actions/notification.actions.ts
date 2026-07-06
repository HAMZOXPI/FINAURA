"use server";



import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { DROPDOWN_NOTIFICATION_LIMIT } from "@/lib/notifications/constants";

import {

  deleteNotification,

  deleteNotifications,

  getUserNotificationsPaginated,

  markAllNotificationsRead,

  markNotificationRead,

  type UserNotificationFilters,

} from "@/services/notification.service";



function revalidateNotificationUi() {

  revalidatePath("/", "layout");

  revalidatePath("/dashboard/notifications");

}



export async function fetchUserNotifications(limit = DROPDOWN_NOTIFICATION_LIMIT) {

  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();



  if (!user) return { error: "Authentication required", notifications: [] as never[] };



  const result = await getUserNotificationsPaginated(user.id, { page: 1, pageSize: limit });

  return { success: true, notifications: result.rows };

}



export async function fetchUserNotificationsPage(filters: UserNotificationFilters) {

  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();



  if (!user) {

    return {

      error: "Authentication required",

      rows: [] as never[],

      total: 0,

      page: 1,

      pageSize: 15,

      totalPages: 0,

      unreadCount: 0,

    };

  }



  const result = await getUserNotificationsPaginated(user.id, filters);

  return { success: true, ...result };

}



export async function markNotificationAsRead(notificationId: string) {

  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();



  if (!user) return { error: "Authentication required" };



  const ok = await markNotificationRead(user.id, notificationId);

  if (!ok) return { error: "Failed to mark as read" };



  revalidateNotificationUi();

  return { success: true };

}



export async function markAllNotificationsAsRead() {

  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();



  if (!user) return { error: "Authentication required" };



  const ok = await markAllNotificationsRead(user.id);

  if (!ok) return { error: "Failed to mark all as read" };



  revalidateNotificationUi();

  return { success: true };

}



export async function deleteUserNotification(notificationId: string) {

  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();



  if (!user) return { error: "Authentication required" };



  const ok = await deleteNotification(user.id, notificationId);

  if (!ok) return { error: "Failed to delete notification" };



  revalidateNotificationUi();

  return { success: true };

}



export async function deleteUserNotifications(notificationIds: string[]) {

  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();



  if (!user) return { error: "Authentication required" };



  const ok = await deleteNotifications(user.id, notificationIds);

  if (!ok) return { error: "Failed to delete notifications" };



  revalidateNotificationUi();

  return { success: true, deleted: notificationIds.length };

}


