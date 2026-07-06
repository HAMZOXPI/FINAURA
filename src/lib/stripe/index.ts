/**
 * Stripe integration architecture (preparation only).
 *
 * To enable billing:
 * 1. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env
 * 2. Install stripe: npm install stripe @stripe/stripe-js
 * 3. Create webhook route at /api/webhooks/stripe
 * 4. Map stripe_price_id on subscription_plans rows
 */

export const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY ?? "",
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  isConfigured: Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ),
};

export type StripeCheckoutParams = {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
};

/**
 * Creates a Stripe Checkout session for subscription upgrade.
 * Implement when STRIPE_SECRET_KEY is available.
 */
export async function createCheckoutSession(
  _params: StripeCheckoutParams
): Promise<{ url?: string; error?: string }> {
  if (!STRIPE_CONFIG.isConfigured) {
    return { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to enable billing." };
  }

  // Placeholder — wire up with `stripe` SDK:
  // const stripe = new Stripe(STRIPE_CONFIG.secretKey);
  // const session = await stripe.checkout.sessions.create({ ... });
  // return { url: session.url };
  return { error: "Stripe checkout not yet implemented. Configure webhook and SDK." };
}

/**
 * Handles Stripe webhook events (subscription.created, subscription.updated, etc.)
 * Route: POST /api/webhooks/stripe
 */
export type StripeWebhookEvent =
  | "checkout.session.completed"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_failed";

export async function handleStripeWebhook(
  _payload: string,
  _signature: string
): Promise<{ received: boolean; error?: string }> {
  if (!STRIPE_CONFIG.webhookSecret) {
    return { received: false, error: "Webhook secret not configured" };
  }
  return { received: true };
}
