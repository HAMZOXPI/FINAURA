import { BOOST_BID_INCREMENT } from "@/lib/boost/constants";
import { getBoostSettings } from "@/services/boost-settings.service";
import { createClient } from "@/lib/supabase/server";
import type {
  CalculateNextBidInput,
  CalculateNextBidResult,
  CreateBoostCampaignInput,
  FeaturedListingEntry,
} from "@/types/boost";
import type {
  BoostCampaign,
  BoostHistoryAction,
  BoostProduct,
  Property,
} from "@/types/database";

type ServiceResult<T> = { data: T } | { error: string };

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export class BoostService {
  private static async getClient() {
    return createClient();
  }

  private static async recordHistory(params: {
    campaignId: string;
    action: BoostHistoryAction;
    amount: number;
    previousPosition?: number | null;
    newPosition?: number | null;
  }): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase.from("boost_history").insert({
      campaign_id: params.campaignId,
      action: params.action,
      amount: params.amount,
      previous_position: params.previousPosition ?? null,
      new_position: params.newPosition ?? null,
    });

    if (error) {
      console.error("BoostService.recordHistory:", error.message);
    }
  }

  private static async getProduct(productId: string): Promise<BoostProduct | null> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from("boost_products")
      .select("*")
      .eq("id", productId)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;
    return {
      ...(data as BoostProduct),
      default_price: toNumber(data.default_price),
    };
  }

  private static async getActiveCampaignAtPosition(
    productId: string,
    position: number
  ): Promise<BoostCampaign | null> {
    const supabase = await this.getClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("boost_campaigns")
      .select("*")
      .eq("product_id", productId)
      .eq("position", position)
      .eq("status", "active")
      .gt("expires_at", now)
      .order("amount", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return {
      ...(data as BoostCampaign),
      amount: toNumber(data.amount),
      position: toNumber(data.position),
    };
  }

  private static async getNextAvailablePosition(productId: string): Promise<number> {
    const supabase = await this.getClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("boost_campaigns")
      .select("position")
      .eq("product_id", productId)
      .eq("status", "active")
      .gt("expires_at", now)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return 1;
    return toNumber(data.position) + 1;
  }

  static async calculateNextBid(
    input: CalculateNextBidInput
  ): Promise<ServiceResult<CalculateNextBidResult>> {
    const product = await this.getProduct(input.productId);
    if (!product) {
      return { error: "Boost product not found or inactive." };
    }

    const settings = await getBoostSettings();
    const bidIncrement = settings.bidIncrement || BOOST_BID_INCREMENT;

    const position =
      input.position ?? (await this.getNextAvailablePosition(input.productId));
    const incumbent = await this.getActiveCampaignAtPosition(input.productId, position);
    const currentTopAmount = incumbent ? incumbent.amount : null;
    const minimumBid = currentTopAmount
      ? currentTopAmount + bidIncrement
      : toNumber(product.default_price);

    return {
      data: {
        productId: input.productId,
        position,
        minimumBid,
        currentTopAmount,
        increment: bidIncrement,
      },
    };
  }

  static async createCampaign(
    input: CreateBoostCampaignInput
  ): Promise<ServiceResult<BoostCampaign>> {
    const supabase = await this.getClient();

    const product = await this.getProduct(input.productId);
    if (!product) {
      return { error: "Boost product not found or inactive." };
    }

    const { data: listing, error: listingError } = await supabase
      .from("properties")
      .select("id, owner_id, listing_status")
      .eq("id", input.listingId)
      .maybeSingle();

    if (listingError || !listing) {
      return { error: "Listing not found." };
    }

    if (listing.owner_id !== input.userId) {
      return { error: "You do not own this listing." };
    }

    const bidResult = await this.calculateNextBid({
      productId: input.productId,
      position: input.position,
    });

    if ("error" in bidResult) {
      return { error: bidResult.error };
    }

    const { position, minimumBid } = bidResult.data;

    if (input.amount < minimumBid) {
      return {
        error: `Bid must be at least ${minimumBid}.`,
      };
    }

    const { data: existingActive } = await supabase
      .from("boost_campaigns")
      .select("id")
      .eq("listing_id", input.listingId)
      .eq("product_id", input.productId)
      .in("status", ["pending", "active"])
      .maybeSingle();

    if (existingActive) {
      return { error: "This listing already has an active or pending boost campaign." };
    }

    const { data, error } = await supabase
      .from("boost_campaigns")
      .insert({
        listing_id: input.listingId,
        user_id: input.userId,
        product_id: input.productId,
        position,
        amount: input.amount,
        status: "pending",
      })
      .select("*")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Failed to create boost campaign." };
    }

    const campaign: BoostCampaign = {
      ...(data as BoostCampaign),
      amount: toNumber(data.amount),
      position: toNumber(data.position),
    };

    await this.recordHistory({
      campaignId: campaign.id,
      action: "created",
      amount: campaign.amount,
      newPosition: campaign.position,
    });

    return { data: campaign };
  }

  static async activateCampaign(
    campaignId: string,
    userId: string
  ): Promise<ServiceResult<BoostCampaign>> {
    const supabase = await this.getClient();

    const { data: campaign, error: fetchError } = await supabase
      .from("boost_campaigns")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle();

    if (fetchError || !campaign) {
      return { error: "Boost campaign not found." };
    }

    if (campaign.user_id !== userId) {
      return { error: "You do not own this boost campaign." };
    }

    if (campaign.status !== "pending") {
      return { error: "Only pending campaigns can be activated." };
    }

    const product = await this.getProduct(campaign.product_id);
    if (!product) {
      return { error: "Boost product not found or inactive." };
    }

    const incumbent = await this.getActiveCampaignAtPosition(
      campaign.product_id,
      toNumber(campaign.position)
    );

    if (incumbent && incumbent.amount >= toNumber(campaign.amount)) {
      return { error: "A higher bid already holds this position." };
    }

    const startsAt = new Date();
    const expiresAt = addDays(startsAt, product.default_duration);

    if (incumbent) {
      const { error: outbidError } = await supabase
        .from("boost_campaigns")
        .update({ status: "removed" })
        .eq("id", incumbent.id);

      if (outbidError) {
        return { error: outbidError.message };
      }

      await this.recordHistory({
        campaignId: incumbent.id,
        action: "outbid",
        amount: incumbent.amount,
        previousPosition: incumbent.position,
        newPosition: null,
      });
    }

    const { data, error } = await supabase
      .from("boost_campaigns")
      .update({
        status: "active",
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", campaignId)
      .select("*")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Failed to activate boost campaign." };
    }

    const activated: BoostCampaign = {
      ...(data as BoostCampaign),
      amount: toNumber(data.amount),
      position: toNumber(data.position),
    };

    await this.recordHistory({
      campaignId: activated.id,
      action: "activated",
      amount: activated.amount,
      newPosition: activated.position,
    });

    if (product.type === "homepage_spotlight") {
      await supabase
        .from("properties")
        .update({ is_featured: true })
        .eq("id", activated.listing_id);
    }

    return { data: activated };
  }

  static async expireCampaign(
    campaignId: string
  ): Promise<ServiceResult<BoostCampaign>> {
    const supabase = await this.getClient();

    const { data: campaign, error: fetchError } = await supabase
      .from("boost_campaigns")
      .select("*, product:boost_products(type)")
      .eq("id", campaignId)
      .maybeSingle();

    if (fetchError || !campaign) {
      return { error: "Boost campaign not found." };
    }

    if (campaign.status !== "active") {
      return { error: "Only active campaigns can be expired." };
    }

    const { data, error } = await supabase
      .from("boost_campaigns")
      .update({ status: "expired" })
      .eq("id", campaignId)
      .select("*")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Failed to expire boost campaign." };
    }

    const expired: BoostCampaign = {
      ...(data as BoostCampaign),
      amount: toNumber(data.amount),
      position: toNumber(data.position),
    };

    await this.recordHistory({
      campaignId: expired.id,
      action: "expired",
      amount: expired.amount,
      previousPosition: expired.position,
    });

    const product = campaign.product as { type: string } | null;
    if (product?.type === "homepage_spotlight") {
      const { BoostBiddingService } = await import("@/services/boost-bidding.service");
      await BoostBiddingService.clearFeaturedIfNoActiveCampaign(
        expired.listing_id,
        expired.product_id
      );
    }

    return { data: expired };
  }

  static async getFeaturedListings(
    productId?: string,
    limit = 20
  ): Promise<FeaturedListingEntry[]> {
    const supabase = await this.getClient();
    const now = new Date().toISOString();

    let query = supabase
      .from("boost_campaigns")
      .select("*, product:boost_products(*), property:properties(*)")
      .eq("status", "active")
      .gt("expires_at", now)
      .order("position", { ascending: true })
      .limit(limit);

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error("BoostService.getFeaturedListings:", error?.message);
      return [];
    }

    return data
      .filter((row) => {
        const property = row.property as Property | null;
        return property?.listing_status === "published";
      })
      .map((row) => ({
        campaign: {
          ...(row as BoostCampaign),
          amount: toNumber(row.amount),
          position: toNumber(row.position),
        },
        product: {
          ...(row.product as BoostProduct),
          default_price: toNumber((row.product as BoostProduct).default_price),
        },
        property: row.property as Property,
      }));
  }

  static async getCurrentPosition(
    listingId: string,
    productId: string
  ): Promise<number | null> {
    const supabase = await this.getClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("boost_campaigns")
      .select("position")
      .eq("listing_id", listingId)
      .eq("product_id", productId)
      .eq("status", "active")
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return toNumber(data.position);
  }

  static async removeCampaign(
    campaignId: string,
    userId: string
  ): Promise<ServiceResult<BoostCampaign>> {
    const supabase = await this.getClient();

    const { data: campaign, error: fetchError } = await supabase
      .from("boost_campaigns")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle();

    if (fetchError || !campaign) {
      return { error: "Boost campaign not found." };
    }

    if (campaign.user_id !== userId) {
      return { error: "You do not own this boost campaign." };
    }

    if (!["pending", "active"].includes(campaign.status)) {
      return { error: "This campaign cannot be removed." };
    }

    const { data, error } = await supabase
      .from("boost_campaigns")
      .update({ status: "removed" })
      .eq("id", campaignId)
      .select("*")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Failed to remove boost campaign." };
    }

    const removed: BoostCampaign = {
      ...(data as BoostCampaign),
      amount: toNumber(data.amount),
      position: toNumber(data.position),
    };

    await this.recordHistory({
      campaignId: removed.id,
      action: "removed",
      amount: removed.amount,
      previousPosition: removed.position,
    });

    return { data: removed };
  }
}
