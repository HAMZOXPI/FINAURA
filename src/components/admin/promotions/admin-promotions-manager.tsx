"use client";

import { motion } from "framer-motion";
import { Gift, Sparkles } from "lucide-react";
import { AdminActivePromotionsTable } from "@/components/admin/promotions/admin-active-promotions-table";
import { AdminGrantGiftForm } from "@/components/admin/promotions/admin-grant-gift-form";
import { AdminPromotionStatsGrid } from "@/components/admin/promotions/admin-promotion-stats-grid";
import { PromotionNavTabs } from "@/components/admin/promotions/promotion-shared";
import type { AdminGiftListResult, AdminPromotionStats } from "@/services/admin-promotion.service";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminPromotionsManagerProps {
  stats: AdminPromotionStats;
  activeList: AdminGiftListResult;
}

export function AdminPromotionsManager({ stats, activeList }: AdminPromotionsManagerProps) {
  const { t } = useTranslation();

  const chips = [
    { label: t.admin.promotions.statActive, value: stats.activePromotions },
    { label: t.admin.promotions.statToday, value: stats.grantedToday },
    { label: t.admin.promotions.statMonth, value: stats.grantedThisMonth },
  ];

  return (
    <div className="space-y-12 pb-24 lg:pb-12">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200/80">
              <Sparkles className="h-3.5 w-3.5" />
              Admin
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg shadow-brand-500/30">
                <Gift className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                  {t.admin.promotions.title}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-surface-500 sm:text-lg">
                  {t.admin.promotions.subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-2 rounded-full border border-surface-200/80 bg-white px-3.5 py-1.5 text-xs font-medium text-surface-700 shadow-sm"
                >
                  <span className="font-bold tabular-nums text-surface-900">{chip.value}</span>
                  {chip.label}
                </span>
              ))}
            </div>
          </div>

          <PromotionNavTabs />
        </div>
      </motion.header>

      <section className="space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400">
          {t.admin.promotions.statsSectionTitle}
        </h2>
        <AdminPromotionStatsGrid stats={stats} activeRows={activeList.rows} />
      </section>

      <section>
        <AdminGrantGiftForm />
      </section>

      <section>
        <AdminActivePromotionsTable list={activeList} />
      </section>
    </div>
  );
}
