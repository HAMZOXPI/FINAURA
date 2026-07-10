"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import { cn } from "@/lib/utils";

interface AdminRevenuePerformanceCardProps {
  title: string;
  value: string;
  numericValue?: number | null;
  icon: LucideIcon;
  unavailable?: boolean;
  delay?: number;
}

export function AdminRevenuePerformanceCard({
  title,
  value,
  numericValue,
  icon: Icon,
  unavailable = false,
  delay = 0,
}: AdminRevenuePerformanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32 }}
      whileHover={{ y: -2 }}
      className="rounded-xl border border-surface-200/70 bg-white px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-surface-500">{title}</p>
          <p
            className={cn(
              "mt-0.5 truncate text-base font-bold tracking-tight",
              unavailable ? "text-surface-300" : "text-surface-900"
            )}
          >
            {unavailable ? (
              "—"
            ) : numericValue !== undefined && numericValue !== null ? (
              <AnimatedCounter value={numericValue} />
            ) : (
              value
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
