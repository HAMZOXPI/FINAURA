"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, CheckCheck, ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";
import {
  deleteUserNotification,
  deleteUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/actions/notification.actions";
import { NOTIFICATION_TYPES } from "@/lib/notifications/constants";
import type { UserNotificationListResult } from "@/services/notification.service";
import type { Notification, NotificationType } from "@/types/database";
import { NotificationEmptyState } from "@/components/notifications/notification-empty-state";
import { NotificationItem } from "@/components/notifications/notification-item";
import { NotificationListSkeleton } from "@/components/notifications/notification-list-skeleton";
import { useNotifications } from "@/components/notifications/notifications-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface NotificationsPageClientProps {
  initialData: UserNotificationListResult;
}

export function NotificationsPageClient({ initialData }: NotificationsPageClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUnreadCount } = useNotifications();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") ?? "");

  const typeFilter = (searchParams.get("type") ?? "all") as NotificationType | "all";
  const readFilter = (searchParams.get("read") ?? "all") as "all" | "read" | "unread";
  const data = initialData;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });
      startTransition(() => router.push(`/dashboard/notifications?${params.toString()}`));
    },
    [router, searchParams]
  );

  const typeLabel = (type: NotificationType) => {
    const labels = t.notifications.types as Record<string, string>;
    return labels[type] ?? type;
  };

  const handleOpen = (notification: Notification) => {
    startTransition(async () => {
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);
        await refreshUnreadCount();
      }
      if (notification.action_url) {
        router.push(notification.action_url);
      }
    });
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.rows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.rows.map((row) => row.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      await deleteUserNotifications(selectedIds);
      setSelectedIds([]);
      await refreshUnreadCount();
      router.refresh();
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsRead();
      await refreshUnreadCount();
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-surface-900">
            <Bell className="h-6 w-6 text-brand-600" />
            {t.notifications.pageTitle}
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            {t.notifications.pageSubtitle.replace("{unread}", String(data.unreadCount))}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.unreadCount > 0 && (
            <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4" />
              {t.notifications.markAllRead}
            </Button>
          )}
          {selectedIds.length > 0 && (
            <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4" />
              {t.notifications.deleteSelected.replace("{count}", String(selectedIds.length))}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.notifications.searchPlaceholder}
              className="ps-9"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(event) =>
              updateParams({ type: event.target.value === "all" ? null : event.target.value, page: null })
            }
            className="h-10 rounded-xl border border-surface-300 bg-white px-3 text-sm"
          >
            <option value="all">{t.notifications.filterAllTypes}</option>
            {NOTIFICATION_TYPES.filter((type) => type !== "admin_broadcast" && type !== "system").map((type) => (
              <option key={type} value={type}>
                {typeLabel(type)}
              </option>
            ))}
          </select>
          <select
            value={readFilter}
            onChange={(event) =>
              updateParams({ read: event.target.value === "all" ? null : event.target.value, page: null })
            }
            className="h-10 rounded-xl border border-surface-300 bg-white px-3 text-sm"
          >
            <option value="all">{t.notifications.filterAllRead}</option>
            <option value="unread">{t.notifications.filterUnread}</option>
            <option value="read">{t.notifications.filterRead}</option>
          </select>
          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          <Button
            type="button"
            className="xl:col-span-2"
            disabled={isPending}
            onClick={() =>
              updateParams({
                q: search.trim() || null,
                from: dateFrom || null,
                to: dateTo || null,
                page: null,
              })
            }
          >
            {t.notifications.searchButton}
          </Button>
        </div>
      </div>

      <div className={cn("overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm", isPending && "opacity-60")}>
        {data.rows.length > 0 && (
          <div className="flex items-center gap-3 border-b border-surface-100 bg-surface-50/80 px-4 py-2">
            <input
              type="checkbox"
              checked={selectedIds.length === data.rows.length && data.rows.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-surface-300 text-brand-600"
              aria-label={t.notifications.selectAll}
            />
            <span className="text-xs text-surface-500">{t.notifications.selectHint}</span>
          </div>
        )}

        {isPending && data.rows.length === 0 ? (
          <NotificationListSkeleton count={5} />
        ) : data.rows.length === 0 ? (
          <NotificationEmptyState />
        ) : (
          <ul className="divide-y divide-surface-100">
            {data.rows.map((notification) => (
              <li key={notification.id}>
                <NotificationItem
                  notification={notification}
                  selectable
                  selected={selectedIds.includes(notification.id)}
                  onSelect={toggleSelect}
                  onOpen={handleOpen}
                  onMarkRead={(id) =>
                    startTransition(async () => {
                      await markNotificationAsRead(id);
                      await refreshUnreadCount();
                      router.refresh();
                    })
                  }
                  onDelete={(id) =>
                    startTransition(async () => {
                      await deleteUserNotification(id);
                      setSelectedIds((prev) => prev.filter((item) => item !== id));
                      await refreshUnreadCount();
                      router.refresh();
                    })
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">
            {t.notifications.pageInfo
              .replace("{page}", String(data.page))
              .replace("{totalPages}", String(data.totalPages))
              .replace("{total}", String(data.total))}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={data.page <= 1 || isPending}
              onClick={() => updateParams({ page: String(data.page - 1) })}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={data.page >= data.totalPages || isPending}
              onClick={() => updateParams({ page: String(data.page + 1) })}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
