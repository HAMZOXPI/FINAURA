"use client";

import type { Notification } from "@/types/database";
import { getNotificationVisuals } from "@/lib/notifications/presentation";
import { formatNotificationRelativeTime } from "@/lib/notifications/relative-time";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface NotificationItemProps {
  notification: Notification;
  compact?: boolean;
  selected?: boolean;
  selectable?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onOpen?: (notification: Notification) => void;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  actions?: React.ReactNode;
}

export function NotificationItem({
  notification,
  compact = false,
  selected = false,
  selectable = false,
  onSelect,
  onOpen,
  onMarkRead,
  onDelete,
  actions,
}: NotificationItemProps) {
  const { locale, t } = useTranslation();
  const visuals = getNotificationVisuals(notification.notification_type, notification.priority);
  const { Icon } = visuals;
  const priorityLabels = t.notifications.priorities as Record<string, string>;

  return (
    <div
      className={cn(
        "group relative flex gap-3 border-s-4 px-3 py-3 transition-all duration-200",
        visuals.borderClass,
        !notification.is_read ? cn(visuals.bgClass, "bg-brand-50/20") : "bg-white hover:bg-surface-50/80",
        compact && "px-3 py-2.5"
      )}
    >
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelect?.(notification.id, event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-surface-300 text-brand-600"
          aria-label={t.notifications.selectOne}
        />
      )}

      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg",
          visuals.iconClass
        )}
        aria-hidden
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          className="w-full text-start"
          onClick={() => onOpen?.(notification)}
        >
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm text-surface-900",
                !notification.is_read ? "font-bold" : "font-medium"
              )}
            >
              {notification.title}
            </p>
            {!notification.is_read && (
              <span
                className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500 ring-2 ring-brand-100"
                aria-label={t.notifications.unreadLabel}
              />
            )}
          </div>
          <p className={cn("mt-0.5 text-surface-600", compact ? "line-clamp-2 text-xs" : "text-sm")}>
            {notification.body}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-surface-400">
              {formatNotificationRelativeTime(notification.created_at, locale)}
            </span>
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
                visuals.badgeClass
              )}
            >
              {priorityLabels[notification.priority] ?? notification.priority}
            </span>
          </div>
        </button>

        {(onMarkRead || onDelete || actions) && (
          <div className="mt-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
            {!notification.is_read && onMarkRead && (
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                onClick={() => onMarkRead(notification.id)}
              >
                {t.notifications.markRead}
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                onClick={() => onDelete(notification.id)}
              >
                {t.notifications.delete}
              </button>
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
