"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Crown, Eye, Rocket, TrendingUp } from "lucide-react";
import type { ListingPerformanceRow } from "@/lib/dashboard/workspace-display";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardListingPerformanceProps {
  rows: ListingPerformanceRow[];
  isPremium: boolean;
}

function StatusChip({ label, tone }: { label: string; tone: "emerald" | "amber" | "surface" | "violet" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    amber: "bg-amber-50 text-amber-700 ring-amber-200/80",
    surface: "bg-surface-100 text-surface-600 ring-surface-200/80",
    violet: "bg-violet-50 text-violet-700 ring-violet-200/80",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
        tones[tone]
      )}
    >
      {label}
    </span>
  );
}

export function DashboardListingPerformance({
  rows,
  isPremium,
}: DashboardListingPerformanceProps) {
  const { t, locale } = useTranslation();
  const ws = t.dashboard.workspace;
  const analytics = ws.analytics;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-surface-900">
            {ws.performanceTitle}
          </h2>
          <p className="mt-1 text-sm text-surface-500">{ws.performanceSubtitle}</p>
        </div>
        <TrendingUp className="h-5 w-5 text-brand-600" />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-200 px-4 py-10 text-center">
          <p className="text-sm font-semibold text-surface-700">{ws.noListingYet}</p>
          <Link
            href="/dashboard/new"
            className="mt-2 inline-block text-sm font-semibold text-brand-600"
          >
            {t.dashboard.createFirst}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, index) => {
            const { property, activeBoost, positionLabel } = row;
            const thumbnail = property.images[0] || PLACEHOLDER_IMAGE;

            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -2 }}
                className="group rounded-2xl border border-surface-100 bg-gradient-to-br from-surface-50/80 to-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4"
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-100 ring-1 ring-surface-200/80 sm:h-24 sm:w-24">
                    <Image
                      src={thumbnail}
                      alt={property.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="96px"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/${property.id}/edit`}
                          className="line-clamp-1 text-base font-bold text-surface-900 hover:text-brand-600"
                        >
                          {property.title}
                        </Link>
                        <p className="mt-0.5 text-sm text-surface-500">
                          {property.city} · {formatPrice(property.price, undefined, locale)}
                        </p>
                      </div>
                      {positionLabel && (
                        <span className="inline-flex shrink-0 items-center rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
                          {ws.position} #{positionLabel}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <StatusChip
                        label={property.listing_status}
                        tone={
                          property.listing_status === "published" ? "emerald" : "surface"
                        }
                      />
                      {activeBoost && (
                        <StatusChip
                          label={analytics.boosted}
                          tone="amber"
                        />
                      )}
                      {property.is_featured && (
                        <StatusChip label={ws.featured} tone="amber" />
                      )}
                      {isPremium && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 ring-1 ring-violet-200/80">
                          <Crown className="h-2.5 w-2.5" />
                          {analytics.premiumBadge}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-surface-500">
                      <span>
                        {analytics.createdOn} {formatDate(property.created_at, locale)}
                      </span>
                      <span className="hidden h-1 w-1 rounded-full bg-surface-300 sm:inline-block" />
                      <span className="inline-flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        {property.images.length} {analytics.photos}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <StatusChip label={property.status.replace("_", " ")} tone="violet" />
                      {property.listing_status === "draft" && (
                        <StatusChip label={ws.drafts} tone="surface" />
                      )}
                      {activeBoost && (
                        <StatusChip label={activeBoost.productName} tone="amber" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-surface-100 pt-3">
                  <Link
                    href={`/dashboard/${property.id}/edit`}
                    className="inline-flex items-center gap-1 rounded-lg border border-surface-200 px-2.5 py-1.5 text-xs font-semibold text-surface-700 hover:bg-surface-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {ws.manageListing}
                  </Link>
                  {!activeBoost && property.listing_status === "published" && (
                    <Link
                      href="/dashboard/boost"
                      className="inline-flex items-center gap-1 rounded-lg border border-surface-200 px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50"
                    >
                      <Rocket className="h-3.5 w-3.5" />
                      {ws.boostListing}
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
