import type {
  BoostCampaign,
  BoostHistoryAction,
  BoostPaymentStatus,
  BoostProduct,
  Property,
} from "@/types/database";

export interface CreateBoostCampaignInput {
  listingId: string;
  userId: string;
  productId: string;
  amount: number;
  position?: number;
}

export interface ActivateBoostCampaignInput {
  campaignId: string;
  userId: string;
}

export interface CalculateNextBidInput {
  productId: string;
  position?: number;
}

export interface CalculateNextBidResult {
  productId: string;
  position: number;
  minimumBid: number;
  currentTopAmount: number | null;
  increment: number;
}

export interface FeaturedListingEntry {
  campaign: BoostCampaign;
  product: BoostProduct;
  property: Property;
}

export interface BoostCampaignWithRelations extends BoostCampaign {
  product?: BoostProduct;
  property?: Property;
}

export interface BoostServiceError {
  error: string;
}

export interface BoostMarketplacePosition {
  position: number;
  minimumBid: number;
  currentPrice: number | null;
  holderTitle: string | null;
  holderListingId: string | null;
  expiresAt: string | null;
  isOwnListing: boolean;
  estimatedVisibility: number;
  estimatedClicks: number;
  estimatedLeads: number;
}

export interface BoostMarketplaceData {
  productId: string;
  productName: string;
  listingId: string;
  listingTitle: string;
  positions: BoostMarketplacePosition[];
}

export interface BoostCenterCampaign {
  id: string;
  listingId: string;
  listingTitle: string;
  productName: string;
  position: number;
  amount: number;
  status: BoostCampaign["status"];
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface BoostCenterHistoryEntry {
  id: string;
  campaignId: string;
  listingTitle: string;
  action: BoostHistoryAction;
  amount: number;
  previousPosition: number | null;
  newPosition: number | null;
  createdAt: string;
}

export interface BoostCenterPayment {
  id: string;
  listingId: string;
  listingTitle: string;
  productName: string;
  position: number;
  amount: number;
  paymentMethod: string;
  status: BoostPaymentStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface BoostCenterData {
  active: BoostCenterCampaign[];
  processing: BoostCenterCampaign[];
  upcoming: BoostCenterCampaign[];
  cancelled: BoostCenterCampaign[];
  expired: BoostCenterCampaign[];
  payments: BoostCenterPayment[];
  history: BoostCenterHistoryEntry[];
}
