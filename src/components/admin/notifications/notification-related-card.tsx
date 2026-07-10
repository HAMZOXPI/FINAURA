"use client";

import Link from "next/link";
import {
  Gift,
  Home,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RelatedEntityInfo } from "@/lib/admin/notification-details-drawer-display";
import { useTranslation } from "@/i18n/locale-provider";

const KIND_META: Record<
  NonNullable<RelatedEntityInfo["kind"]>,
  { icon: LucideIcon; accent: string }
> = {
  boost: { icon: Rocket, accent: "bg-orange-50 text-orange-600" },
  verification: { icon: ShieldCheck, accent: "bg-emerald-50 text-emerald-600" },
  message: { icon: MessageSquare, accent: "bg-blue-50 text-blue-600" },
  promotion: { icon: Sparkles, accent: "bg-purple-50 text-purple-600" },
  listing: { icon: Home, accent: "bg-brand-50 text-brand-600" },
  gift: { icon: Gift, accent: "bg-amber-50 text-amber-600" },
};

interface NotificationRelatedCardProps {
  related: RelatedEntityInfo;
}

export function NotificationRelatedCard({ related }: NotificationRelatedCardProps) {
  const { t } = useTranslation();
  if (!related.kind) return null;

  const meta = KIND_META[related.kind];
  const Icon = meta.icon;

  const kindLabels: Record<NonNullable<RelatedEntityInfo["kind"]>, string> = {
    boost: t.admin.notifications.drawer.related.boost,
    verification: t.admin.notifications.drawer.related.verification,
    message: t.admin.notifications.drawer.related.message,
    promotion: t.admin.notifications.drawer.related.promotion,
    listing: t.admin.notifications.drawer.related.listing,
    gift: t.admin.notifications.analytics.gift,
  };

  const fieldLabels: Record<string, string> = {
    listingId: t.admin.notifications.drawer.related.listingId,
    position: t.admin.notifications.drawer.related.position,
    winningAmount: t.admin.notifications.drawer.related.winningAmount,
    reason: t.admin.notifications.drawer.related.reason,
    senderName: t.admin.notifications.drawer.related.senderName,
    planName: t.admin.notifications.drawer.related.planName,
    daysLeft: t.admin.notifications.drawer.related.daysLeft,
    giftLabel: t.admin.notifications.drawer.related.giftLabel,
    title: t.admin.notifications.drawer.related.propertyTitle,
    propertyId: t.admin.notifications.drawer.related.propertyId,
  };

  return (
    <div className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/[0.04] ${meta.accent}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-surface-400">
            {t.admin.notifications.drawer.relatedTitle}
          </p>
          <p className="mt-1 text-sm font-bold text-surface-900">{kindLabels[related.kind]}</p>
          {related.fields.length > 0 ? (
            <dl className="mt-3 space-y-2">
              {related.fields.map((field) => (
                <div key={field.labelKey} className="flex gap-2 text-sm">
                  <dt className="shrink-0 font-medium text-surface-500">
                    {fieldLabels[field.labelKey] ?? field.labelKey}:
                  </dt>
                  <dd className="min-w-0 break-all text-surface-800">{field.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-sm text-surface-400">—</p>
          )}
          {related.href && (
            <Link
              href={related.href}
              className="mt-3 inline-flex text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              {t.admin.notifications.drawer.openRelated}
            </Link>
          )}
        </div>
        {related.kind === "gift" && related.fields.length === 0 && (
          <Gift className="h-5 w-5 shrink-0 text-surface-300" aria-hidden />
        )}
      </div>
    </div>
  );
}
