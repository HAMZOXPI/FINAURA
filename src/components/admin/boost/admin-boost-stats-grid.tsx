"use client";

import { Banknote, CalendarClock, Package, Rocket, Timer } from "lucide-react";
import type { AdminBoostStats } from "@/services/admin-boost.service";
import { StatCard } from "@/components/admin/promotions/promotion-ui";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminBoostStatsGridProps {
  stats: AdminBoostStats;
}

export function AdminBoostStatsGrid({ stats }: AdminBoostStatsGridProps) {
  const { t } = useTranslation();

  const cards = [
    {
      label: t.admin.boost.statTotalRevenue,
      value: stats.totalRevenue,
      icon: Banknote,
      iconClass: "text-emerald-600 bg-white/80",
      accent: "from-emerald-500/8 to-emerald-600/12",
    },
    {
      label: t.admin.boost.statTodayRevenue,
      value: stats.todayRevenue,
      icon: CalendarClock,
      iconClass: "text-brand-600 bg-white/80",
      accent: "from-brand-500/8 to-brand-600/12",
      trend:
        stats.todayRevenue > 0
          ? { label: t.admin.boost.todayTrend, positive: true }
          : undefined,
    },
    {
      label: t.admin.boost.statActiveBoosts,
      value: stats.activeBoosts,
      icon: Rocket,
      iconClass: "text-amber-600 bg-white/80",
      accent: "from-amber-500/8 to-amber-600/12",
    },
    {
      label: t.admin.boost.statExpiredBoosts,
      value: stats.expiredBoosts,
      icon: Timer,
      iconClass: "text-surface-600 bg-white/80",
      accent: "from-surface-500/5 to-surface-600/8",
    },
    {
      label: t.admin.boost.statBoostProducts,
      value: stats.boostProducts,
      icon: Package,
      iconClass: "text-violet-600 bg-white/80",
      accent: "from-violet-500/8 to-violet-600/12",
      trend: {
        label: `${stats.activeProducts} ${t.admin.boost.activeProductsLabel}`,
        positive: true,
      },
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
