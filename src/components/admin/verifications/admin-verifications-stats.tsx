"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminVerificationsStatCardProps {
  label: string;
  value: number | null;
  icon: LucideIcon;
  accent: string;
  delay?: number;
  onClick?: () => void;
}

function AdminVerificationsStatCard({
  label,
  value,
  icon: Icon,
  accent,
  delay = 0,
  onClick,
}: AdminVerificationsStatCardProps) {
  const { t } = useTranslation();
  const unavailable = value === null;
  const Tag = onClick ? "button" : "div";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
    >
      <Tag
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={cn(
          "w-full rounded-2xl border border-surface-200/80 bg-white p-5 text-start shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)]",
          onClick && "cursor-pointer"
        )}
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
                {t.admin.verifications.comingSoon}
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
      </Tag>
    </motion.div>
  );
}

export interface VerificationStatCardConfig {
  key: string;
  label: string;
  value: number | null;
  icon: LucideIcon;
  accent: string;
  delay?: number;
  onClick?: () => void;
}

export function AdminVerificationsStats({ cards }: { cards: VerificationStatCardConfig[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map(({ key, ...card }) => (
        <AdminVerificationsStatCard key={key} {...card} />
      ))}
    </div>
  );
}
