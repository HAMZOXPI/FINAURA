"use client";

import { motion } from "framer-motion";
import { CheckCircle2, CircleDashed, Clock } from "lucide-react";
import type { NotificationTimelineEvent } from "@/lib/admin/notification-details-drawer-display";
import { cn, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface NotificationTimelineProps {
  events: NotificationTimelineEvent[];
  loading?: boolean;
}

export function NotificationTimeline({ events, loading }: NotificationTimelineProps) {
  const { t, locale } = useTranslation();

  const labels: Record<NotificationTimelineEvent["key"], string> = {
    created: t.admin.notifications.drawer.timeline.created,
    delivered: t.admin.notifications.drawer.timeline.delivered,
    read: t.admin.notifications.drawer.timeline.read,
    clicked: t.admin.notifications.drawer.timeline.clicked,
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex gap-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-surface-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-surface-100" />
              <div className="h-3 w-48 animate-pulse rounded bg-surface-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const completed = event.available && event.timestamp;

        return (
          <motion.li
            key={event.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {!isLast && (
              <span
                className={cn(
                  "absolute start-4 top-8 h-[calc(100%-1rem)] w-px -translate-x-1/2",
                  completed ? "bg-brand-200" : "bg-surface-200"
                )}
                aria-hidden
              />
            )}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                completed
                  ? "bg-brand-600 text-white"
                  : event.available
                    ? "bg-surface-100 text-surface-400"
                    : "bg-surface-50 text-surface-300"
              )}
            >
              {completed ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : event.available ? (
                <Clock className="h-3.5 w-3.5" />
              ) : (
                <CircleDashed className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-surface-900">{labels[event.key]}</p>
              <p className="mt-0.5 text-xs text-surface-500">
                {event.timestamp
                  ? formatDate(event.timestamp, locale)
                  : t.admin.notifications.comingSoon}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
