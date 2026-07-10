import type { BoostPaymentProvider, BoostPaymentResult } from "@/lib/payments/boost/types";

export const stripeBoostPaymentProvider: BoostPaymentProvider = {
  name: "stripe",

  async confirmPayment(): Promise<BoostPaymentResult> {
    return {
      success: false,
      error: "Stripe boost payments are confirmed via webhook. Configure BOOST_PAYMENT_PROVIDER=stripe and wire the webhook.",
    };
  },
};
