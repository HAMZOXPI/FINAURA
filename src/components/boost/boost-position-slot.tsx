"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Eye, MousePointerClick, TrendingUp, Zap } from "lucide-react";
import type { BoostMarketplacePosition } from "@/types/boost";
import { HOMEPAGE_SPOTLIGHT_DURATION_DAYS } from "@/lib/boost/ui";
import {
  formatMarketingEstimates,
  getPositionTheme,
} from "@/lib/boost/marketplace-display";
import { BoostCountdown } from "@/components/boost/boost-countdown";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface BoostPositionSlotProps {
  slot: BoostMarketplacePosition;
  index: number;
  isBoosting: boolean;
  boostingPosition: number | null;
  onBoost: (position: number) => void;
}

export function BoostPositionSlot({
  slot,
  index,
  isBoosting,
  boostingPosition,
  onBoost,
}: BoostPositionSlotProps) {
  const { t, locale } = useTranslation();
  const theme = getPositionTheme(slot.position);
  const isLoading = isBoosting && boostingPosition === slot.position;
  const isOwn = slot.isOwnListing;
  const isDisabled = isBoosting || isOwn;
  const isEmpty = slot.currentPrice === null && !slot.holderTitle;
  const displayBid = slot.currentPrice ?? slot.minimumBid;
  const marketing = formatMarketingEstimates({
    estimatedVisibility: slot.estimatedVisibility,
    estimatedClicks: slot.estimatedClicks,
    estimatedLeads: slot.estimatedLeads,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-gradient-to-br backdrop-blur-md transition-all duration-300",
        theme.gradient,
        theme.border,
        theme.ring,
        "ring-1",
        theme.glow,
        theme.hoverGlow,
        "[@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.01]",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:border-white/20",
        theme.isPremium ? "p-5 sm:p-6" : "p-4 sm:p-5"
      )}
    >
      {theme.isPremium && (
        <>
          <div className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-6 -start-6 h-24 w-24 rounded-full bg-yellow-500/15 blur-2xl" />
        </>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.07),transparent_55%)]" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm shadow-lg",
                  theme.iconBg
                )}
              >
                {theme.isPremium ? (
                  <Crown className="h-4 w-4 text-white" />
                ) : (
                  <span className="text-base leading-none">{theme.medal || `#${slot.position}`}</span>
                )}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={cn("text-base font-bold tracking-tight sm:text-lg", theme.accentText)}>
                    {t.boost.position.replace("{n}", String(slot.position))}
                    {theme.medal && (
                      <span className="ms-1.5 text-sm" aria-hidden>
                        {theme.medal}
                      </span>
                    )}
                  </h3>
                  {theme.isPremium && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.06 + 0.15, type: "spring", stiffness: 320 }}
                      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/30 to-orange-500/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-100 ring-1 ring-amber-300/40"
                    >
                      {t.boost.bestExposureBadge}
                    </motion.span>
                  )}
                </div>
                <p className="mt-0.5 text-sm font-medium text-white/90">{t.boost.featuredHomepage}</p>
                <p className="text-xs text-white/50">
                  {t.boost.placementSubtitle.replace(
                    "{days}",
                    String(HOMEPAGE_SPOTLIGHT_DURATION_DAYS)
                  )}
                </p>
              </div>

              {isOwn && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ms-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200 ring-1 ring-emerald-400/30"
                >
                  <Check className="h-3 w-3" />
                  {t.boost.yourListingBadge}
                </motion.span>
              )}
            </div>
          </div>

          {/* Bid info */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            <InfoCell label={t.boost.currentHolder}>
              <span className="truncate text-sm font-semibold text-white">
                {isEmpty ? t.boost.noCurrentHolder : (slot.holderTitle ?? t.boost.noCurrentHolder)}
              </span>
            </InfoCell>
            <InfoCell label={t.boost.currentBid}>
              <span className="text-sm font-semibold text-white">
                {formatPrice(displayBid, undefined, locale)}
              </span>
            </InfoCell>
            <InfoCell label={t.boost.minimumNextBid} highlight>
              <span className={cn("text-sm font-bold", theme.accentMuted)}>
                {formatPrice(slot.minimumBid, undefined, locale)}
              </span>
            </InfoCell>
            <InfoCell label={t.boost.remainingTime}>
              {slot.expiresAt && !isEmpty ? (
                <BoostCountdown expiresAt={slot.expiresAt} compact urgency />
              ) : (
                <span className="text-sm text-white/45">—</span>
              )}
            </InfoCell>
          </div>

          {/* Marketing estimates */}
          <div className="grid gap-2 sm:grid-cols-3">
            <EstimatePill
              icon={<Eye className="h-3.5 w-3.5" />}
              label={t.boost.estimatedVisibility}
              value={t.boost.impressionsFormat.replace("{count}", marketing.impressions)}
            />
            <EstimatePill
              icon={<MousePointerClick className="h-3.5 w-3.5" />}
              label={t.boost.estimatedClicks}
              value={t.boost.countFormat.replace("{count}", marketing.clicks)}
            />
            <EstimatePill
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label={t.boost.estimatedLeads}
              value={t.boost.countFormat.replace("{count}", marketing.leads)}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="flex shrink-0 items-end lg:ps-2">
          {isOwn ? (
            <div className="flex h-12 w-full min-w-[10rem] items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-200 lg:w-auto">
              <Check className="h-4 w-4 shrink-0" />
              <span className="text-center">{t.boost.youOwnPosition}</span>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={isDisabled}
              isLoading={isLoading}
              onClick={() => onBoost(slot.position)}
              className={cn(
                "h-12 w-full min-w-[10rem] border-0 text-white shadow-lg transition-all duration-200",
                "hover:-translate-y-0.5 active:translate-y-0",
                theme.isPremium
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30 hover:from-amber-400 hover:to-orange-500 hover:shadow-amber-500/40"
                  : "bg-gradient-to-r from-white/15 to-white/10 shadow-black/20 ring-1 ring-white/15 hover:from-white/20 hover:to-white/15 hover:shadow-black/30 lg:w-auto"
              )}
            >
              {!isLoading && <Zap className="h-4 w-4" />}
              {t.boost.takePosition}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function InfoCell({
  label,
  children,
  highlight = false,
}: {
  label: string;
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 transition-colors duration-200",
        highlight
          ? "border-amber-400/15 bg-amber-500/8"
          : "border-white/6 bg-black/20"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function EstimatePill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2.5">
      <span className="mt-0.5 text-white/40">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-white/40">{label}</p>
        <p className="truncate text-xs font-semibold text-white/85">{value}</p>
      </div>
    </div>
  );
}
