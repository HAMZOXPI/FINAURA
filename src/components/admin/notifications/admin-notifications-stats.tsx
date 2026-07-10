"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export interface NotificationStatCardConfig {
  key: string;
  label: string;
  value: number | null;
  icon: LucideIcon;
  accent: string;
  delay?: number;
}

function AdminNotificationsStatCard({
  label,
  value,
  icon: Icon,
  accent,
  delay = 0,
}: Omit<NotificationStatCardConfig, "key">) {
  const { t } = useTranslation();
  const unavailable = value === null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-surface-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-surface-900">
            {unavailable ? (
              <span className="text-base font-semibold text-surface-300">—</span>
            ) : (
              <AnimatedCounter value={value} />
            )}
          </p>
          {unavailable && (
            <p className="mt-2 text-xs font-medium text-surface-400">
              {t.admin.notifications.comingSoon}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/[0.04]",
            accent
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}

export function AdminNotificationsStats({ cards }: { cards: NotificationStatCardConfig[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map(({ key, ...card }) => (
        <AdminNotificationsStatCard key={key} {...card} />
      ))}
    </div>
  );
}
