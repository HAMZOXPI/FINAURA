"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export type FinauraPremiumBadgeVariant =
  | "premium"
  | "sponsored"
  | "verified"
  | "luxury"
  | "developer";

interface FinauraPremiumBadgeProps {
  variant?: FinauraPremiumBadgeVariant;
  className?: string;
  showTooltip?: boolean;
  animate?: boolean;
}

export function FinauraPremiumBadge({
  variant = "premium",
  className,
  showTooltip = true,
  animate = true,
}: FinauraPremiumBadgeProps) {
  const { t } = useTranslation();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const labels: Record<FinauraPremiumBadgeVariant, string> = {
    premium: t.properties.premiumBadge,
    sponsored: t.properties.sponsoredBadge,
    verified: t.properties.verifiedBadge,
    luxury: t.properties.luxuryBadge,
    developer: t.properties.developerBadge,
  };
  const label = labels[variant];

  const badge = (
    <span
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "bg-gradient-to-r from-amber-500/95 via-yellow-500/95 to-amber-600/95",
        "text-[10px] font-bold uppercase tracking-[0.12em] text-amber-950",
        "shadow-[0_2px_12px_rgba(251,191,36,0.45),0_0_20px_rgba(251,191,36,0.15)]",
        "ring-1 ring-amber-300/50 backdrop-blur-sm",
        className
      )}
    >
      <Crown className="h-3 w-3 shrink-0 fill-amber-900/30 text-amber-950" strokeWidth={2.25} />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );

  const content = animate ? (
    <motion.span
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {badge}
    </motion.span>
  ) : (
    badge
  );

  if (!showTooltip) return content;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
      onFocus={() => setTooltipOpen(true)}
      onBlur={() => setTooltipOpen(false)}
      onClick={() => setTooltipOpen((open) => !open)}
    >
      {content}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute start-0 top-full z-30 mt-2 w-max max-w-[14rem] rounded-lg",
          "border border-amber-200/20 bg-surface-900/95 px-3 py-2 text-[11px] leading-snug text-white/90",
          "shadow-lg backdrop-blur-md transition-all duration-200",
          tooltipOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-1 opacity-0 sm:group-hover/badge:translate-y-0 sm:group-hover/badge:opacity-100"
        )}
      >
        {t.properties.premiumTooltip}
      </span>
    </span>
  );
}

interface HomepagePositionBadgeProps {
  position: number;
  className?: string;
  animate?: boolean;
}

export function HomepagePositionBadge({
  position,
  className,
  animate = true,
}: HomepagePositionBadgeProps) {
  const { t } = useTranslation();

  if (position !== 1) return null;

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1",
        "bg-gradient-to-r from-amber-400/90 to-yellow-500/90",
        "text-[10px] font-bold tracking-wide text-amber-950",
        "shadow-[0_2px_10px_rgba(251,191,36,0.35)] ring-1 ring-amber-300/40",
        className
      )}
    >
      <span aria-hidden>🥇</span>
      <span>{t.properties.positionOneBadge}</span>
    </span>
  );

  if (!animate) return badge;

  return (
    <motion.span
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {badge}
    </motion.span>
  );
}

export function PremiumBadgeGroup({
  variant = "premium",
  homepagePosition,
  showTooltip = true,
  className,
}: {
  variant?: FinauraPremiumBadgeVariant;
  homepagePosition?: number;
  showTooltip?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("group/badge flex flex-wrap items-center gap-1.5", className)}>
      <FinauraPremiumBadge variant={variant} showTooltip={showTooltip} />
      {homepagePosition === 1 && <HomepagePositionBadge position={homepagePosition} />}
    </div>
  );
}
