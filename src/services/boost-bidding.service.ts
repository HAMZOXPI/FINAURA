import { BOOST_BID_INCREMENT } from "@/lib/boost/constants";
import { createClient } from "@/lib/supabase/server";

export const BOOST_POSITION_CONCURRENCY_ERROR =
  "This position has just been updated. Please refresh and try again.";

export interface PlaceBoostBidInput {
  listingId: string;
  userId: string;
  productId: string;
  position: number;
  amount: number;
}

export interface PlaceBoostBidResult {
  campaignId: string;
  outbidUserId: string | null;
  outbidListingId: string | null;
  outbidCampaignId: string | null;
  winningAmount: number;
  position: number;
}

type ServiceResult<T> = { data: T } | { error: string };

interface RpcBidResponse {
  campaign_id?: string;
  outbid_user_id?: string | null;
  outbid_listing_id?: string | null;
  outbid_campaign_id?: string | null;
  winning_amount?: number;
  position?: number;
  error?: string;
  code?: string;
}

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

function mapRpcError(message: string, code?: string): string {
  if (code === "stale_bid" || code === "concurrency_conflict") {
    return BOOST_POSITION_CONCURRENCY_ERROR;
  }
  return message;
}

export class BoostBiddingService {
  static async placeBid(
    input: PlaceBoostBidInput
  ): Promise<ServiceResult<PlaceBoostBidResult>> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("place_boost_bid", {
      p_listing_id: input.listingId,
      p_user_id: input.userId,
      p_product_id: input.productId,
      p_position: input.position,
      p_amount: input.amount,
    });

    if (error) {
      if (error.code === "23505") {
        return { error: BOOST_POSITION_CONCURRENCY_ERROR };
      }
      return { error: error.message };
    }

    const payload = (data ?? {}) as RpcBidResponse;

    if (payload.error) {
      return { error: mapRpcError(payload.error, payload.code) };
    }

    if (!payload.campaign_id) {
      return { error: "Failed to place boost bid." };
    }

    return {
      data: {
        campaignId: payload.campaign_id,
        outbidUserId: payload.outbid_user_id ?? null,
        outbidListingId: payload.outbid_listing_id ?? null,
        outbidCampaignId: payload.outbid_campaign_id ?? null,
        winningAmount: toNumber(payload.winning_amount),
        position: toNumber(payload.position),
      },
    };
  }

  static async validatePaymentAmount(
    productId: string,
    position: number,
    amount: number
  ): Promise<ServiceResult<{ minimumBid: number }>> {
    const { BoostService } = await import("@/services/boost.service");
    const bidResult = await BoostService.calculateNextBid({ productId, position });

    if ("error" in bidResult) {
      return { error: bidResult.error };
    }

    if (amount < bidResult.data.minimumBid) {
      return { error: BOOST_POSITION_CONCURRENCY_ERROR };
    }

    return { data: { minimumBid: bidResult.data.minimumBid } };
  }

  static async expireDueCampaigns(): Promise<number> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("expire_due_boost_campaigns");

    if (error) {
      console.error("BoostBiddingService.expireDueCampaigns:", error.message);
      return 0;
    }

    return typeof data === "number" ? data : Number(data ?? 0);
  }

  static async adminForceAssign(input: {
    listingId: string;
    productId: string;
    position: number;
    amount: number;
    adminUserId: string;
  }): Promise<ServiceResult<{ campaignId: string }>> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("admin_force_assign_boost", {
      p_listing_id: input.listingId,
      p_product_id: input.productId,
      p_position: input.position,
      p_amount: input.amount,
      p_admin_user_id: input.adminUserId,
    });

    if (error) {
      return { error: error.message };
    }

    const payload = (data ?? {}) as RpcBidResponse;
    if (payload.error) {
      return { error: mapRpcError(payload.error, payload.code) };
    }

    if (!payload.campaign_id) {
      return { error: "Failed to assign boost position." };
    }

    return { data: { campaignId: payload.campaign_id } };
  }

  static async adminUpdateBidAmount(
    campaignId: string,
    amount: number
  ): Promise<ServiceResult<{ id: string }>> {
    if (amount < 0) {
      return { error: "Bid amount cannot be negative." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("boost_campaigns")
      .update({ amount })
      .eq("id", campaignId)
      .eq("status", "active")
      .select("id")
      .maybeSingle();

    if (error || !data) {
      return { error: error?.message ?? "Active campaign not found." };
    }

    return { data: { id: data.id as string } };
  }

  static async adminUpdateExpiration(
    campaignId: string,
    expiresAt: string
  ): Promise<ServiceResult<{ id: string }>> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("boost_campaigns")
      .update({ expires_at: expiresAt })
      .eq("id", campaignId)
      .eq("status", "active")
      .select("id")
      .maybeSingle();

    if (error || !data) {
      return { error: error?.message ?? "Active campaign not found." };
    }

    return { data: { id: data.id as string } };
  }

  static async adminRestartCampaign(
    campaignId: string
  ): Promise<ServiceResult<{ id: string }>> {
    const supabase = await createClient();

    const { data: campaign, error: fetchError } = await supabase
      .from("boost_campaigns")
      .select("*, product:boost_products(default_duration, type)")
      .eq("id", campaignId)
      .maybeSingle();

    if (fetchError || !campaign) {
      return { error: "Campaign not found." };
    }

    if (campaign.status !== "active") {
      return { error: "Only active campaigns can be restarted." };
    }

    const product = campaign.product as { default_duration: number; type: string } | null;
    const durationDays = product?.default_duration ?? 3;
    const startsAt = new Date();
    const expiresAt = new Date(startsAt);
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const { data, error } = await supabase
      .from("boost_campaigns")
      .update({
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", campaignId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      return { error: error?.message ?? "Failed to restart campaign." };
    }

    await supabase.from("boost_history").insert({
      campaign_id: campaignId,
      action: "extended",
      amount: toNumber(campaign.amount),
      previous_position: campaign.position,
      new_position: campaign.position,
    });

    if (product?.type === "homepage_spotlight") {
      await supabase
        .from("properties")
        .update({ is_featured: true })
        .eq("id", campaign.listing_id as string);
    }

    return { data: { id: data.id as string } };
  }

  static async clearFeaturedIfNoActiveCampaign(
    listingId: string,
    productId: string
  ): Promise<void> {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data: product } = await supabase
      .from("boost_products")
      .select("type")
      .eq("id", productId)
      .maybeSingle();

    if (product?.type !== "homepage_spotlight") return;

    const { data: activeCampaign } = await supabase
      .from("boost_campaigns")
      .select("id")
      .eq("listing_id", listingId)
      .eq("product_id", productId)
      .eq("status", "active")
      .gt("expires_at", now)
      .maybeSingle();

    if (!activeCampaign) {
      await supabase.from("properties").update({ is_featured: false }).eq("id", listingId);
    }
  }

  static getDefaultIncrement(): number {
    return BOOST_BID_INCREMENT;
  }
}
