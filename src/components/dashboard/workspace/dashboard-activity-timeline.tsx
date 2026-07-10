"use client";

import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  CircleDashed,
  Home,
  MessageSquare,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import type { DashboardActivityItem, DashboardActivityType } from "@/lib/dashboard/workspace-display";
import { cn, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const TYPE_META: Record<
  DashboardActivityType,
  { icon: typeof Home; accent: string }
> = {
  listing_created: { icon: Home, accent: "bg-brand-50 text-brand-600" },
  boost_activated: { icon: Rocket, accent: "bg-orange-50 text-orange-600" },
  verification: { icon: ShieldCheck, accent: "bg-emerald-50 text-emerald-600" },
  message: { icon: MessageSquare, accent: "bg-violet-50 text-violet-600" },
  notification: { icon: Bell, accent: "bg-sky-50 text-sky-600" },
};

interface DashboardActivityTimelineProps {
  items: DashboardActivityItem[];
}

export function DashboardActivityTimeline({ items }: DashboardActivityTimelineProps) {
  const { t, locale } = useTranslation();
  const ws = t.dashboard.workspace;

  const typeLabels: Record<DashboardActivityType, string> = {
    listing_created: ws.activityListing,
    boost_activated: ws.activityBoost,
    verification: ws.activityVerification,
    message: ws.activityMessage,
    notification: ws.activityNotification,
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-4 py-12 text-center">
        <CircleDashed className="h-10 w-10 text-surface-300" />
        <p className="mt-4 text-sm font-semibold text-surface-700">{ws.activityEmpty}</p>
        <p className="mt-1 text-xs text-surface-500">{ws.activityEmptySubtitle}</p>
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {items.map((item, index) => {
        const meta = TYPE_META[item.type];
        const Icon = meta.icon;
        const isLast = index === items.length - 1;

        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {!isLast && (
              <span
                className="absolute start-4 top-8 h-[calc(100%-1rem)] w-px -translate-x-1/2 bg-surface-200"
                aria-hidden
              />
            )}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                meta.accent
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-surface-400">
                {typeLabels[item.type]}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-surface-900">{item.title}</p>
              <p className="truncate text-xs text-surface-500">{item.subtitle}</p>
              <time className="mt-1 block text-xs text-surface-400">
                {formatDate(item.createdAt, locale)}
              </time>
            </div>
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-surface-300" />
          </motion.li>
        );
      })}
    </ol>
  );
}
