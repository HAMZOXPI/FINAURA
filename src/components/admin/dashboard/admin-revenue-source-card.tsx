"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Minus, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminRevenueSourceCardProps {
  title: string;
  icon: LucideIcon;
  revenue: number | null;
  percentage: number | null;
  comingSoon?: boolean;
  delay?: number;
}

export function AdminRevenueSourceCard({
  title,
  icon: Icon,
  revenue,
  percentage,
  comingSoon = false,
  delay = 0,
}: AdminRevenueSourceCardProps) {
  const { t, locale } = useTranslation();
  const unavailable = comingSoon || revenue === null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>

        {unavailable ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-semibold text-surface-500">
            <Minus className="h-3 w-3" />
            {comingSoon ? t.admin.comingSoonShort : "—"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            <TrendingUp className="h-3 w-3" />
            {percentage !== null ? `${percentage}%` : "—"}
          </span>
        )}
      </div>

      <p className="mt-4 text-sm font-medium text-surface-500">{title}</p>
      <p
        className={cn(
          "mt-1 text-xl font-bold tracking-tight",
          unavailable ? "text-surface-300" : "text-surface-900"
        )}
      >
        {unavailable ? "—" : formatPrice(revenue, undefined, locale)}
      </p>
    </motion.div>
  );
}
