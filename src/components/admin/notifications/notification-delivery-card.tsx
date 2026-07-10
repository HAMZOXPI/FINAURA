"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  CircleDashed,
  MousePointerClick,
  MailOpen,
  Send,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NotificationDeliveryMetric } from "@/lib/admin/notification-details-drawer-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const METRIC_ICONS: Record<NotificationDeliveryMetric["key"], LucideIcon> = {
  delivered: Send,
  read: MailOpen,
  clicked: MousePointerClick,
  opened: CheckCircle2,
  failed: XCircle,
};

const METRIC_ACCENTS: Record<NotificationDeliveryMetric["key"], string> = {
  delivered: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  read: "bg-brand-50 text-brand-600 ring-brand-100",
  clicked: "bg-sky-50 text-sky-600 ring-sky-100",
  opened: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  failed: "bg-red-50 text-red-600 ring-red-100",
};

interface NotificationDeliveryCardProps {
  metrics: NotificationDeliveryMetric[];
  loading?: boolean;
}

function DeliverySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-2xl bg-surface-100" />
      ))}
    </div>
  );
}

export function NotificationDeliveryCard({ metrics, loading }: NotificationDeliveryCardProps) {
  const { t } = useTranslation();

  const labels: Record<NotificationDeliveryMetric["key"], string> = {
    delivered: t.admin.notifications.drawer.delivery.delivered,
    read: t.admin.notifications.drawer.delivery.read,
    clicked: t.admin.notifications.drawer.delivery.clicked,
    opened: t.admin.notifications.drawer.delivery.opened,
    failed: t.admin.notifications.drawer.delivery.failed,
  };

  if (loading) return <DeliverySkeleton />;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => {
        const Icon = METRIC_ICONS[metric.key];
        const unavailable = !metric.available;

        return (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-surface-500">{labels[metric.key]}</p>
                <p className="mt-2 text-sm font-bold text-surface-900">
                  {unavailable ? (
                    <span className="text-xs font-semibold text-surface-400">
                      {t.admin.notifications.comingSoon}
                    </span>
                  ) : metric.value === true ? (
                    t.admin.notifications.drawer.delivery.yes
                  ) : metric.value === false ? (
                    t.admin.notifications.drawer.delivery.no
                  ) : (
                    "—"
                  )}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
                  unavailable ? "bg-surface-50 text-surface-400 ring-surface-100" : METRIC_ACCENTS[metric.key]
                )}
              >
                {unavailable ? (
                  <CircleDashed className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" strokeWidth={2} />
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
