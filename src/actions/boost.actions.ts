"use server";

import { createClient } from "@/lib/supabase/server";
import {
  completeBoostCheckout,
  prepareBoostCheckout,
} from "@/services/boost-checkout.service";
import { BoostService } from "@/services/boost.service";
import { calculatePositionEstimates } from "@/lib/boost/estimates";
import { getBoostSettings } from "@/services/boost-settings.service";
import type { BoostCheckoutPreview } from "@/lib/payments/boost/types";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import type {
  BoostCenterData,
  BoostCenterCampaign,
  BoostCenterHistoryEntry,
  BoostCenterPayment,
  BoostMarketplaceData,
  BoostMarketplacePosition,
} from "@/types/boost";
import type { BoostCampaign, BoostHistory, BoostPayment, BoostProduct } from "@/types/database";

const HOMEPAGE_PRODUCT_SLUG = "homepage-spotlight";

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function getHomepageProduct(): Promise<BoostProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boost_products")
    .select("*")
    .eq("slug", HOMEPAGE_PRODUCT_SLUG)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return {
    ...(data as BoostProduct),
    default_price: toNumber(data.default_price),
  };
}

function mapCampaignRow(
  row: BoostCampaign & {
    product?: { name: string } | null;
    property?: { title: string } | null;
  }
): BoostCenterCampaign {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.property?.title ?? "—",
    productName: row.product?.name ?? "—",
    position: toNumber(row.position),
    amount: toNumber(row.amount),
    status: row.status,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export async function fetchBoostMarketplaceData(
  listingId: string
): Promise<{ data: BoostMarketplaceData } | { error: string }> {
  const userId = await getAuthUserId();
  if (!userId) {
    const dict = getDictionary(await getLocale());
    return { error: dict.errors.unauthorized };
  }

  const supabase = await createClient();
  const product = await getHomepageProduct();
  if (!product) {
    return { error: "Boost product unavailable." };
  }

  const { data: listing, error: listingError } = await supabase
    .from("properties")
    .select("id, title, owner_id")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return { error: "Listing not found." };
  }

  if (listing.owner_id !== userId) {
    return { error: "You do not own this listing." };
  }

  const featured = await BoostService.getFeaturedListings(product.id, 20);
  const settings = await getBoostSettings();
  const marketplacePositions = settings.featuredPositions;

  const positions: BoostMarketplacePosition[] = [];

  for (let position = 1; position <= marketplacePositions; position += 1) {
    const bidResult = await BoostService.calculateNextBid({
      productId: product.id,
      position,
    });

    if ("error" in bidResult) {
      return { error: bidResult.error };
    }

    const incumbent = featured.find((entry) => entry.campaign.position === position);
    const estimates = calculatePositionEstimates(position);

    positions.push({
      position,
      minimumBid: bidResult.data.minimumBid,
      currentPrice: incumbent ? incumbent.campaign.amount : null,
      holderTitle: incumbent?.property.title ?? null,
      holderListingId: incumbent?.campaign.listing_id ?? null,
      expiresAt: incumbent?.campaign.expires_at ?? null,
      isOwnListing: incumbent?.campaign.listing_id === listingId,
      estimatedVisibility: estimates.estimatedVisibility,
      estimatedClicks: estimates.estimatedClicks,
      estimatedLeads: estimates.estimatedLeads,
    });
  }

  return {
    data: {
      productId: product.id,
      productName: product.name,
      listingId,
      listingTitle: listing.title,
      positions,
    },
  };
}

export async function prepareBoostCheckoutAction(
  listingId: string,
  position: number
): Promise<{ data: BoostCheckoutPreview } | { error: string }> {
  const userId = await getAuthUserId();
  if (!userId) {
    const dict = getDictionary(await getLocale());
    return { error: dict.errors.unauthorized };
  }

  return prepareBoostCheckout(listingId, position, userId);
}

export async function completeBoostCheckoutAction(
  checkoutId: string
): Promise<{ success: true; campaignId: string } | { error: string }> {
  const userId = await getAuthUserId();
  if (!userId) {
    const dict = getDictionary(await getLocale());
    return { error: dict.errors.unauthorized };
  }

  const result = await completeBoostCheckout(checkoutId, userId);
  if ("error" in result) return { error: result.error };
  return { success: true, campaignId: result.data.campaignId };
}

/** @deprecated Use prepareBoostCheckoutAction + completeBoostCheckoutAction */
export async function placeBoostBid(
  listingId: string,
  position: number
): Promise<{ success: true; campaignId: string } | { error: string }> {
  const prepared = await prepareBoostCheckoutAction(listingId, position);
  if ("error" in prepared) return { error: prepared.error };
  return completeBoostCheckoutAction(prepared.data.checkoutId);
}

