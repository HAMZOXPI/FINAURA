"use client";

import { motion } from "framer-motion";
import type { AdminNotificationRow } from "@/services/admin-notification.service";
import type { NotificationAnalyticsCategory } from "@/lib/admin/notifications-display";
import { getNotificationCategory } from "@/lib/admin/notification-details-drawer-display";
import { cn, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface NotificationContentCardProps {
  notification: AdminNotificationRow;
  loading?: boolean;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-surface-100 bg-surface-50/50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-400">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-medium text-surface-900">{value}</p>
    </div>
  );
}

export function NotificationContentCard({
  notification,
  loading,
}: NotificationContentCardProps) {
  const { t, locale } = useTranslation();

  const typeLabels = t.admin.notifications.types as Record<string, string>;
  const priorityLabels = t.admin.notifications.priorities as Record<string, string>;
  const category = getNotificationCategory(notification.notification_type);

  const categoryLabels: Record<NotificationAnalyticsCategory, string> = {
    messages: t.admin.notifications.analytics.messages,
    verification: t.admin.notifications.analytics.verification,
    boost: t.admin.notifications.analytics.boost,
    promotion: t.admin.notifications.analytics.promotion,
    system: t.admin.notifications.analytics.system,
    gift: t.admin.notifications.analytics.gift,
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3 rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm">
        <div className="h-6 w-48 rounded bg-surface-100" />
        <div className="h-20 rounded-xl bg-surface-100" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-16 rounded-xl bg-surface-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        "ring-1 ring-black/[0.02]"
      )}
    >
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
        {t.admin.notifications.drawer.contentTitle}
      </h3>
      <p className="mt-3 text-lg font-bold text-surface-900">{notification.title}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-surface-600">
        {notification.body}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <DetailField
          label={t.admin.notifications.drawer.fields.actionUrl}
          value={notification.action_url ?? "—"}
        />
        <DetailField
          label={t.admin.notifications.drawer.fields.category}
          value={category ? categoryLabels[category] : "—"}
        />
        <DetailField
          label={t.admin.notifications.colType}
          value={typeLabels[notification.notification_type] ?? notification.notification_type}
        />
        <DetailField
          label={t.admin.notifications.colPriority}
          value={priorityLabels[notification.priority] ?? notification.priority}
        />
        <DetailField
          label={t.admin.notifications.colDate}
          value={formatDate(notification.created_at, locale)}
        />
        <DetailField
          label={t.admin.notifications.colStatus}
          value={
            notification.is_read
              ? t.admin.notifications.statusRead
              : t.admin.notifications.statusUnread
          }
        />
      </div>
    </motion.div>
  );
}
