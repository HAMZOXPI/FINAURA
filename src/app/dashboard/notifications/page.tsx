import { Suspense } from "react";
import { NotificationsPageClient } from "@/components/notifications/notifications-page-client";
import { NotificationListSkeleton } from "@/components/notifications/notification-list-skeleton";
import { NOTIFICATION_PAGE_SIZE } from "@/lib/notifications/constants";
import { requireUser } from "@/lib/supabase/auth";
import { getUserNotificationsPaginated } from "@/services/notification.service";
import type { NotificationType } from "@/types/database";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

interface NotificationsPageProps {
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
    title: dict.notifications.pageTitle,
    description: dict.notifications.pageSubtitle.replace("{unread}", "0"),
    path: "/dashboard/notifications",
    noIndex: true,
    locale,
  });
}

function parseType(value?: string): NotificationType | "all" {
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
  ];
  if (types.includes(value as NotificationType)) return value as NotificationType;
  return "all";
}

function parseRead(value?: string): "all" | "read" | "unread" {
  if (value === "read" || value === "unread") return value;
  return "all";
}

async function NotificationsContent({ searchParams }: NotificationsPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const data = await getUserNotificationsPaginated(user.id, {
    search: params.q,
    type: parseType(params.type),
    read: parseRead(params.read),
    dateFrom: params.from,
    dateTo: params.to,
    page,
    pageSize: NOTIFICATION_PAGE_SIZE,
  });

  return <NotificationsPageClient initialData={data} />;
}

export default function DashboardNotificationsPage(props: NotificationsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-surface-200 bg-white p-4">
          <NotificationListSkeleton count={5} />
        </div>
      }
    >
      <NotificationsContent searchParams={props.searchParams} />
    </Suspense>
  );
}
