"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { BoostBiddingService } from "@/services/boost-bidding.service";
import type { BoostHistoryAction } from "@/types/database";

function revalidateBoostPaths() {
  revalidatePath("/admin/boost");
  revalidatePath("/admin/boost/settings");
  revalidatePath("/dashboard/boost");
  revalidatePath("/dashboard/properties");
  revalidatePath("/");
}

async function recordBoostHistory(params: {
  campaignId: string;
  action: BoostHistoryAction;
  amount: number;
  previousPosition?: number | null;
  newPosition?: number | null;
}) {
  const supabase = await createClient();
  await supabase.from("boost_history").insert({
    campaign_id: params.campaignId,
    action: params.action,
    amount: params.amount,
    previous_position: params.previousPosition ?? null,
    new_position: params.newPosition ?? null,
  });
}

async function getCampaignOrError(
  campaignId: string
): Promise<{ data: Awaited<ReturnType<typeof fetchCampaign>> } | { error: string }> {
  const data = await fetchCampaign(campaignId);
  if (!data) return { error: "Campaign not found." };
  return { data };
}

async function fetchCampaign(campaignId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boost_campaigns")
    .select("*, product:boost_products(type)")
    .eq("id", campaignId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

async function clearFeaturedForCampaign(campaign: {
  listing_id: string;
  product_id: string;
}) {
  await BoostBiddingService.clearFeaturedIfNoActiveCampaign(
    campaign.listing_id,
    campaign.product_id
  );
}

export async function updateBoostSettings(input: {
  bidIncrement: number;
  featuredPositions: number;
}): Promise<{ success: true } | { error: string }> {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  if (input.bidIncrement <= 0) return { error: "Bid increment must be greater than zero." };
  if (input.featuredPositions < 1 || input.featuredPositions > 20) {
    return { error: "Featured positions must be between 1 and 20." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("boost_settings")
    .upsert({
      id: 1,
      bid_increment: input.bidIncrement,
      featured_positions: input.featuredPositions,
      updated_by: session.user.id,
    });

  if (error) return { error: error.message };

  revalidateBoostPaths();
  return { success: true };
}

export async function updateBoostProduct(input: {
  productId: string;
  defaultPrice: number;
  defaultDuration: number;
  isActive: boolean;
}): Promise<{ success: true } | { error: string }> {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  if (input.defaultPrice < 0) return { error: "Default price cannot be negative." };
  if (input.defaultDuration <= 0) return { error: "Duration must be at least one day." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("boost_products")
    .update({
      default_price: input.defaultPrice,
      default_duration: input.defaultDuration,
      is_active: input.isActive,
    })
    .eq("id", input.productId);

  if (error) return { error: error.message };

  revalidateBoostPaths();
  return { success: true };
}

export async function adminRemoveBoost(
  campaignId: string
): Promise<{ success: true } | { error: string }> {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const campaignResult = await getCampaignOrError(campaignId);
  if ("error" in campaignResult) return { error: campaignResult.error };

  const campaign = campaignResult.data;
  if (!["pending", "active"].includes(campaign.status)) {
    return { error: "This campaign cannot be removed." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("boost_campaigns")
    .update({ status: "removed" })
    .eq("id", campaignId);

  if (error) return { error: error.message };

  await recordBoostHistory({
    campaignId,
    action: "removed",
    amount: Number(campaign.amount),
    previousPosition: campaign.position,
  });

  await clearFeaturedForCampaign(campaign);

  revalidateBoostPaths();
  return { success: true };
}

export async function adminExtendBoostDuration(
  campaignId: string,
  extraDays: number
): Promise<{ success: true } | { error: string }> {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  if (extraDays <= 0) return { error: "Extension must be at least one day." };

  const campaignResult = await getCampaignOrError(campaignId);
  if ("error" in campaignResult) return { error: campaignResult.error };

  const campaign = campaignResult.data;
  if (campaign.status !== "active") {
    return { error: "Only active campaigns can be extended." };
  }

  const baseDate = campaign.expires_at ? new Date(campaign.expires_at) : new Date();
  baseDate.setDate(baseDate.getDate() + extraDays);

  const supabase = await createClient();
  const { error } = await supabase
    .from("boost_campaigns")
    .update({ expires_at: baseDate.toISOString() })
    .eq("id", campaignId);

  if (error) return { error: error.message };

  await recordBoostHistory({
    campaignId,
    action: "extended",
    amount: Number(campaign.amount),
    previousPosition: campaign.position,
    newPosition: campaign.position,
  });

  revalidateBoostPaths();
  return { success: true };
}

export async function adminMoveBoostPosition(
  campaignId: string,
  newPosition: number
): Promise<{ success: true } | { error: string }> {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  if (newPosition < 1) return { error: "Position must be at least 1." };

  const campaignResult = await getCampaignOrError(campaignId);
  if ("error" in campaignResult) return { error: campaignResult.error };

  const campaign = campaignResult.data;
  if (campaign.status !== "active") {
    return { error: "Only active campaigns can be moved." };
  }

  const previousPosition = Number(campaign.position);
  if (previousPosition === newPosition) {
    return { error: "Campaign is already at this position." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("boost_campaigns")
    .update({ position: newPosition })
    .eq("id", campaignId);

  if (error) return { error: error.message };

  await recordBoostHistory({
    campaignId,
    action: "position_changed",
    amount: Number(campaign.amount),
    previousPosition,
    newPosition,
  });

  revalidateBoostPaths();
  return { success: true };
}

export async function adminDisableBoostCampaign(
  campaignId: string
): Promise<{ success: true } | { error: string }> {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const campaignResult = await getCampaignOrError(campaignId);
  if ("error" in campaignResult) return { error: campaignResult.error };

  const campaign = campaignResult.data;
  if (!["pending", "active"].includes(campaign.status)) {
    return { error: "This campaign is already inactive." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("boost_campaigns")
    .update({ status: "cancelled" })
    .eq("id", campaignId);

  if (error) return { error: error.message };

  await recordBoostHistory({
    campaignId,
    action: "disabled",
    amount: Number(campaign.amount),
    previousPosition: campaign.position,
  });

  await clearFeaturedForCampaign(campaign);

  revalidateBoostPaths();
  return { success: true };
}

export async function adminUpdateBoostBid(
  campaignId: string,
  amount: number
): Promise<{ success: true } | { error: string }> {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const result = await BoostBiddingService.adminUpdateBidAmount(campaignId, amount);
  if ("error" in result) return { error: result.error };

  revalidateBoostPaths();
  return { success: true };
}

export async function adminUpdateBoostExpiration(
  campaignId: string,
  expiresAt: string
): Promise<{ success: true } | { error: string }> {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const result = await BoostBiddingService.adminUpdateExpiration(campaignId, expiresAt);
  if ("error" in result) return { error: result.error };

  revalidateBoostPaths();
  return { success: true };
}

export async function adminRestartBoostCampaign(
  campaignId: string
): Promise<{ success: true } | { error: string }> {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const result = await BoostBiddingService.adminRestartCampaign(campaignId);
  if ("error" in result) return { error: result.error };

  revalidateBoostPaths();
  return { success: true };
}

export async function adminForceAssignBoost(input: {
  listingId: string;
  productId: string;
  position: number;
  amount: number;
}): Promise<{ success: true; campaignId: string } | { error: string }> {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  if (input.position < 1) return { error: "Position must be at least 1." };
  if (input.amount < 0) return { error: "Amount cannot be negative." };

  const result = await BoostBiddingService.adminForceAssign({
    listingId: input.listingId,
    productId: input.productId,
    position: input.position,
    amount: input.amount,
    adminUserId: session.user.id,
  });

  if ("error" in result) return { error: result.error };

  revalidateBoostPaths();
  return { success: true, campaignId: result.data.campaignId };
}
