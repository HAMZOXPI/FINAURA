"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AdminBoostHistoryRow } from "@/services/admin-boost.service";
import type { AdminActivityItem } from "@/services/admin.service";
import {
  buildActivityFeed,
  filterActivityFeed,
  type ActivityCenterTab,
} from "@/lib/admin/activity-center";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { AdminActivityEmptyState } from "@/components/admin/dashboard/admin-activity-empty";
import { AdminActivityTimeline } from "@/components/admin/dashboard/admin-activity-timeline";

const TABS: ActivityCenterTab[] = [
  "all",
  "payments",
  "boosts",
  "listings",
  "reports",
  "messages",
];

interface AdminActivityCenterProps {
  activity: AdminActivityItem[];
  boostHistory: AdminBoostHistoryRow[];
}

export function AdminActivityCenter({ activity, boostHistory }: AdminActivityCenterProps) {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActivityCenterTab>("all");

  const tabLabels: Record<ActivityCenterTab, string> = {
    all: t.admin.activity.tabAll,
    payments: t.admin.activity.tabPayments,
    boosts: t.admin.activity.tabBoosts,
    listings: t.admin.activity.tabListings,
    reports: t.admin.activity.tabReports,
    messages: t.admin.activity.tabMessages,
  };

  const feed = useMemo(
    () =>
      buildActivityFeed(activity, boostHistory, {
        userTitle: t.admin.activity.eventNewUser,
        userDescription: t.admin.activity.eventNewUserDescription,
        listingTitle: t.admin.activity.eventListingPublished,
        listingDescription: (title) => title,
        verificationTitle: (name) =>
          t.admin.activity.eventVerification.replace("{name}", name),
        verificationDescription: (status) =>
          t.admin.activity.eventVerificationStatus.replace("{status}", status),
        messageTitle: (name) => t.admin.activity.eventMessage.replace("{name}", name),
        messageDescription: t.admin.activity.eventMessageDescription,
        paymentTitle: t.admin.activity.eventPaymentReceived,
        paymentDescription: (amount) => amount,
        boostTitle: (action) => t.admin.activity.eventBoost.replace("{action}", action),
        boostDescription: (listing) => listing,
        boostActionLabels: {
          created: t.admin.boost.actionCreated,
          activated: t.admin.boost.actionActivated,
          outbid: t.admin.boost.actionOutbid,
          position_changed: t.admin.boost.actionPositionChanged,
          expired: t.admin.boost.actionExpired,
          removed: t.admin.boost.actionRemoved,
          cancelled: t.admin.boost.actionCancelled,
          extended: t.admin.boost.actionExtended,
          disabled: t.admin.boost.actionDisabled,
        },
        formatAmount: (amount) => formatPrice(amount, undefined, locale),
      }),
    [activity, boostHistory, t, locale]
  );

  const filteredItems = useMemo(
    () => filterActivityFeed(feed, activeTab).slice(0, 25),
    [feed, activeTab]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.68 }}
      className="overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"
    >
      <div className="border-b border-surface-100 px-5 py-5 sm:px-6">
        <h2 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
          {t.admin.activity.title}
        </h2>
        <p className="mt-1 text-sm text-surface-500">{t.admin.activity.subtitle}</p>

        <div className="mt-4 -mx-1 overflow-x-auto pb-1">
          <div className="inline-flex min-w-full gap-1 rounded-xl border border-surface-200/80 bg-surface-50/80 p-1 sm:min-w-0">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
                  activeTab === tab
                    ? "text-surface-900"
                    : "text-surface-500 hover:text-surface-800"
                )}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="activity-tab-indicator"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-surface-200/80"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tabLabels[tab]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <AnimatePresence mode="wait">
          {filteredItems.length === 0 ? (
            <motion.div
              key={`empty-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AdminActivityEmptyState
                tabLabel={activeTab === "all" ? undefined : tabLabels[activeTab]}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <AdminActivityTimeline items={filteredItems} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
