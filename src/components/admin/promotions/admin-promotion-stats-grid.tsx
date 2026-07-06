"use client";

import { Gift, Infinity, Star, Timer, XCircle } from "lucide-react";
import type { AdminGiftRow, AdminPromotionStats } from "@/services/admin-promotion.service";
import { StatCard } from "@/components/admin/promotions/promotion-ui";
import { countExpiringSoon } from "@/components/admin/promotions/promotion-shared";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminPromotionStatsGridProps {
  stats: AdminPromotionStats;
  activeRows?: AdminGiftRow[];
}

export function AdminPromotionStatsGrid({ stats, activeRows = [] }: AdminPromotionStatsGridProps) {
  const { t } = useTranslation();
  const expiringSoon = countExpiringSoon(activeRows);

  const cards = [
    {
      label: t.admin.promotions.statTotal,
      value: stats.totalGranted,
      icon: Gift,
      iconClass: "text-brand-600 bg-white/80",
      accent: "from-brand-500/8 to-brand-600/12",
      trend:
        stats.grantedToday > 0
          ? { label: `+${stats.grantedToday} ${t.admin.promotions.statToday.toLowerCase()}`, positive: true }
          : stats.grantedThisMonth > 0
            ? {
                label: `${stats.grantedThisMonth} ${t.admin.promotions.statMonth.toLowerCase()}`,
                positive: true,
              }
            : undefined,
    },
    {
      label: t.admin.promotions.statActive,
      value: stats.activePromotions,
      icon: Star,
      iconClass: "text-emerald-600 bg-white/80",
      accent: "from-emerald-500/8 to-emerald-600/12",
      trend: expiringSoon > 0 ? { label: `${expiringSoon} ${t.admin.promotions.statExpiringSoon.toLowerCase()}`, positive: false } : undefined,
    },
    {
      label: t.admin.promotions.statExpiringSoon,
      value: expiringSoon,
      icon: Timer,
      iconClass: "text-amber-600 bg-white/80",
      accent: "from-amber-500/8 to-amber-600/12",
      trend: expiringSoon > 0 ? { label: t.admin.promotions.expiringSoonHint, positive: false } : undefined,
    },
    {
      label: t.admin.promotions.statExpired,
      value: stats.expiredPromotions,
      icon: XCircle,
      iconClass: "text-surface-600 bg-white/80",
      accent: "from-surface-500/5 to-surface-600/8",
    },
    {
      label: t.admin.promotions.statPremium,
      value: stats.premiumGifts,
      icon: Star,
      iconClass: "text-violet-600 bg-white/80",
      accent: "from-violet-500/8 to-violet-600/12",
    },
    {
      label: t.admin.promotions.statUnlimited,
      value: stats.unlimitedUsers,
      icon: Infinity,
      iconClass: "text-indigo-600 bg-white/80",
      accent: "from-indigo-500/8 to-indigo-600/12",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          iconClass={card.iconClass}
          accent={card.accent}
          trend={card.trend}
          delay={index * 0.04}
        />
      ))}
    </div>
  );
}
