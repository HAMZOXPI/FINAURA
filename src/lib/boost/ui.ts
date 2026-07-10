import type { BoostCenterCampaign } from "@/types/boost";
import type { BoostPaymentStatus } from "@/types/database";

/** Display-only duration for homepage spotlight checkout summary */
export const HOMEPAGE_SPOTLIGHT_DURATION_DAYS = 3;

export type BoostDisplayStatus =
  | "active"
  | "processing"
  | "expired"
  | "cancelled"
  | "upcoming";

export function formatReceiptId(checkoutId: string): string {
  return `RCP-${checkoutId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function addDaysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function resolveCampaignDisplayStatus(
  campaign: BoostCenterCampaign,
  now = Date.now()
): BoostDisplayStatus {
  if (campaign.status === "cancelled" || campaign.status === "removed") {
    return "cancelled";
  }
  if (campaign.status === "pending") return "processing";
  if (campaign.status === "expired") return "expired";
  if (campaign.status === "active") {
    if (campaign.startsAt && new Date(campaign.startsAt).getTime() > now) {
      return "upcoming";
    }
    if (campaign.expiresAt && new Date(campaign.expiresAt).getTime() <= now) {
      return "expired";
    }
    return "active";
  }
  return "expired";
}

export function mapPaymentStatusToDisplay(
  status: BoostPaymentStatus
): BoostDisplayStatus {
  if (status === "succeeded") return "active";
  if (status === "pending") return "processing";
  if (status === "cancelled") return "cancelled";
  return "cancelled";
}

export const BOOST_STATUS_STYLES: Record<
  BoostDisplayStatus,
  { badge: string; dot: string }
> = {
  active: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    dot: "bg-emerald-500",
  },
  processing: {
    badge: "bg-sky-50 text-sky-700 ring-sky-200/80",
    dot: "bg-sky-500",
  },
  expired: {
    badge: "bg-surface-100 text-surface-600 ring-surface-200/80",
    dot: "bg-surface-400",
  },
  cancelled: {
    badge: "bg-red-50 text-red-700 ring-red-200/80",
    dot: "bg-red-500",
  },
  upcoming: {
    badge: "bg-violet-50 text-violet-700 ring-violet-200/80",
    dot: "bg-violet-500",
  },
};

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
