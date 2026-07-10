import type { BoostCampaignStatus, BoostHistoryAction } from "@/types/database";

export const BOOST_BID_INCREMENT = 10;

export const BOOST_ACTIVE_STATUSES: BoostCampaignStatus[] = ["pending", "active"];

export const BOOST_TERMINAL_STATUSES: BoostCampaignStatus[] = [
  "expired",
  "removed",
  "cancelled",
];

export function isBoostCampaignActive(
  status: BoostCampaignStatus,
  expiresAt: string | null
): boolean {
  if (status !== "active") return false;
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}

export function isBoostHistoryPositionChange(action: BoostHistoryAction): boolean {
  return action === "outbid" || action === "position_changed";
}
