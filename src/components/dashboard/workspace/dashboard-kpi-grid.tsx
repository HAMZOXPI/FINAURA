"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Eye,
  Heart,
  Home,
  MessageSquare,
  Rocket,
  ShieldCheck,
  FileText,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import type { SellerVerificationStatus } from "@/services/verification.service";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardKpiGridProps {
  listingsCount: number;
  publishedCount: number;
  draftsCount: number;
  messagesCount: number;
  favoritesCount: number;
  activeBoosts: number;
  verificationStatus: SellerVerificationStatus;
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  href,
  delay,
  comingSoon,
}: {
  label: string;
  value: number | null;
  icon: LucideIcon;
  accent: string;
  href?: string;
  delay: number;
  comingSoon?: boolean;
}) {
  const { t } = useTranslation();
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className={cn(
        "rounded-2xl border border-surface-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)]",
        href && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-surface-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-surface-900">
            {comingSoon ? (
              <span className="text-sm font-semibold text-surface-400">
                {t.dashboard.workspace.comingSoon}
              </span>
            ) : value !== null ? (
              <AnimatedCounter value={value} />
            ) : (
              "—"
            )}
          </p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/[0.04]",
            accent
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );

  if (href && !comingSoon) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function DashboardKpiGrid({
  listingsCount,
  publishedCount,
  draftsCount,
  messagesCount,
  favoritesCount,
  activeBoosts,
  verificationStatus,
}: DashboardKpiGridProps) {
  const { t } = useTranslation();
  const ws = t.dashboard.workspace;

  const verificationLabels: Record<SellerVerificationStatus, string> = {
    verified: t.dashboard.verificationVerified,
    pending: t.dashboard.verificationPending,
    rejected: t.dashboard.verificationRejected,
    not_verified: t.dashboard.verificationNotVerified,
  };

  const cards = [
    {
      key: "listings",
      label: t.dashboard.myListings,
      value: listingsCount,
      icon: Home,
      accent: "bg-brand-50 text-brand-600",
      href: "/dashboard/properties",
    },
    {
      key: "published",
      label: t.dashboard.published,
      value: publishedCount,
      icon: Eye,
      accent: "bg-emerald-50 text-emerald-600",
      href: "/dashboard/properties",
    },
    {
      key: "drafts",
      label: ws.drafts,
      value: draftsCount,
      icon: FileText,
      accent: "bg-surface-100 text-surface-600",
      href: "/dashboard/properties",
    },
    {
      key: "messages",
      label: t.dashboard.messages,
      value: messagesCount,
      icon: MessageSquare,
      accent: "bg-violet-50 text-violet-600",
      href: "/dashboard/messages",
    },
    {
      key: "favorites",
      label: t.dashboard.favorites,
      value: favoritesCount,
      icon: Heart,
      accent: "bg-red-50 text-red-500",
      href: "/dashboard/favorites",
    },
    {
      key: "views",
      label: ws.profileViews,
      value: null,
      icon: BarChart3,
      accent: "bg-sky-50 text-sky-600",
      comingSoon: true,
    },
    {
      key: "boosts",
      label: ws.boostCampaigns,
      value: activeBoosts,
      icon: Rocket,
      accent: "bg-orange-50 text-orange-600",
      href: "/dashboard/boost",
    },
    {
      key: "verification",
      label: ws.verificationStatus,
      value: null,
      icon: ShieldCheck,
      accent: "bg-indigo-50 text-indigo-600",
      href: "/dashboard/settings",
      customLabel: verificationLabels[verificationStatus],
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        if ("customLabel" in card && card.customLabel) {
          return (
            <Link key={card.key} href={card.href ?? "#"} className="block">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-surface-500">{card.label}</p>
                    <p className="mt-2 text-lg font-bold text-surface-900">{card.customLabel}</p>
                  </div>
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/[0.04]",
                      card.accent
                    )}
                  >
                    <card.icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        }

        return (
          <KpiCard
            key={card.key}
            label={card.label}
            value={card.value}
            icon={card.icon}
            accent={card.accent}
            href={card.href}
            delay={index * 0.04}
            comingSoon={"comingSoon" in card ? card.comingSoon : false}
          />
        );
      })}
    </div>
  );
}
