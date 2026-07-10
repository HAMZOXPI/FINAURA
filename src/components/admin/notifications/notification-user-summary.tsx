"use client";

import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import type { UserPromotionStatus } from "@/services/admin-promotion.service";
import type { AdminNotificationRow } from "@/services/admin-notification.service";
import { UserAvatar } from "@/components/admin/promotions/promotion-ui";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface NotificationUserSummaryProps {
  notification: AdminNotificationRow;
  promotionStatus: UserPromotionStatus | null;
  loading?: boolean;
}

function MetricTile({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | null;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-surface-100 bg-surface-50/50 px-3 py-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-surface-900">
        {loading ? (
          <span className="inline-block h-6 w-8 animate-pulse rounded bg-surface-200" />
        ) : value === null ? (
          <span className="text-base text-surface-300">—</span>
        ) : (
          <AnimatedCounter value={value} />
        )}
      </p>
    </div>
  );
}

export function NotificationUserSummary({
  notification,
  promotionStatus,
  loading,
}: NotificationUserSummaryProps) {
  const { t } = useTranslation();
  const recipient = notification.recipient;

  const boostCount = promotionStatus
    ? promotionStatus.activeGifts.filter((gift) => gift.gift_type === "boost_credits").length
    : null;

  if (loading && !recipient) {
    return (
      <div className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm">
        <div className="flex animate-pulse items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-surface-100" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded bg-surface-100" />
            <div className="h-4 w-56 rounded bg-surface-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <UserAvatar
            name={recipient?.full_name}
            email={recipient?.email}
            avatarUrl={recipient?.avatar_url}
            size="lg"
          />
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-surface-900">
              {recipient?.full_name ?? "—"}
            </p>
            <p className="mt-0.5 truncate text-sm text-surface-500">{recipient?.email ?? "—"}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {loading ? (
                <span className="inline-block h-5 w-20 animate-pulse rounded-full bg-surface-100" />
              ) : promotionStatus?.isPremium ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/80">
                  <Star className="h-3 w-3" />
                  {promotionStatus.planName ?? t.admin.notifications.drawer.premiumBadge}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-semibold text-surface-500 ring-1 ring-surface-200/80">
                  {t.admin.notifications.drawer.freeBadge}
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                  "bg-surface-50 text-surface-400 ring-surface-200/80"
                )}
              >
                <ShieldCheck className="h-3 w-3" />
                {t.admin.notifications.drawer.verificationBadge}: —
              </span>
            </div>
          </div>
        </div>
        {recipient?.id && (
          <Link
            href={`/admin/users?q=${encodeURIComponent(recipient.email ?? recipient.id)}`}
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-surface-200 px-3 py-2 text-xs font-semibold text-surface-700 transition-colors hover:bg-surface-50"
          >
            {t.admin.notifications.drawer.openUser}
          </Link>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MetricTile
          label={t.admin.notifications.drawer.listingsCount}
          value={loading ? null : (promotionStatus?.listingsUsed ?? null)}
          loading={loading}
        />
        <MetricTile
          label={t.admin.notifications.drawer.boostCount}
          value={loading ? null : boostCount}
          loading={loading}
        />
      </div>
    </div>
  );
}
