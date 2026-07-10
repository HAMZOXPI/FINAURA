"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Crown,
  Eye,
  LayoutGrid,
  Rocket,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import type { BoostCenterData } from "@/types/boost";
import {
  isListingBoostActive,
  resolveListingBoostState,
  type ListingBoostDisplayState,
  type ListingPromoteVariant,
} from "@/lib/dashboard/listing-promote";
import { BoostCheckoutModal } from "@/components/boost/boost-checkout-modal";
import { BoostMarketplaceModal } from "@/components/boost/boost-marketplace-modal";
import { BoostCountdown } from "@/components/boost/boost-countdown";
import { useBoostCheckout } from "@/hooks/use-boost-checkout";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface ListingPromoteCardProps {
  listingId: string;
  listingTitle: string;
  boostData?: BoostCenterData | null;
  variant?: ListingPromoteVariant;
  autoOpenCheckoutPosition?: number;
  className?: string;
}

const BENEFIT_ICONS = [LayoutGrid, Eye, Search] as const;

export function ListingPromoteCard({
  listingId,
  listingTitle,
  boostData = null,
  variant = "boost",
  autoOpenCheckoutPosition,
  className,
}: ListingPromoteCardProps) {
  const promoteVariant = variant;
  void promoteVariant;
  const { t, locale } = useTranslation();
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const autoOpenedRef = useRef(false);

  const boostState = resolveListingBoostState(listingId, boostData);
  const isActive = isListingBoostActive(boostState);
  const campaign = boostState.campaign;

  const {
    checkout,
    error: checkoutError,
    isPaying,
    openCheckout,
    closeCheckout,
    confirmPayment,
    clearError,
  } = useBoostCheckout();

  useEffect(() => {
    if (!autoOpenCheckoutPosition || autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    clearError();
    openCheckout(listingId, autoOpenCheckoutPosition);
  }, [autoOpenCheckoutPosition, listingId, openCheckout, clearError]);

  const benefits = [
    t.dashboard.promoteBenefitHomepage,
    t.dashboard.promoteBenefitViews,
    t.dashboard.promoteBenefitSearch,
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "group/promote relative overflow-hidden rounded-2xl border border-amber-200/60",
          "bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40",
          "shadow-[0_4px_24px_rgba(251,191,36,0.1)]",
          "transition-all duration-[250ms]",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:border-amber-300/70",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_12px_40px_rgba(251,191,36,0.18)]",
          className
        )}
      >
        <div className="pointer-events-none absolute -end-6 -top-6 h-24 w-24 rounded-full bg-amber-400/15 blur-2xl transition-opacity duration-[250ms] [@media(hover:hover)_and_(pointer:fine)]:group-hover/promote:opacity-100" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        <div className="relative p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-bold tracking-tight text-surface-900">
                {t.dashboard.promoteTitle}
              </h4>
              <p className="mt-1 text-sm leading-snug text-surface-600">
                {isActive
                  ? t.dashboard.promoteSubtitleActive
                  : t.dashboard.promoteSubtitle}
              </p>
            </div>
          </div>

          <BoostStatusPill state={boostState} className="mt-4" />

          {isActive && campaign && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <MetricChip
                label={t.dashboard.promoteCurrentPosition}
                value={
                  campaign.position === 1
                    ? t.dashboard.promoteHomepagePositionOne
                    : t.boost.position.replace("{n}", String(campaign.position))
                }
                highlight={campaign.position === 1}
              />
              <MetricChip
                label={t.dashboard.promoteCurrentBid}
                value={formatPrice(campaign.amount, undefined, locale)}
              />
              <MetricChip
                label={t.dashboard.promoteRemainingTime}
                value={
                  campaign.expiresAt ? (
                    <BoostCountdown
                      expiresAt={campaign.expiresAt}
                      compact
                      variant="light"
                      urgency
                    />
                  ) : (
                    "—"
                  )
                }
                className="col-span-2 sm:col-span-1"
              />
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {isActive && campaign ? (
              <>
                <Button
                  href="/dashboard/boost"
                  className="h-11 flex-1 bg-gradient-to-r from-amber-600 to-orange-600 shadow-md shadow-amber-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-amber-500 hover:to-orange-500 hover:shadow-lg hover:shadow-amber-500/30"
                >
                  <Crown className="h-4 w-4" />
                  {t.dashboard.promoteManageBoost}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 border-amber-200/80 bg-white/80 text-amber-900 hover:border-amber-300 hover:bg-amber-50"
                  onClick={() => setMarketplaceOpen(true)}
                >
                  <Zap className="h-4 w-4" />
                  {t.dashboard.promoteBoostAgain}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                className="h-12 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-base font-semibold shadow-lg shadow-amber-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-amber-400 hover:via-orange-500 hover:to-amber-500 hover:shadow-xl hover:shadow-amber-500/35"
                onClick={() => setMarketplaceOpen(true)}
              >
                <Sparkles className="h-4 w-4" />
                {t.dashboard.promoteBoostNow}
              </Button>
            )}
          </div>

          {!isActive && (
            <ul className="mt-4 space-y-2 border-t border-amber-100/80 pt-4">
              {benefits.map((benefit, index) => {
                const Icon = BENEFIT_ICONS[index] ?? Check;
                return (
                  <li
                    key={benefit}
                    className="flex items-center gap-2.5 text-sm text-surface-600"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {benefit}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>

      <BoostMarketplaceModal
        open={marketplaceOpen}
        listingId={listingId}
        listingTitle={listingTitle}
        onClose={() => setMarketplaceOpen(false)}
      />

      <BoostCheckoutModal
        open={Boolean(checkout)}
        checkout={checkout}
        isPaying={isPaying}
        error={checkoutError}
        onClose={closeCheckout}
        onConfirmPayment={confirmPayment}
      />
    </>
  );
}

function BoostStatusPill({
  state,
  className,
}: {
  state: ListingBoostDisplayState;
  className?: string;
}) {
  const { t } = useTranslation();
  const campaign = state.campaign;

  const config = (() => {
    switch (state.status) {
      case "active":
        if (campaign?.position === 1) {
          return {
            dot: "bg-amber-500",
            bg: "bg-amber-100/80 text-amber-900 ring-amber-200/80",
            icon: <Crown className="h-3.5 w-3.5 text-amber-700" />,
            label: t.dashboard.promoteStatusHomepageOne,
          };
        }
        return {
          dot: "bg-yellow-500",
          bg: "bg-yellow-50 text-yellow-900 ring-yellow-200/80",
          icon: null,
          label: t.dashboard.promoteStatusFeatured.replace(
            "{n}",
            String(campaign?.position ?? "—")
          ),
        };
      case "processing":
        return {
          dot: "bg-sky-500 animate-pulse",
          bg: "bg-sky-50 text-sky-800 ring-sky-200/80",
          icon: null,
          label: t.dashboard.promoteStatusProcessing,
        };
      case "upcoming":
        return {
          dot: "bg-violet-500",
          bg: "bg-violet-50 text-violet-800 ring-violet-200/80",
          icon: null,
          label: t.dashboard.promoteStatusUpcoming,
        };
      case "expired":
        return {
          dot: "bg-red-500",
          bg: "bg-red-50 text-red-800 ring-red-200/80",
          icon: null,
          label: t.dashboard.promoteStatusExpired,
        };
      default:
        return {
          dot: "bg-emerald-500",
          bg: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
          icon: null,
          label: t.dashboard.promoteStatusNone,
        };
    }
  })();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1",
        config.bg,
        className
      )}
    >
      <span className={cn("h-2 w-2 shrink-0 rounded-full", config.dot)} />
      {config.icon}
      <span>{config.label}</span>
      {state.status === "active" && campaign?.expiresAt && (
        <span className="ms-1 border-s border-current/20 ps-2 text-[11px] font-medium opacity-80">
          <BoostCountdown
            expiresAt={campaign.expiresAt}
            compact
            variant="light"
            urgency
          />
        </span>
      )}
    </div>
  );
}

function MetricChip({
  label,
  value,
  highlight = false,
  className,
}: {
  label: string;
  value: ReactNode;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5",
        highlight
          ? "border-amber-200/80 bg-amber-50/60"
          : "border-surface-200/80 bg-white/70",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">
        {label}
      </p>
      <div
        className={cn(
          "mt-1 text-sm font-semibold",
          highlight ? "text-amber-900" : "text-surface-800"
        )}
      >
        {value}
      </div>
    </div>
  );
}

// Re-export for dashboard page layout
export function useDashboardBoostData() {
  const [data, setData] = useState<BoostCenterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const { fetchBoostCenterData } = await import("@/actions/boost.actions");
        const result = await fetchBoostCenterData();
        if (mounted) setData(result);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading };
}
