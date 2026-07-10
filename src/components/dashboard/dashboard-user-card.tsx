"use client";

import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { formatMemberSince } from "@/lib/messaging/messaging-display";
import { cn, getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export type SidebarPlanSlug = "free" | "pro" | "enterprise" | string;

const PLAN_BADGE_STYLES: Record<string, string> = {
  free: "bg-surface-100 text-surface-600",
  pro: "bg-blue-50 text-blue-700",
  enterprise: "bg-purple-50 text-purple-700",
};

interface DashboardUserCardProps {
  userName: string;
  avatarUrl: string | null;
  verifiedSeller: boolean;
  memberSinceDate: string | null;
  planSlug: SidebarPlanSlug;
  planLabel: string;
}

export function DashboardUserCard({
  userName,
  avatarUrl,
  verifiedSeller,
  memberSinceDate,
  planSlug,
  planLabel,
}: DashboardUserCardProps) {
  const { t, locale } = useTranslation();
  const badgeClassName = PLAN_BADGE_STYLES[planSlug] ?? PLAN_BADGE_STYLES.free;
  const memberSince = memberSinceDate ? formatMemberSince(memberSinceDate, locale) : "";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-white to-surface-50 p-5 text-center">
      <div className="relative mx-auto h-16 w-16">
        <div className="relative h-16 w-16 overflow-hidden rounded-full ring-4 ring-white shadow-md">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-brand-100 text-base font-bold text-brand-700">
              {getInitials(userName)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        <p className="truncate text-sm font-bold text-surface-900">{userName}</p>
        {verifiedSeller && (
          <BadgeCheck
            className="h-4 w-4 shrink-0 text-brand-600"
            aria-label={t.seller.verifiedSeller}
          />
        )}
      </div>

      {memberSince && (
        <p className="mt-0.5 text-[11px] text-surface-500">
          {t.dashboard.memberSince} {memberSince}
        </p>
      )}

      <span
        className={cn(
          "mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
          badgeClassName
        )}
      >
        {planLabel}
      </span>
    </div>
  );
}
