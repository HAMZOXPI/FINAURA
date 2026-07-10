"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { fetchUserPromotionStatus } from "@/actions/admin-promotion.actions";
import type { AdminNotificationRow } from "@/services/admin-notification.service";
import type { UserPromotionStatus } from "@/services/admin-promotion.service";
import type { NotificationPriority, NotificationType } from "@/types/database";
import {
  buildDeliveryMetrics,
  buildNotificationTimeline,
  buildRelatedEntityInfo,
} from "@/lib/admin/notification-details-drawer-display";
import { getNotificationVisuals } from "@/lib/notifications/presentation";
import { NotificationContentCard } from "@/components/admin/notifications/notification-content-card";
import { NotificationDeliveryCard } from "@/components/admin/notifications/notification-delivery-card";
import { NotificationQuickActions } from "@/components/admin/notifications/notification-quick-actions";
import { NotificationRelatedCard } from "@/components/admin/notifications/notification-related-card";
import { NotificationTimeline } from "@/components/admin/notifications/notification-timeline";
import { NotificationUserSummary } from "@/components/admin/notifications/notification-user-summary";
import { cn, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminNotificationDetailsDrawerProps {
  notification: AdminNotificationRow | null;
  onClose: () => void;
}

function TypeBadge({ type, label }: { type: NotificationType; label: string }) {
  const visuals = getNotificationVisuals(type, "info");
  const Icon = visuals.Icon;

  return (
    <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-semibold text-surface-700 ring-1 ring-surface-200/80">
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{label}</span>
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
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
        config
      )}
    >
      {label}
    </span>
  );
}

function ReadBadge({ isRead }: { isRead: boolean }) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
        isRead
          ? "bg-surface-100 text-surface-600 ring-surface-200/80"
          : "bg-brand-50 text-brand-700 ring-brand-200/80"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", isRead ? "bg-surface-400" : "bg-brand-500")} />
      {isRead ? t.admin.notifications.statusRead : t.admin.notifications.statusUnread}
    </span>
  );
}

export function AdminNotificationDetailsDrawer({
  notification,
  onClose,
}: AdminNotificationDetailsDrawerProps) {
  const { t, locale } = useTranslation();
  const [promotionStatus, setPromotionStatus] = useState<UserPromotionStatus | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const isOpen = notification !== null;
  const userId = notification?.user_id;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!userId) {
      setPromotionStatus(null);
      return;
    }

    setMetricsLoading(true);
    void fetchUserPromotionStatus(userId).then((result) => {
      if ("status" in result && result.status) {
        setPromotionStatus(result.status);
      } else {
        setPromotionStatus(null);
      }
      setMetricsLoading(false);
    });
  }, [userId]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const typeLabel = (type: NotificationType) => {
    const labels = t.admin.notifications.types as Record<string, string>;
    return labels[type] ?? type;
  };

  const priorityLabel = (priority: NotificationPriority) => {
    const labels = t.admin.notifications.priorities as Record<string, string>;
    return labels[priority] ?? priority;
  };

  const related = useMemo(
    () => (notification ? buildRelatedEntityInfo(notification) : null),
    [notification]
  );

  const timeline = useMemo(
    () => (notification ? buildNotificationTimeline(notification) : []),
    [notification]
  );

  const deliveryMetrics = useMemo(
    () => (notification ? buildDeliveryMetrics(notification) : []),
    [notification]
  );

  const slideProps = isDesktop
    ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  const visuals = notification
    ? getNotificationVisuals(notification.notification_type, notification.priority)
    : null;

  return (
    <AnimatePresence>
      {isOpen && notification && visuals && (
        <>
          <motion.button
            type="button"
            aria-label={t.admin.notifications.drawer.close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[3px]"
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-details-drawer-title"
            {...slideProps}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className={cn(
              "fixed z-[90] flex flex-col bg-white shadow-2xl",
              "inset-0 lg:inset-y-0 lg:end-0 lg:start-auto lg:w-full lg:max-w-[680px]"
            )}
          >
            <div className="sticky top-0 z-20 border-b border-surface-100 bg-white/95 px-5 py-4 backdrop-blur-md sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ring-1 ring-black/[0.04] shadow-sm",
                      visuals.iconClass
                    )}
                  >
                    <visuals.Icon className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="notification-details-drawer-title"
                      className="line-clamp-2 text-xl font-bold tracking-tight text-surface-900"
                    >
                      {notification.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <TypeBadge
                        type={notification.notification_type}
                        label={typeLabel(notification.notification_type)}
                      />
                      <PriorityBadge
                        priority={notification.priority}
                        label={priorityLabel(notification.priority)}
                      />
                      <ReadBadge isRead={notification.is_read} />
                    </div>
                    <p className="mt-2 text-xs text-surface-500">
                      {t.admin.notifications.drawer.created}:{" "}
                      {formatDate(notification.created_at, locale)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-200 text-surface-600 transition-colors hover:bg-surface-50"
                  aria-label={t.admin.notifications.drawer.close}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
              <div className="space-y-6">
                <NotificationContentCard notification={notification} />

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                    {t.admin.notifications.drawer.userTitle}
                  </h3>
                  <NotificationUserSummary
                    notification={notification}
                    promotionStatus={promotionStatus}
                    loading={metricsLoading}
                  />
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                    {t.admin.notifications.drawer.deliveryTitle}
                  </h3>
                  <NotificationDeliveryCard metrics={deliveryMetrics} loading={false} />
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                    {t.admin.notifications.drawer.timelineTitle}
                  </h3>
                  <div className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm">
                    <NotificationTimeline events={timeline} />
                  </div>
                </section>

                {related?.kind && <NotificationRelatedCard related={related} />}
              </div>
            </div>

            <div className="sticky bottom-0 z-20 border-t border-surface-100 bg-white/95 px-5 py-4 backdrop-blur-md sm:px-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-surface-400">
                {t.admin.notifications.drawer.actionsTitle}
              </p>
              <NotificationQuickActions notification={notification} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
