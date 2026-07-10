"use client";

import { motion } from "framer-motion";
import type { AdminActivityItem } from "@/services/admin.service";
import { mapActivityToDrawerEvent } from "@/lib/admin/user-drawer-display";
import { useTranslation } from "@/i18n/locale-provider";

function formatRelativeTime(
  dateString: string,
  locale: string,
  labels: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    yesterday: string;
    daysAgo: string;
  }
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return labels.justNow;
  if (diffMins < 60) return labels.minutesAgo.replace("{count}", String(diffMins));
  if (diffHours < 24) return labels.hoursAgo.replace("{count}", String(diffHours));
  if (diffDays === 1) return labels.yesterday;
  if (diffDays < 7) return labels.daysAgo.replace("{count}", String(diffDays));

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    month: "short",
    day: "numeric",
  }).format(date);
}

interface VerificationActivityTimelineProps {
  items: AdminActivityItem[];
}

export function VerificationActivityTimeline({ items }: VerificationActivityTimelineProps) {
  const { t, locale } = useTranslation();

  const activityLabels = {
    joined: t.admin.verifications.drawer.eventJoined,
    listing: t.admin.verifications.drawer.eventListing,
    verification: t.admin.verifications.drawer.eventVerification,
    message: t.admin.verifications.drawer.eventMessage,
  };

  const timeLabels = {
    justNow: t.admin.activity.justNow,
    minutesAgo: t.admin.activity.minutesAgo,
    hoursAgo: t.admin.activity.hoursAgo,
    yesterday: t.admin.activity.yesterday,
    daysAgo: t.admin.activity.daysAgo,
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50/50 px-4 py-10 text-center">
        <p className="text-sm font-semibold text-surface-900">
          {t.admin.verifications.drawer.activityEmptyTitle}
        </p>
        <p className="mt-1 text-xs text-surface-500">
          {t.admin.verifications.drawer.activityEmptySubtitle}
        </p>
      </div>
    );
  }

  return (
    <div className="relative ps-4">
      <div className="absolute bottom-2 start-[7px] top-2 w-px bg-surface-200" aria-hidden />
      <ul className="space-y-3">
        {items.map((item, index) => {
          const event = mapActivityToDrawerEvent(item, activityLabels);
          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="relative flex items-start gap-3 rounded-xl border border-surface-100 bg-white px-3 py-3 shadow-sm"
            >
              <span
                className="absolute -start-4 top-4 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white ring-2 ring-brand-200"
                aria-hidden
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              </span>
              <span className="text-lg" aria-hidden>
                {event.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-surface-900">{event.title}</p>
                <p className="mt-0.5 truncate text-xs text-surface-500">{event.subtitle}</p>
              </div>
              <time className="shrink-0 text-[11px] font-medium text-surface-400">
                {formatRelativeTime(item.createdAt, locale, timeLabels)}
              </time>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
