"use client";

import { motion } from "framer-motion";
import {
  BOOST_STATUS_STYLES,
  type BoostDisplayStatus,
} from "@/lib/boost/ui";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface BoostStatusBadgeProps {
  status: BoostDisplayStatus;
  className?: string;
  pulse?: boolean;
}

export function BoostStatusBadge({ status, className, pulse = false }: BoostStatusBadgeProps) {
  const { t } = useTranslation();
  const styles = BOOST_STATUS_STYLES[status];

  const labels: Record<BoostDisplayStatus, string> = {
    active: t.boost.statusActive,
    processing: t.boost.statusProcessing,
    expired: t.boost.statusExpired,
    cancelled: t.boost.statusCancelled,
    upcoming: t.boost.statusUpcoming,
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        styles.badge,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          styles.dot,
          pulse && status === "processing" && "animate-pulse"
        )}
      />
      {labels[status]}
    </motion.span>
  );
}
