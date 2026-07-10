"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Rocket, Sparkles } from "lucide-react";
import { fetchDashboardPlanState } from "@/actions/dashboard.actions";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import { Button } from "@/components/ui/button";
import { CELEBRATION_EVENT } from "@/lib/gifts/celebration-config";
import { NOTIFICATIONS_SYNC_EVENT } from "@/lib/notifications/client-sync";
import { getListingsRemaining, isPremiumPlan } from "@/lib/dashboard/workspace-display";
import { interpolate } from "@/lib/utils";
import type { EffectiveUserPlan } from "@/services/subscription.service";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const GIFT_BANNER_UPDATE_EVENT = "finaura-gift-banner-update";
const REFRESH_DELAY_MS = 350;

interface DashboardAccountSummaryProps {
  initialPlan: EffectiveUserPlan;
  planSlug: string | null;
  expiresAt: string | null;
  boostCredits: number;
}

export function DashboardAccountSummary({
  initialPlan,
  planSlug,
  expiresAt,
  boostCredits,
}: DashboardAccountSummaryProps) {
  const { t, locale } = useTranslation();
  const ws = t.dashboard.workspace;
  const [planState, setPlanState] = useState(initialPlan);

  const refreshPlan = useCallback(async () => {
    const next = await fetchDashboardPlanState();
    if (next) setPlanState(next);
  }, []);

  useEffect(() => {
    setPlanState(initialPlan);
  }, [initialPlan]);

  useEffect(() => {
    let timer: number | null = null;

    const scheduleRefresh = () => {
      if (timer != null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = null;
        void refreshPlan();
      }, REFRESH_DELAY_MS);
    };

    const onNotificationsSync = (event: Event) => {
      const custom = event as CustomEvent<{ inserted?: Array<{ notification_type?: string }> }>;
      const inserted = custom.detail?.inserted ?? [];
      const hasCelebration = inserted.some((row) =>
        ["gift_granted", "premium_activated", "subscription_changed", "subscription_renewed"].includes(
          row.notification_type ?? ""
        )
      );
      if (hasCelebration) scheduleRefresh();
    };

    window.addEventListener(GIFT_BANNER_UPDATE_EVENT, scheduleRefresh);
    window.addEventListener(CELEBRATION_EVENT, scheduleRefresh);
    window.addEventListener(NOTIFICATIONS_SYNC_EVENT, onNotificationsSync);

    return () => {
      if (timer != null) window.clearTimeout(timer);
      window.removeEventListener(GIFT_BANNER_UPDATE_EVENT, scheduleRefresh);
      window.removeEventListener(CELEBRATION_EVENT, scheduleRefresh);
      window.removeEventListener(NOTIFICATIONS_SYNC_EVENT, onNotificationsSync);
    };
  }, [refreshPlan]);

  const { displayName, listingLimit } = planState;
  const remaining = getListingsRemaining(listingLimit.current, listingLimit.max);
  const premium = isPremiumPlan(planSlug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.35 }}
      className="relative overflow-hidden rounded-3xl border border-brand-200/60 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-6 text-white shadow-[0_8px_40px_rgba(79,70,229,0.25)] sm:p-7"
    >
      <div className="pointer-events-none absolute -end-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 start-8 h-36 w-36 rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
              {premium ? <Crown className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {ws.currentPlan}
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">{displayName}</span>
          </div>

          {expiresAt && (
            <p className="text-sm text-white/80">
              {ws.expiresOn}: {formatDate(expiresAt, locale)}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">
                {ws.listingsUsed}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {listingLimit.max !== null ? (
                  <>
                    <AnimatedCounter value={listingLimit.current} />
                    <span className="text-lg font-semibold text-white/70">
                      {" "}
                      / {listingLimit.max}
                    </span>
                  </>
                ) : (
                  <>
                    <AnimatedCounter value={listingLimit.current} />
                    <span className="ms-2 text-sm font-medium text-white/70">
                      {t.dashboard.unlimitedListings}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">
                {ws.listingsRemaining}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {remaining !== null ? (
                  <AnimatedCounter value={remaining} />
                ) : (
                  <span className="text-base">∞</span>
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">
                {ws.boostCredits}
              </p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold">
                <Rocket className="h-5 w-5 text-amber-300" />
                {boostCredits > 0 ? <AnimatedCounter value={boostCredits} /> : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
          {!listingLimit.allowed && (
            <Button
              href="/pricing"
              className="bg-white text-brand-700 hover:bg-white/90"
            >
              {t.dashboard.upgradePlan}
            </Button>
          )}
          {listingLimit.allowed && !premium && (
            <Button
              href="/pricing"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              {ws.quickUpgrade}
            </Button>
          )}
        </div>
      </div>

      {listingLimit.max !== null && (
        <p className="relative mt-4 text-xs text-white/70">
          {interpolate(t.dashboard.listingsUsed, {
            current: listingLimit.current,
            max: listingLimit.max,
          })}
        </p>
      )}
    </motion.div>
  );
}