export async function renewBoostCampaign(
  campaignId: string
): Promise<{ success: true; campaignId: string } | { error: string }> {
  const userId = await getAuthUserId();
  if (!userId) {
    const dict = getDictionary(await getLocale());
    return { error: dict.errors.unauthorized };
  }

  const supabase = await createClient();
  const { data: campaign, error } = await supabase
    .from("boost_campaigns")
    .select("listing_id, position, status, user_id")
    .eq("id", campaignId)
    .maybeSingle();

  if (error || !campaign) {
    return { error: "Campaign not found." };
  }

  if (campaign.user_id !== userId) {
    return { error: "You do not own this campaign." };
  }

  if (campaign.status !== "expired") {
    return { error: "Only expired campaigns can be renewed." };
  }

  const prepared = await prepareBoostCheckout(
    campaign.listing_id,
    toNumber(campaign.position),
    userId
  );
  if ("error" in prepared) return { error: prepared.error };

  const completed = await completeBoostCheckout(prepared.data.checkoutId, userId);
  if ("error" in completed) return { error: completed.error };

  return { success: true, campaignId: completed.data.campaignId };
}

const EMPTY_BOOST_CENTER: BoostCenterData = {
  active: [],
  processing: [],
  upcoming: [],
  cancelled: [],
  expired: [],
  payments: [],
  history: [],
};

export async function fetchBoostCenterData(): Promise<BoostCenterData> {
  const userId = await getAuthUserId();
  if (!userId) {
    return EMPTY_BOOST_CENTER;
  }

  const supabase = await createClient();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const now = new Date().toISOString();
  const nowMs = Date.now();

  const { data: campaigns, error: campaignsError } = await supabase
    .from("boost_campaigns")
    .select("*, product:boost_products(name), property:properties(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (campaignsError || !campaigns) {
    console.error("fetchBoostCenterData campaigns:", campaignsError?.message);
    return EMPTY_BOOST_CENTER;
  }

  const mapped = campaigns.map((row) =>
    mapCampaignRow(
      row as BoostCampaign & {
        product?: { name: string } | null;
        property?: { title: string } | null;
      }
    )
  );

  const processing = mapped.filter((campaign) => campaign.status === "pending");

  const cancelled = mapped.filter(
    (campaign) => campaign.status === "cancelled" || campaign.status === "removed"
  );

  const upcoming = mapped.filter(
    (campaign) =>
      campaign.status === "active" &&
      campaign.startsAt !== null &&
      new Date(campaign.startsAt).getTime() > nowMs
  );

  const active = mapped.filter(
    (campaign) =>
      campaign.status === "active" &&
      campaign.expiresAt !== null &&
      campaign.expiresAt > now &&
      !(
        campaign.startsAt !== null && new Date(campaign.startsAt).getTime() > nowMs
      )
  );

  const expired = mapped.filter(
    (campaign) =>
      campaign.status === "expired" ||
      (campaign.status === "active" && campaign.expiresAt !== null && campaign.expiresAt <= now)
  );

  const { data: paymentRows, error: paymentsError } = await supabase
    .from("boost_payments")
    .select("*, product:boost_products(name), property:properties(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (paymentsError) {
    console.error("fetchBoostCenterData payments:", paymentsError.message);
  }

  const payments: BoostCenterPayment[] = (paymentRows ?? []).map((row) => {
    const payment = row as BoostPayment & {
      product?: { name: string } | null;
      property?: { title: string } | null;
    };

    return {
      id: payment.id,
      listingId: payment.listing_id,
      listingTitle: payment.property?.title ?? "—",
      productName: payment.product?.name ?? "—",
      position: toNumber(payment.position),
      amount: toNumber(payment.amount),
      paymentMethod: dict.boost.checkoutCardMasked,
      status: payment.status,
      createdAt: payment.created_at,
      completedAt: payment.completed_at,
    };
  });

  const campaignIds = mapped.map((campaign) => campaign.id);
  let history: BoostCenterHistoryEntry[] = [];

  if (campaignIds.length > 0) {
    const { data: historyRows, error: historyError } = await supabase
      .from("boost_history")
      .select("*")
      .in("campaign_id", campaignIds)
      .order("created_at", { ascending: false })
      .limit(50);

    if (historyError) {
      console.error("fetchBoostCenterData history:", historyError.message);
    } else if (historyRows) {
      const titleByCampaign = new Map(mapped.map((c) => [c.id, c.listingTitle]));

      history = (historyRows as BoostHistory[]).map((entry) => ({
        id: entry.id,
        campaignId: entry.campaign_id,
        listingTitle: titleByCampaign.get(entry.campaign_id) ?? "—",
        action: entry.action,
        amount: toNumber(entry.amount),
        previousPosition: entry.previous_position,
        newPosition: entry.new_position,
        createdAt: entry.created_at,
      }));
    }
  }

  return { active, processing, upcoming, cancelled, expired, payments, history };
}
