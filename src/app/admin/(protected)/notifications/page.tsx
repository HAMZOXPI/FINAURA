import { Suspense } from "react";
import { AdminNotificationsManager } from "@/components/admin/notifications/admin-notifications-manager";
import { AdminNotificationsSkeleton } from "@/components/admin/notifications/admin-notifications-skeleton";
import {
  getAdminBroadcasts,
  getAdminNotificationStats,
  getAdminNotifications,
  getBroadcastCities,
  getNotificationAuditLog,
  type AdminNotificationFilters,
} from "@/services/admin-notification.service";
import type { NotificationType } from "@/types/database";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

interface AdminNotificationsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    read?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.admin.notifications.title,
    description: dict.admin.notifications.subtitle,
    path: "/admin/notifications",
    noIndex: true,
    locale,
  });
}

function parseType(value?: string): AdminNotificationFilters["type"] {
  const types: NotificationType[] = [
    "verification_approved",
    "verification_rejected",
    "property_approved",
    "property_rejected",
    "property_hidden",
    "premium_activated",
    "premium_expired",
    "premium_expiring",
    "gift_granted",
    "gift_expired",
    "payment_confirmed",
    "subscription_changed",
    "subscription_renewed",
    "subscription_expired",
    "new_message",
    "report_listing",
    "admin_broadcast",
    "system",
  ];
  if (types.includes(value as NotificationType)) return value as NotificationType;
  return "all";
}

function parseRead(value?: string): AdminNotificationFilters["read"] {
  if (value === "read" || value === "unread") return value;
  return "all";
}

async function NotificationsContent({
  searchParams,
}: {
  searchParams: AdminNotificationsPageProps["searchParams"];
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [stats, list, broadcasts, auditLog, cities] = await Promise.all([
    getAdminNotificationStats(),
    getAdminNotifications({
      search: params.q,
      type: parseType(params.type),
      read: parseRead(params.read),
      dateFrom: params.from,
      dateTo: params.to,
      page,
    }),
    getAdminBroadcasts(1, 10),
    getNotificationAuditLog(40),
    getBroadcastCities(),
  ]);

  return (
    <AdminNotificationsManager
      stats={stats}
      list={list}
      broadcasts={broadcasts}
      auditLog={auditLog}
      cities={cities}
    />
  );
}

export default function AdminNotificationsPage(props: AdminNotificationsPageProps) {
  return (
    <Suspense fallback={<AdminNotificationsSkeleton />}>
      <NotificationsContent searchParams={props.searchParams} />
    </Suspense>
  );
}
