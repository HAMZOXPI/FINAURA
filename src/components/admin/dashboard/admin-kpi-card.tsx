"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import { cn } from "@/lib/utils";

export type AdminKpiAccent =
  | "emerald"
  | "gold"
  | "blue"
  | "indigo"
  | "purple"
  | "red"
  | "orange";

const ACCENT_STYLES: Record<
  AdminKpiAccent,
  { icon: string; accent: string; glow: string }
> = {
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    accent: "bg-emerald-500",
    glow: "group-hover:shadow-emerald-500/10",
  },
  gold: {
    icon: "bg-amber-50 text-amber-600",
    accent: "bg-amber-500",
    glow: "group-hover:shadow-amber-500/10",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600",
    accent: "bg-blue-500",
    glow: "group-hover:shadow-blue-500/10",
  },
  indigo: {
    icon: "bg-indigo-50 text-indigo-600",
    accent: "bg-indigo-500",
    glow: "group-hover:shadow-indigo-500/10",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
    accent: "bg-purple-500",
    glow: "group-hover:shadow-purple-500/10",
  },
  red: {
    icon: "bg-red-50 text-red-600",
    accent: "bg-red-500",
    glow: "group-hover:shadow-red-500/10",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600",
    accent: "bg-orange-500",
    glow: "group-hover:shadow-orange-500/10",
  },
};

export interface AdminKpiCardProps {
  title: string;
  value: number | null;
  valueDisplay?: string;
  secondaryLabel: string;
  icon: LucideIcon;
  accent: AdminKpiAccent;
  delay?: number;
}

export function AdminKpiCard({
  title,
  value,
  valueDisplay,
  secondaryLabel,
  icon: Icon,
  accent,
  delay = 0,
}: AdminKpiCardProps) {
  const styles = ACCENT_STYLES[accent];
  const unavailable = value === null && !valueDisplay;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.38, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-surface-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)]",
        styles.glow
      )}
    >
      <div
        className={cn("absolute inset-y-4 start-0 w-1 rounded-full", styles.accent)}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-4 ps-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-surface-900">
            {unavailable ? (
              <span className="text-surface-300">—</span>
            ) : valueDisplay ? (
              <span>{valueDisplay}</span>
            ) : (
              <AnimatedCounter value={value ?? 0} />
            )}
          </p>
          <p className="mt-2 text-xs font-medium text-surface-400">{secondaryLabel}</p>
        </div>

        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/[0.04]",
            styles.icon
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </motion.article>
  );
}
