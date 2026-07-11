"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, X } from "lucide-react";
import {
  deleteUserNotification,
  fetchUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/actions/notification.actions";
import { DROPDOWN_NOTIFICATION_LIMIT } from "@/lib/notifications/constants";
import { NOTIFICATIONS_SYNC_EVENT } from "@/lib/notifications/client-sync";
import { NotificationCountBadge } from "@/components/notifications/notification-count-badge";
import { NotificationEmptyState } from "@/components/notifications/notification-empty-state";
import { NotificationItem } from "@/components/notifications/notification-item";
import { NotificationListSkeleton } from "@/components/notifications/notification-list-skeleton";
import { useNotifications } from "@/components/notifications/notifications-provider";
import type { Notification } from "@/types/database";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface NotificationBellProps {
  variant?: "light" | "dark";
}

interface NotificationPanelProps {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  isPending: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onOpenNotification: (notification: Notification) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationPanel({
  notifications,
  loading,
  unreadCount,
  isPending,
  onClose,
  onMarkAllRead,
  onOpenNotification,
  onMarkRead,
  onDelete,
}: NotificationPanelProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="shrink-0 border-b border-surface-100 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:bg-surface-50/80">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-surface-900 sm:text-sm">
              {t.notifications.title}
            </h3>
            {unreadCount > 0 && (
              <p className="text-xs text-surface-500">
                {t.notifications.unreadCount.replace("{count}", String(unreadCount))}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {unreadCount > 0 && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isPending}
                onClick={onMarkAllRead}
                title={t.notifications.markAllRead}
                className="h-9 w-9 p-0 sm:h-9"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-9 w-9 p-0 sm:h-9"
              aria-label={t.notifications.close}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain sm:max-h-[min(70vh,420px)] sm:flex-none">
        {loading ? (
          <NotificationListSkeleton count={4} compact />
        ) : notifications.length === 0 ? (
          <NotificationEmptyState compact />
        ) : (
          <ul className="divide-y divide-surface-100">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <NotificationItem
                  notification={notification}
                  compact
                  onOpen={onOpenNotification}
                  onMarkRead={onMarkRead}
                  onDelete={onDelete}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-surface-100 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bg-surface-50/80">
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:h-10 sm:bg-white sm:text-brand-700 sm:ring-1 sm:ring-surface-200 sm:hover:bg-brand-50"
        >
          {t.notifications.viewAll}
        </Link>
      </div>
    </>
  );
}

export function NotificationBell({ variant = "light" }: NotificationBellProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    unreadCount,
    refreshUnreadCount,
    decrementUnread,
    bellRing,
    notificationsRevision,
    recentNotifications,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobileSheet = useMediaQuery("(max-width: 639px)");

  const solid = variant === "light";

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const result = await fetchUserNotifications(DROPDOWN_NOTIFICATION_LIMIT);
    if ("notifications" in result && result.notifications) {
      setNotifications(result.notifications);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) void loadNotifications();
  }, [open, loadNotifications]);

  useEffect(() => {
    if (recentNotifications.length > 0) {
      setNotifications(recentNotifications.slice(0, DROPDOWN_NOTIFICATION_LIMIT));
    }
  }, [recentNotifications, notificationsRevision]);

  useEffect(() => {
    const onSync = () => {
      if (open) void loadNotifications();
    };
    window.addEventListener(NOTIFICATIONS_SYNC_EVENT, onSync);
    return () => window.removeEventListener(NOTIFICATIONS_SYNC_EVENT, onSync);
  }, [open, loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 640) return;
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleOpenNotification = (notification: Notification) => {
    startTransition(async () => {
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);
        decrementUnread(1);
        setNotifications((prev) =>
          prev.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item))
        );
      }

      setOpen(false);

      if (notification.action_url) {
        router.push(notification.action_url);
      }
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      await refreshUnreadCount();
    });
  };

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
      decrementUnread(1);
    });
  };

  const handleDelete = (notificationId: string) => {
    const wasUnread = notifications.find((n) => n.id === notificationId && !n.is_read);
    startTransition(async () => {
      await deleteUserNotification(notificationId);
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
      if (wasUnread) decrementUnread(1);
      await refreshUnreadCount();
    });
  };

  const panelProps: NotificationPanelProps = {
    notifications,
    loading,
    unreadCount,
    isPending,
    onClose: () => setOpen(false),
    onMarkAllRead: handleMarkAllRead,
    onOpenNotification: handleOpenNotification,
    onMarkRead: handleMarkRead,
    onDelete: handleDelete,
  };

  const mobileSheet = (
    <BottomSheet
      open={open && isMobileSheet}
      onClose={() => setOpen(false)}
      ariaLabel={t.notifications.title}
      height="large"
      showHandle
      showCloseButton={false}
      closeLabel={t.notifications.close}
      contentClassName="flex flex-col px-0 pb-0"
      zIndex={130}
    >
      <NotificationPanel {...panelProps} />
    </BottomSheet>
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative rounded-xl p-2 transition-colors duration-200",
          solid
            ? "text-surface-600 hover:bg-surface-100 hover:text-brand-600"
            : "text-white/90 hover:bg-white/10 hover:text-white"
        )}
        aria-label={t.notifications.bellLabel}
        aria-expanded={open}
      >
        <motion.span
          key={bellRing}
          animate={
            bellRing > 0
              ? {
                  rotate: [0, -14, 14, -10, 10, -4, 0],
                  scale: [1, 1.15, 1.05, 1.1, 1],
                }
              : { rotate: 0, scale: 1 }
          }
          transition={{ duration: 0.65, ease: "easeInOut" }}
          className="inline-flex"
        >
          <Bell className="h-5 w-5" />
        </motion.span>
        <NotificationCountBadge count={unreadCount} className="absolute -end-1 -top-1" />
      </button>

      {mobileSheet}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute end-0 z-50 mt-2 hidden w-[min(100vw-2rem,400px)] overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-xl ring-1 ring-black/5 sm:block"
            role="dialog"
            aria-modal="true"
            aria-label={t.notifications.title}
          >
            <NotificationPanel {...panelProps} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
