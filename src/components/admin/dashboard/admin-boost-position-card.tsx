"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Eye, UserRound } from "lucide-react";
import type { AdminBoostMonitorSlot } from "@/lib/admin/boost-monitor-display";
import { getAdminMonitorTheme } from "@/lib/admin/boost-monitor-display";
import { calculatePositionEstimates } from "@/lib/boost/estimates";
import { formatMarketingEstimates } from "@/lib/boost/marketplace-display";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { BoostCountdown } from "@/components/boost/boost-countdown";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminBoostPositionCardProps {
  slot: AdminBoostMonitorSlot;
  index: number;
}

export function AdminBoostPositionCard({ slot, index }: AdminBoostPositionCardProps) {
  const { t, locale } = useTranslation();
  const theme = getAdminMonitorTheme(slot.position);
  const listing = slot.listing;
  const isEmpty = !listing;

  const estimates = calculatePositionEstimates(slot.position);
  const marketing = formatMarketingEstimates(estimates);
  const PositionIcon = theme.Icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.72 + index * 0.06, duration: 0.38, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-gradient-to-br ring-1 transition-all duration-300",
        theme.gradient,
        theme.border,
        theme.ring,
        theme.glow,
        theme.hoverGlow
      )}
    >
      {slot.position === 1 && (
        <div className="pointer-events-none absolute -end-6 -top-6 h-28 w-28 rounded-full bg-amber-300/20 blur-3xl" />
      )}

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm",
              theme.badgeBg,
              theme.badgeText
            )}
          >
            {PositionIcon ? (
              <PositionIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
            ) : theme.medal ? (
              <span aria-hidden>{theme.medal}</span>
            ) : null}
            {t.admin.boostMonitor.positionLabel.replace("{n}", String(slot.position))}
          </span>

          {isEmpty ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
              {t.admin.boostMonitor.availableBadge}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
              {t.admin.boostMonitor.activeBadge}
            </span>
          )}
        </div>

        {isEmpty ? (
          <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-emerald-200/80 bg-emerald-50/40 px-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-emerald-200/60">
              <Building2 className="h-6 w-6 text-emerald-600" strokeWidth={1.75} />
            </div>
            <p className="mt-4 text-sm font-semibold text-surface-900">
              {t.admin.boostMonitor.emptyTitle}
            </p>
            <p className="mt-1 text-xs text-emerald-700">{t.admin.boostMonitor.emptyCta}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-100 ring-1 ring-surface-200/80 shadow-sm">
                <Image
                  src={PLACEHOLDER_IMAGE}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/properties/${listing.listingId}`}
                  className="line-clamp-2 text-base font-bold tracking-tight text-surface-900 transition-colors hover:text-brand-700"
                >
                  {listing.listingTitle}
                </Link>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-surface-500">
                  <UserRound className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{listing.ownerEmail}</span>
                </p>
                <p className="mt-2 text-lg font-bold tabular-nums text-surface-900">
                  {formatPrice(listing.amount, undefined, locale)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MetricBlock
                label={t.admin.boostMonitor.remainingLabel}
                value={
                  listing.expiresAt ? (
                    <BoostCountdown
                      expiresAt={listing.expiresAt}
                      compact
                      variant="light"
                      urgency
                    />
                  ) : (
                    "—"
                  )
                }
              />
              <MetricBlock
                label={t.admin.boostMonitor.visibilityLabel}
                value={
                  <span className={cn("inline-flex items-center gap-1", theme.accent)}>
                    <Eye className="h-3.5 w-3.5" />
                    {marketing.impressions}
                  </span>
                }
              />
              <MetricBlock
                label={t.admin.boostMonitor.expiresLabel}
                value={
                  listing.expiresAt
                    ? formatDate(listing.expiresAt, locale)
                    : "—"
                }
              />
              <MetricBlock
                label={t.admin.boostMonitor.productLabel}
                value={listing.productName}
              />
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function MetricBlock({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-400">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-surface-800">{value}</div>
    </div>
  );
}
