import { revalidatePath } from "next/cache";
import { getBoostPaymentProvider } from "@/lib/payments/boost";
import type { BoostCheckoutPreview } from "@/lib/payments/boost/types";
import { notifyBoostOutbid } from "@/lib/notifications/dispatch";
import { createClient } from "@/lib/supabase/server";
import { BoostBiddingService } from "@/services/boost-bidding.service";
import { BoostService } from "@/services/boost.service";

const HOMEPAGE_PRODUCT_SLUG = "homepage-spotlight";
const CHECKOUT_TTL_MINUTES = 30;

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

function revalidateBoostSurfaces(listingId?: string) {
  revalidatePath("/");
  revalidatePath("/dashboard/boost");
  revalidatePath("/dashboard/properties");
  if (listingId) {
    revalidatePath(`/properties/${listingId}`);
  }
}

type ServiceResult<T> = { data: T } | { error: string };

async function getHomepageProductId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("boost_products")
    .select("id")
    .eq("slug", HOMEPAGE_PRODUCT_SLUG)
    .eq("is_active", true)
    .maybeSingle();

  return data?.id ?? null;
}

async function validateListingOwnership(
  listingId: string,
  userId: string
): Promise<{ data: { id: string; title: string; owner_id: string } } | { error: string }> {
  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from("properties")
    .select("id, title, owner_id")
    .eq("id", listingId)
    .maybeSingle();

  if (error || !listing) return { error: "Listing not found." };
  if (listing.owner_id !== userId) return { error: "You do not own this listing." };

  return { data: listing };
}

export async function prepareBoostCheckout(
  listingId: string,
  position: number,
  userId: string
): Promise<ServiceResult<BoostCheckoutPreview>> {
  const productId = await getHomepageProductId();
  if (!productId) return { error: "Boost product unavailable." };

  const listingResult = await validateListingOwnership(listingId, userId);
  if ("error" in listingResult) return { error: listingResult.error };

  const bidResult = await BoostService.calculateNextBid({ productId, position });
  if ("error" in bidResult) return { error: bidResult.error };

  const { minimumBid } = bidResult.data;
  const supabase = await createClient();
  const provider = getBoostPaymentProvider();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + CHECKOUT_TTL_MINUTES);

  const { data: product } = await supabase
    .from("boost_products")
    .select("name")
    .eq("id", productId)
    .maybeSingle();

  const { data: payment, error } = await supabase
    .from("boost_payments")
    .insert({
      user_id: userId,
      listing_id: listingId,
      product_id: productId,
      position,
      amount: minimumBid,
      provider: provider.name,
      status: "pending",
      expires_at: expiresAt.toISOString(),
    })
    .select("id, amount, position, expires_at")
    .single();

  if (error || !payment) {
    return { error: error?.message ?? "Failed to create checkout session." };
  }

  return {
    data: {
      checkoutId: payment.id,
      listingId,
      listingTitle: listingResult.data.title,
      productName: product?.name ?? "Boost",
      position: toNumber(payment.position),
      amount: toNumber(payment.amount),
      expiresAt: payment.expires_at as string,
    },
  };
}

export async function completeBoostCheckout(
  checkoutId: string,
  userId: string
): Promise<ServiceResult<{ campaignId: string }>> {
  const supabase = await createClient();
  const provider = getBoostPaymentProvider();

  const { data: payment, error: paymentError } = await supabase
    .from("boost_payments")
    .select("*")
    .eq("id", checkoutId)
    .maybeSingle();

  if (paymentError || !payment) {
    return { error: "Checkout session not found." };
  }

  if (payment.user_id !== userId) {
    return { error: "Unauthorized checkout session." };
  }

  if (payment.status === "succeeded" && payment.campaign_id) {
    return { data: { campaignId: payment.campaign_id as string } };
  }

  if (payment.status !== "pending") {
    return { error: "Checkout session is no longer valid." };
  }

  const confirmation = await provider.confirmPayment(checkoutId, userId);
  if (!confirmation.success) {
    await supabase
      .from("boost_payments")
      .update({ status: "failed" })
      .eq("id", checkoutId);

    return { error: confirmation.error };
  }

  const validation = await BoostBiddingService.validatePaymentAmount(
    payment.product_id as string,
    toNumber(payment.position),
    toNumber(payment.amount)
  );

  if ("error" in validation) {
    return { error: validation.error };
  }

  const fulfillResult = await fulfillBoostCampaign({
    listingId: payment.listing_id as string,
    userId,
    productId: payment.product_id as string,
    position: toNumber(payment.position),
    amount: toNumber(payment.amount),
  });

  if ("error" in fulfillResult) {
    return { error: fulfillResult.error };
  }

  await supabase
    .from("boost_payments")
    .update({
      campaign_id: fulfillResult.data.id,
      provider_payment_id: confirmation.providerPaymentId,
      status: "succeeded",
      completed_at: new Date().toISOString(),
    })
    .eq("id", checkoutId);

  revalidateBoostSurfaces(payment.listing_id as string);
  if (fulfillResult.data.outbidListingId) {
    revalidateBoostSurfaces(fulfillResult.data.outbidListingId);
  }

  return { data: { campaignId: fulfillResult.data.id } };
}

async function fulfillBoostCampaign(params: {
  listingId: string;
  userId: string;
  productId: string;
  position: number;
  amount: number;
}): Promise<
  ServiceResult<{
    id: string;
    outbidListingId: string | null;
  }>
> {
  const bidResult = await BoostBiddingService.placeBid({
    listingId: params.listingId,
    userId: params.userId,
    productId: params.productId,
    position: params.position,
    amount: params.amount,
  });

  if ("error" in bidResult) {
    return { error: bidResult.error };
  }

  if (bidResult.data.outbidUserId && bidResult.data.outbidListingId) {
    await notifyBoostOutbid({
      userId: bidResult.data.outbidUserId,
      listingId: bidResult.data.outbidListingId,
      position: bidResult.data.position,
      winningAmount: bidResult.data.winningAmount,
    });
  }

  return {
    data: {
      id: bidResult.data.campaignId,
      outbidListingId: bidResult.data.outbidListingId,
    },
  };
}
