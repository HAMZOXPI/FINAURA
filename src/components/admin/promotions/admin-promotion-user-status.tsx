"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Gift,
  Home,
  Layers,
  Sparkles,
  Wallet,
} from "lucide-react";
import { fetchUserPromotionStatus } from "@/actions/admin-promotion.actions";
import type { UserPromotionStatus } from "@/services/admin-promotion.service";
import {
  GiftStatusBadge,
  useGiftTypeLabel,
} from "@/components/admin/promotions/promotion-shared";
import {
  PlanBadge,
  PremiumCard,
  SellerBadge,
  UserAvatar,
  VerifiedBadge,
} from "@/components/admin/promotions/promotion-ui";
import { cn, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export function AdminPromotionUserStatus({ userId }: { userId: string | null }) {
  const { t, locale } = useTranslation();
  const giftTypeLabel = useGiftTypeLabel();
  const [status, setStatus] = useState<UserPromotionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setStatus(null);
      return;
    }

    setLoading(true);
    fetchUserPromotionStatus(userId).then((result) => {
      if ("status" in result && result.status) setStatus(result.status);
      else setStatus(null);
      setLoading(false);
    });
  }, [userId]);

  if (!userId) return null;

  if (loading) {
    return (
      <div
        className="animate-pulse rounded-2xl border border-surface-200/80 bg-surface-50/50 p-6"
        aria-busy="true"
        aria-label={t.admin.promotions.loadingUserStatus}
      >
        <div className="flex gap-4">
          <div className="h-16 w-16 rounded-full bg-surface-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-surface-200" />
            <div className="h-3 w-32 rounded bg-surface-100" />
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-surface-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!status) return null;

  const listingsRemaining =
    status.listingsMax == null ? "∞" : Math.max(0, status.listingsMax - status.listingsUsed);
  const isSeller = status.listingsUsed > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PremiumCard
        padding="md"
        className="border-brand-100/80 bg-gradient-to-br from-white via-white to-brand-50/30"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <UserAvatar
            name={status.user.full_name}
            email={status.user.email}
            avatarUrl={status.user.avatar_url}
            size="xl"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">
              {t.admin.promotions.userStatusTitle}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-surface-900">
                {status.user.full_name || status.user.email}
              </h3>
              <PlanBadge planSlug={status.planSlug} planName={status.planName} />
              {status.isPremium && (
                <VerifiedBadge label={t.admin.promotions.badgeVerified} />
              )}
              {isSeller && <SellerBadge label={t.admin.promotions.badgeSeller} />}
            </div>
            <p className="mt-1 text-sm text-surface-500">{status.user.email}</p>
            <p className="mt-2 text-xs text-surface-500">
              {t.admin.promotions.verificationStatus}:{" "}
              <span className={cn("font-medium", status.isPremium ? "text-emerald-600" : "text-surface-600")}>
                {status.isPremium ? t.admin.promotions.premiumActive : t.admin.promotions.premiumInactive}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ProfileStat
            icon={Crown}
            label={t.admin.promotions.currentPlan}
            value={status.planName}
            hint={
              status.isPremium
                ? t.admin.promotions.premiumActive
                : t.admin.promotions.premiumInactive
            }
            hintClass={status.isPremium ? "text-emerald-600" : "text-surface-500"}
          />
          <ProfileStat
            icon={Home}
            label={t.admin.promotions.activeListings}
            value={String(status.listingsUsed)}
            hint={t.admin.promotions.listingsUsage}
          />
          <ProfileStat
            icon={Wallet}
            label={t.admin.promotions.listingsRemaining}
            value={String(listingsRemaining)}
            hint={t.admin.promotions.remainingCreditsHint}
          />
          <ProfileStat
            icon={Gift}
            label={t.admin.promotions.activeGifts}
            value={String(status.activeGifts.length)}
            hint={
              status.premiumExpiresAt
                ? `${t.admin.promotions.expires}: ${formatDate(status.premiumExpiresAt, locale)}`
                : undefined
            }
          />
        </div>

        {status.activeGifts.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-surface-400">
              <Layers className="h-3.5 w-3.5" />
              {t.admin.promotions.currentGifts}
            </p>
            <ul className="space-y-2">
              {status.activeGifts.map((gift) => (
                <li
                  key={gift.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-surface-200/60 bg-white/90 px-4 py-3 text-sm shadow-sm"
                >
                  <span className="flex items-center gap-2 font-medium text-surface-900">
                    <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                    {giftTypeLabel(gift.gift_type)}
                  </span>
                  <GiftStatusBadge status={gift.effective_status} />
                  {gift.expires_at && (
                    <span className="w-full text-xs text-surface-500 sm:w-auto">
                      {t.admin.promotions.expires}: {formatDate(gift.expires_at, locale)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </PremiumCard>
    </motion.div>
  );
}

function ProfileStat({
  icon: Icon,
  label,
  value,
  hint,
  hintClass,
}: {
  icon: typeof Crown;
  label: string;
  value: string;
  hint?: string;
  hintClass?: string;
}) {
  return (
    <div className="rounded-xl border border-surface-200/60 bg-white/90 p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 text-surface-500">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold tracking-tight text-surface-900">{value}</p>
      {hint && <p className={cn("mt-1 text-xs", hintClass ?? "text-surface-500")}>{hint}</p>}
    </div>
  );
}
