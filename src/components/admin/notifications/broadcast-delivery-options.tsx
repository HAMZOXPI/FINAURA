"use client";

import { motion } from "framer-motion";
import { CalendarClock, Clock, RefreshCw, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BroadcastDeliveryMode } from "@/lib/admin/broadcast-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface BroadcastDeliveryOptionsProps {
  mode: BroadcastDeliveryMode;
  onModeChange: (mode: BroadcastDeliveryMode) => void;
}

const OPTIONS: {
  id: BroadcastDeliveryMode;
  icon: LucideIcon;
  accent: string;
  available: boolean;
}[] = [
  { id: "send_now", icon: Send, accent: "bg-emerald-50 text-emerald-600", available: true },
  { id: "schedule", icon: CalendarClock, accent: "bg-sky-50 text-sky-600", available: false },
  { id: "draft", icon: Clock, accent: "bg-amber-50 text-amber-600", available: false },
  { id: "recurring", icon: RefreshCw, accent: "bg-purple-50 text-purple-600", available: false },
];

export function BroadcastDeliveryOptions({ mode, onModeChange }: BroadcastDeliveryOptionsProps) {
  const { t } = useTranslation();
  const bc = t.admin.notifications.broadcastCenter;

  const labels: Record<BroadcastDeliveryMode, string> = {
    send_now: bc.deliverySendNow,
    schedule: bc.deliverySchedule,
    draft: bc.deliveryDraft,
    recurring: bc.deliveryRecurring,
  };

  const descriptions: Record<BroadcastDeliveryMode, string> = {
    send_now: bc.deliverySendNowDesc,
    schedule: bc.deliveryScheduleDesc,
    draft: bc.deliveryDraftDesc,
    recurring: bc.deliveryRecurringDesc,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight text-surface-900">{bc.deliveryTitle}</h2>
        <p className="mt-1 text-sm text-surface-500">{bc.deliverySubtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option, index) => {
          const Icon = option.icon;
          const isSelected = mode === option.id;
          const disabled = !option.available;

          return (
            <motion.button
              key={option.id}
              type="button"
              disabled={disabled}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={disabled ? undefined : { y: -2 }}
              onClick={() => {
                if (option.available) onModeChange(option.id);
              }}
              className={cn(
                "relative rounded-2xl border p-4 text-start transition-all",
                disabled
                  ? "cursor-not-allowed border-surface-100 bg-surface-50/50 opacity-70"
                  : isSelected
                    ? "border-brand-300 bg-brand-50/40 ring-2 ring-brand-500/20"
                    : "border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm"
              )}
            >
              {disabled && (
                <span className="absolute end-3 top-3 rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-semibold text-surface-500">
                  {t.admin.notifications.comingSoon}
                </span>
              )}
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-black/[0.04]",
                  option.accent
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="mt-3 text-sm font-bold text-surface-900">{labels[option.id]}</p>
              <p className="mt-1 text-xs leading-relaxed text-surface-500">
                {descriptions[option.id]}
              </p>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
