"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Gift,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  buildNotificationCategoryMetrics,
  type NotificationAnalyticsCategory,
} from "@/lib/admin/notifications-display";
import type { AdminNotificationStats } from "@/services/admin-notification.service";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const CATEGORY_META: Record<
  NotificationAnalyticsCategory,
  { icon: LucideIcon; accent: string }
> = {
  messages: { icon: MessageSquare, accent: "bg-blue-50 text-blue-600" },
  verification: { icon: ShieldCheck, accent: "bg-emerald-50 text-emerald-600" },
  boost: { icon: Rocket, accent: "bg-orange-50 text-orange-600" },
  promotion: { icon: Sparkles, accent: "bg-purple-50 text-purple-600" },
  system: { icon: Bell, accent: "bg-indigo-50 text-indigo-600" },
  gift: { icon: Gift, accent: "bg-amber-50 text-amber-600" },
};

interface AdminNotificationAnalyticsProps {
  stats: AdminNotificationStats;
}

export function AdminNotificationAnalytics({ stats }: AdminNotificationAnalyticsProps) {
  const { t } = useTranslation();
  const metrics = buildNotificationCategoryMetrics(stats);

  const labels: Record<NotificationAnalyticsCategory, string> = {
    messages: t.admin.notifications.analytics.messages,
    verification: t.admin.notifications.analytics.verification,
    boost: t.admin.notifications.analytics.boost,
    promotion: t.admin.notifications.analytics.promotion,
    system: t.admin.notifications.analytics.system,
    gift: t.admin.notifications.analytics.gift,
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight text-surface-900">
        {t.admin.notifications.analytics.title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric, index) => {
          const meta = CATEGORY_META[metric.key];
          const Icon = meta.icon;

          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.32 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-surface-500">{labels[metric.key]}</p>
                  <p className="mt-2 text-2xl font-bold text-surface-900">
                    <AnimatedCounter value={metric.count} />
                  </p>
                  <p className="mt-1 text-xs font-semibold text-brand-600">{metric.percentage}%</p>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/[0.04]",
                    meta.accent
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
