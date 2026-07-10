"use client";

import { motion } from "framer-motion";
import { Rocket, Sparkles } from "lucide-react";
import { AdminBoostHistoryTable } from "@/components/admin/boost/admin-boost-history-table";
import { AdminBoostStatsGrid } from "@/components/admin/boost/admin-boost-stats-grid";
import { AdminFeaturedListingsTable } from "@/components/admin/boost/admin-featured-listings-table";
import { BoostNavTabs } from "@/components/admin/boost/boost-shared";
import type { AdminBoostPageData } from "@/services/admin-boost.service";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminBoostManagerProps {
  data: AdminBoostPageData;
}

export function AdminBoostManager({ data }: AdminBoostManagerProps) {
  const { t } = useTranslation();

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
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/80">
              <Sparkles className="h-3.5 w-3.5" />
              Admin
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/30">
                <Rocket className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                  {t.admin.boost.title}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-surface-500 sm:text-lg">
                  {t.admin.boost.subtitle}
                </p>
              </div>
            </div>
          </div>

          <BoostNavTabs />
        </div>
      </motion.header>

      <section className="space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400">
          {t.admin.boost.statsSectionTitle}
        </h2>
        <AdminBoostStatsGrid stats={data.stats} />
      </section>

      <section className="space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400">
          {t.admin.boost.featuredSectionTitle}
        </h2>
        <AdminFeaturedListingsTable listings={data.featuredListings} />
      </section>

      <section className="space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400">
          {t.admin.boost.historySectionTitle}
        </h2>
        <AdminBoostHistoryTable history={data.history} />
      </section>
    </div>
  );
}
