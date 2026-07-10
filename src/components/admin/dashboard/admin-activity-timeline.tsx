"use client";

import { motion } from "framer-motion";
import {
  formatActivityRelativeTime,
  type ActivityFeedItem,
  type ActivityStatusTone,
} from "@/lib/admin/activity-center";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const STATUS_STYLES: Record<ActivityStatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
  warning: "bg-orange-50 text-orange-700 ring-orange-200/80",
  info: "bg-blue-50 text-blue-700 ring-blue-200/80",
  danger: "bg-red-50 text-red-700 ring-red-200/80",
  neutral: "bg-surface-100 text-surface-600 ring-surface-200/80",
};

interface AdminActivityTimelineProps {
  items: ActivityFeedItem[];
}

export function AdminActivityTimeline({ items }: AdminActivityTimelineProps) {
  const { t, locale } = useTranslation();

  return (
    <ul className="relative space-y-3">
      <div
        className="absolute start-[1.375rem] top-3 bottom-3 w-px bg-gradient-to-b from-surface-200 via-surface-200/80 to-transparent"
        aria-hidden
      />

      {items.map((item, index) => {
        const relativeTime = formatActivityRelativeTime(item.createdAt, locale, {
          justNow: t.admin.activity.justNow,
          minutesAgo: t.admin.activity.minutesAgo,
          hoursAgo: t.admin.activity.hoursAgo,
          yesterday: t.admin.activity.yesterday,
          daysAgo: t.admin.activity.daysAgo,
        });

        const statusLabel =
          t.admin.activity.status[item.statusKey as keyof typeof t.admin.activity.status] ??
          item.statusKey;

        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.32, ease: "easeOut" }}
            className="relative ps-12"
          >
            <div
              className="absolute start-0 top-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-surface-200/80"
              aria-hidden
            >
              {item.emoji}
            </div>

            <motion.article
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-surface-200/70 bg-white px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md sm:px-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-surface-900">{item.title}</h3>
                    <motion.span
                      initial={{ scale: 0.92, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.04 + 0.08, duration: 0.25 }}
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                        STATUS_STYLES[item.statusTone]
                      )}
                    >
                      {statusLabel}
                    </motion.span>
                  </div>
                  <p className="mt-1 text-sm text-surface-500">{item.description}</p>
                </div>

                <time
                  dateTime={item.createdAt}
                  className="shrink-0 text-xs font-medium text-surface-400 sm:pt-0.5"
                >
                  {relativeTime}
                </time>
              </div>
            </motion.article>
          </motion.li>
        );
      })}
    </ul>
  );
}
