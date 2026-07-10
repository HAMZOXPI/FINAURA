"use client";

import { motion } from "framer-motion";
import { Bell, ExternalLink } from "lucide-react";
import type { AdminNotificationRow } from "@/services/admin-notification.service";
import type { NotificationPriority, NotificationType } from "@/types/database";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import type { NotificationsEmptyVariant } from "@/lib/admin/notifications-display";

interface AdminNotificationsTableProps {
  rows: AdminNotificationRow[];
  emptyVariant: NotificationsEmptyVariant;
  isPending?: boolean;
  onSelect?: (row: AdminNotificationRow) => void;
}

function TypeBadge({ type, label }: { type: NotificationType; label: string }) {
  const styles: Partial<Record<NotificationType, string>> = {
    new_message: "bg-blue-50 text-blue-700 ring-blue-200/80",
    verification_approved: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    verification_rejected: "bg-red-50 text-red-700 ring-red-200/80",
    admin_broadcast: "bg-purple-50 text-purple-700 ring-purple-200/80",
    system: "bg-indigo-50 text-indigo-700 ring-indigo-200/80",
    gift_granted: "bg-amber-50 text-amber-700 ring-amber-200/80",
    gift_expired: "bg-orange-50 text-orange-700 ring-orange-200/80",
  };

  return (
    <span
      className={cn(
        "inline-flex max-w-[9rem] truncate rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        styles[type] ?? "bg-surface-100 text-surface-700 ring-surface-200/80"
      )}
      title={label}
    >
      {label}
    </span>
  );
}

function PriorityBadge({ priority, label }: { priority: NotificationPriority; label: string }) {
  const config = {
    info: "bg-sky-50 text-sky-700 ring-sky-200/80",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 ring-amber-200/80",
    error: "bg-red-50 text-red-700 ring-red-200/80",
  }[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        config
      )}
    >
      {label}
    </span>
  );
}

function StatusBadge({ isRead }: { isRead: boolean }) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        isRead
          ? "bg-surface-100 text-surface-600 ring-surface-200/80"
          : "bg-brand-50 text-brand-700 ring-brand-200/80"
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", isRead ? "bg-surface-400" : "bg-brand-500")}
      />
      {isRead ? t.admin.notifications.statusRead : t.admin.notifications.statusUnread}
    </span>
  );
}

function EmptyState({ variant }: { variant: NotificationsEmptyVariant }) {
  const { t } = useTranslation();

  const copy =
    variant === "search"
      ? {
          title: t.admin.notifications.emptySearchTitle,
          subtitle: t.admin.notifications.emptySearchSubtitle,
        }
      : variant === "filter"
        ? {
            title: t.admin.notifications.emptyFilterTitle,
            subtitle: t.admin.notifications.emptyFilterSubtitle,
          }
        : {
            title: t.admin.notifications.emptyTitle,
            subtitle: t.admin.notifications.emptySubtitle,
          };

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="relative">
        <div className="absolute inset-0 scale-150 rounded-full bg-surface-100 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-surface-200/80">
          <Bell className="h-7 w-7 text-surface-400" strokeWidth={1.75} />
        </div>
      </div>
      <p className="mt-6 text-base font-semibold text-surface-900">{copy.title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-surface-500">{copy.subtitle}</p>
    </div>
  );
}

export function AdminNotificationsTable({
  rows,
  emptyVariant,
  isPending,
  onSelect,
}: AdminNotificationsTableProps) {
  const { t, locale } = useTranslation();

  const typeLabel = (type: NotificationType) => {
    const labels = t.admin.notifications.types as Record<string, string>;
    return labels[type] ?? type;
  };

  const priorityLabel = (priority: NotificationPriority) => {
    const labels = t.admin.notifications.priorities as Record<string, string>;
    return labels[priority] ?? priority;
  };

  if (rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-sm">
        <EmptyState variant={emptyVariant} />
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "hidden overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-sm lg:block",
          isPending && "pointer-events-none opacity-60"
        )}
      >
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
              <tr className="border-b border-surface-200 text-start text-xs font-semibold uppercase tracking-wider text-surface-500">
                <th className="px-4 py-3">{t.admin.notifications.colUser}</th>
                <th className="px-4 py-3">{t.admin.notifications.colType}</th>
                <th className="px-4 py-3">{t.admin.notifications.colPriority}</th>
                <th className="px-4 py-3">{t.admin.notifications.colTitle}</th>
                <th className="px-4 py-3">{t.admin.notifications.colStatus}</th>
                <th className="px-4 py-3">{t.admin.notifications.colDate}</th>
                <th className="px-4 py-3">{t.admin.notifications.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => onSelect?.(row)}
                  className={cn(
                    "transition-colors hover:bg-surface-50/80",
                    onSelect && "cursor-pointer"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
                        {getInitials(row.recipient?.full_name || row.recipient?.email || "?")}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-surface-900">
                          {row.recipient?.full_name || "—"}
                        </p>
                        <p className="truncate text-xs text-surface-500">{row.recipient?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={row.notification_type} label={typeLabel(row.notification_type)} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge
                      priority={row.priority}
                      label={priorityLabel(row.priority)}
                    />
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate font-medium text-surface-900">{row.title}</p>
                    <p className="truncate text-xs text-surface-500">{row.body}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge isRead={row.is_read} />
                  </td>
                  <td className="px-4 py-3 text-surface-500">
                    {formatDate(row.created_at, locale)}
                  </td>
                  <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                    {row.action_url ? (
                      <a
                        href={row.action_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-surface-200 px-2.5 py-1.5 text-xs font-semibold text-surface-700 transition-colors hover:bg-surface-50"
                      >
                        {t.admin.notifications.viewAction}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-surface-300">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={cn("space-y-3 lg:hidden", isPending && "pointer-events-none opacity-60")}>
        {rows.map((row, index) => (
          <motion.article
            key={row.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onSelect?.(row)}
            className={cn(
              "rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
              onSelect && "cursor-pointer"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                  {getInitials(row.recipient?.full_name || row.recipient?.email || "?")}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-surface-900">
                    {row.recipient?.full_name || "—"}
                  </p>
                  <p className="truncate text-xs text-surface-500">{row.recipient?.email}</p>
                </div>
              </div>
              <StatusBadge isRead={row.is_read} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <TypeBadge type={row.notification_type} label={typeLabel(row.notification_type)} />
              <PriorityBadge priority={row.priority} label={priorityLabel(row.priority)} />
            </div>
            <p className="mt-3 font-medium text-surface-900">{row.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-surface-500">{row.body}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <time className="text-xs text-surface-400">
                {formatDate(row.created_at, locale)}
              </time>
              {row.action_url && (
                <a
                  href={row.action_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600"
                >
                  {t.admin.notifications.viewAction}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </>
  );
}
