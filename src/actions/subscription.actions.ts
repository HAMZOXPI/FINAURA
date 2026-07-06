"use server";

import { createCheckoutSession } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function startSubscriptionCheckout(planSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to subscribe." };

  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("slug", planSlug)
    .single();

  if (!plan || !(plan as { stripe_price_id: string | null }).stripe_price_id) {
    return {
      error:
        planSlug === "free"
          ? "You're already on the free plan."
          : "Stripe billing is not yet configured for this plan. Contact support.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return createCheckoutSession({
    priceId: (plan as { stripe_price_id: string }).stripe_price_id,
    userId: user.id,
    userEmail: user.email ?? "",
    successUrl: `${siteUrl}/dashboard/settings?success=true`,
    cancelUrl: `${siteUrl}/pricing?canceled=true`,
  });
}
