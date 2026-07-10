import type { BoostCenterCampaign, BoostCenterData } from "@/types/boost";

export type ListingPromoteVariant = "boost" | "sponsored" | "verified" | "premium-package";

export type ListingBoostStatus =
  | "none"
  | "active"
  | "processing"
  | "upcoming"
  | "expired";

export interface ListingBoostDisplayState {
  status: ListingBoostStatus;
  campaign?: BoostCenterCampaign;
}

function pickCampaignForListing(
  listingId: string,
  campaigns: BoostCenterCampaign[]
): BoostCenterCampaign | undefined {
  return campaigns
    .filter((campaign) => campaign.listingId === listingId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
}

/** UI-only: resolve boost display state from existing Boost Center data. */
export function resolveListingBoostState(
  listingId: string,
  data: BoostCenterData | null | undefined
): ListingBoostDisplayState {
  if (!data) return { status: "none" };

  const active = pickCampaignForListing(listingId, data.active);
  if (active) return { status: "active", campaign: active };

  const processing = pickCampaignForListing(listingId, data.processing);
  if (processing) return { status: "processing", campaign: processing };

  const upcoming = pickCampaignForListing(listingId, data.upcoming);
  if (upcoming) return { status: "upcoming", campaign: upcoming };

  const expired = pickCampaignForListing(listingId, data.expired);
  if (expired) return { status: "expired", campaign: expired };

  return { status: "none" };
}

export function isListingBoostActive(state: ListingBoostDisplayState): boolean {
  return state.status === "active" || state.status === "upcoming";
}
