/**
 * Stripe webhook notification hooks.
 * Call these from handleStripeWebhook when Stripe billing is implemented.
 * Does not modify payment/subscription business logic — notifications only.
 */
import {
  notifyPaymentConfirmed,
  notifyPremiumActivated,
  notifyPremiumExpired,
  notifySubscriptionExpired,
  notifySubscriptionRenewed,
} from "@/lib/notifications/dispatch";

export async function onCheckoutCompleted(params: {
  userId: string;
  amount: string;
  planName: string;
  paymentId: string;
}) {
  await notifyPaymentConfirmed(params.userId, params.amount, params.paymentId);
  await notifyPremiumActivated(params.userId, params.planName);
}

export async function onSubscriptionRenewed(params: { userId: string; planName: string; invoiceId: string }) {
  await notifySubscriptionRenewed(params.userId, params.planName);
  await notifyPaymentConfirmed(params.userId, "—", params.invoiceId);
}

export async function onSubscriptionExpired(params: { userId: string; planName: string }) {
  await notifySubscriptionExpired(params.userId, params.planName);
  await notifyPremiumExpired(params.userId);
}
