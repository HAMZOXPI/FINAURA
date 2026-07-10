"use client";

import { motion } from "framer-motion";
import { Check, Minus, Sparkles } from "lucide-react";
import {
  buildPricingComparisonRows,
  type ComparisonCell,
  type PricingComparisonRow,
} from "@/lib/pricing/pricing-display";
import { cn, interpolate } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types/database";
import { useTranslation } from "@/i18n/locale-provider";

interface PricingComparisonTableProps {
  plans: SubscriptionPlan[];
  currentPlanSlug: string | null;
}

function ComparisonCellView({ cell }: { cell: ComparisonCell }) {
  const { t } = useTranslation();
  const compare = t.pricing.compare;

  if (cell.kind === "coming_soon") {
    return (
      <span className="inline-flex rounded-full bg-surface-100 px-2.5 py-1 text-xs font-semibold text-surface-400">
        {compare.comingSoon}
      </span>
    );
  }

  if (cell.kind === "text") {
    return <span className="text-sm font-semibold text-surface-800">{cell.value}</span>;
  }

  if (cell.kind === "included") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  }

  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-100 text-surface-400">
      <Minus className="h-3.5 w-3.5" />
    </span>
  );
}

function MobileComparisonCard({
  planName,
  rows,
  column,
  isCurrent,
}: {
  planName: string;
  rows: PricingComparisonRow[];
  column: "free" | "pro" | "enterprise";
  isCurrent: boolean;
}) {
  const { t } = useTranslation();
  const compare = t.pricing.compare;
  const rowLabels: Record<PricingComparisonRow["key"], string> = {
    listings: compare.listings,
    boostMarketplace: compare.boostMarketplace,
    favorites: compare.favorites,
    messages: compare.messages,
    prioritySupport: compare.prioritySupport,
    analytics: compare.analytics,
    verification: compare.verification,
    premiumBadge: compare.premiumBadge,
    api: compare.api,
    teamMembers: compare.teamMembers,
    customBranding: compare.customBranding,
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.04)]",
        isCurrent
          ? "border-emerald-200/80 ring-2 ring-emerald-400/30"
          : "border-surface-200/70"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-surface-900">{planName}</h3>
        {isCurrent && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            {compare.yourPlan}
          </span>
        )}
      </div>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between gap-3 rounded-lg px-1 py-0.5 transition-colors hover:bg-surface-50/80"
          >
            <span className="text-sm text-surface-500">{rowLabels[row.key]}</span>
            <ComparisonCellView cell={row[column]} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ColumnHeader({
  name,
  isCurrent,
  tone,
}: {
  name: string;
  isCurrent: boolean;
  tone: "free" | "pro" | "enterprise";
}) {
  const { t } = useTranslation();
  const compare = t.pricing.compare;

  const toneStyles = {
    free: "text-surface-900",
    pro: "text-brand-700",
    enterprise: "text-violet-700",
  };

  return (
    <th
      className={cn(
        "px-6 py-5 text-center text-sm font-bold",
        toneStyles[tone],
        isCurrent && "bg-emerald-50/80"
      )}
    >
      <div className="flex flex-col items-center gap-1">
        <span>{name}</span>
        {isCurrent && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            {compare.yourPlan}
          </span>
        )}
      </div>
    </th>
  );
}

export function PricingComparisonTable({
  plans,
  currentPlanSlug,
}: PricingComparisonTableProps) {
  const { t } = useTranslation();
  const compare = t.pricing.compare;

  const rows = buildPricingComparisonRows({
    plans,
    unlimitedLabel: t.pricing.unlimitedListings,
    upToListings: (count) => interpolate(t.pricing.upToListings, { count }),
    upToFavorites: (count) => interpolate(compare.upToFavorites, { count }),
  });

  const rowLabels: Record<PricingComparisonRow["key"], string> = {
    listings: compare.listings,
    boostMarketplace: compare.boostMarketplace,
    favorites: compare.favorites,
    messages: compare.messages,
    prioritySupport: compare.prioritySupport,
    analytics: compare.analytics,
    verification: compare.verification,
    premiumBadge: compare.premiumBadge,
    api: compare.api,
    teamMembers: compare.teamMembers,
    customBranding: compare.customBranding,
  };

  const planNames = {
    free: plans.find((p) => p.slug === "free")?.name ?? "Free",
    pro: plans.find((p) => p.slug === "pro")?.name ?? "Pro",
    enterprise: plans.find((p) => p.slug === "enterprise")?.name ?? "Enterprise",
  };

  const isCurrentColumn = {
    free: currentPlanSlug === "free",
    pro: currentPlanSlug === "pro",
    enterprise: currentPlanSlug === "enterprise",
  };

  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            {compare.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
            {compare.title}
          </h2>
          <p className="mt-3 text-surface-500">{compare.subtitle}</p>
        </motion.div>

        <div className="mt-8 space-y-4 sm:mt-10 lg:hidden">
          <MobileComparisonCard
            planName={planNames.free}
            rows={rows}
            column="free"
            isCurrent={isCurrentColumn.free}
          />
          <MobileComparisonCard
            planName={planNames.pro}
            rows={rows}
            column="pro"
            isCurrent={isCurrentColumn.pro}
          />
          <MobileComparisonCard
            planName={planNames.enterprise}
            rows={rows}
            column="enterprise"
            isCurrent={isCurrentColumn.enterprise}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 hidden overflow-hidden rounded-3xl border border-surface-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_16px_48px_rgba(0,0,0,0.06)] sm:mt-10 lg:block"
        >
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead className="sticky top-0 z-10 bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.05)] backdrop-blur-md">
                <tr className="border-b border-surface-100">
                  <th className="sticky start-0 z-20 bg-white/95 px-6 py-5 text-start text-sm font-semibold text-surface-500 backdrop-blur-md">
                    {compare.featureColumn}
                  </th>
                  <ColumnHeader
                    name={planNames.free}
                    isCurrent={isCurrentColumn.free}
                    tone="free"
                  />
                  <ColumnHeader
                    name={planNames.pro}
                    isCurrent={isCurrentColumn.pro}
                    tone="pro"
                  />
                  <ColumnHeader
                    name={planNames.enterprise}
                    isCurrent={isCurrentColumn.enterprise}
                    tone="enterprise"
                  />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.key}
                    className={cn(
                      "group border-b border-surface-100 transition-colors duration-200 hover:bg-brand-50/30",
                      index === rows.length - 1 && "border-0"
                    )}
                  >
                    <td className="sticky start-0 z-[1] bg-white px-6 py-4 text-sm font-medium text-surface-700 transition-colors group-hover:bg-brand-50/30">
                      {rowLabels[row.key]}
                    </td>
                    <td
                      className={cn(
                        "px-6 py-4 text-center transition-colors group-hover:bg-brand-50/20",
                        isCurrentColumn.free && "bg-emerald-50/40"
                      )}
                    >
                      <ComparisonCellView cell={row.free} />
                    </td>
                    <td
                      className={cn(
                        "px-6 py-4 text-center transition-colors group-hover:bg-brand-50/20",
                        isCurrentColumn.pro && "bg-emerald-50/40"
                      )}
                    >
                      <ComparisonCellView cell={row.pro} />
                    </td>
                    <td
                      className={cn(
                        "px-6 py-4 text-center transition-colors group-hover:bg-brand-50/20",
                        isCurrentColumn.enterprise && "bg-emerald-50/40"
                      )}
                    >
                      <ComparisonCellView cell={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
