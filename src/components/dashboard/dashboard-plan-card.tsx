"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchDashboardPlanState } from "@/actions/dashboard.actions";
import { Button } from "@/components/ui/button";
import { CELEBRATION_EVENT } from "@/lib/gifts/celebration-config";
import { NOTIFICATIONS_SYNC_EVENT } from "@/lib/notifications/client-sync";
import { interpolate } from "@/lib/utils";
import type { EffectiveUserPlan } from "@/services/subscription.service";
import { useTranslation } from "@/i18n/locale-provider";

const GIFT_BANNER_UPDATE_EVENT = "finaura-gift-banner-update";
const REFRESH_DELAY_MS = 350;

interface DashboardPlanCardProps {
  initialPlan: EffectiveUserPlan;
}

export function DashboardPlanCard({ initialPlan }: DashboardPlanCardProps) {
  const { t } = useTranslation();
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

  return (
    <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-800">
            {t.dashboard.currentPlan}: <span className="font-bold">{displayName}</span>
          </p>
          {listingLimit.max !== null && (
            <p className="text-sm text-brand-700">
              {interpolate(t.dashboard.listingsUsed, {
                current: listingLimit.current,
                max: listingLimit.max,
              })}
            </p>
          )}
          {listingLimit.max === null && (
            <p className="text-sm text-brand-700">{t.dashboard.unlimitedListings}</p>
          )}
        </div>
        {!listingLimit.allowed && (
          <Button href="/pricing" size="sm" variant="outline">
            {t.dashboard.upgradePlan}
          </Button>
        )}
      </div>
    </div>
  );
}
