import type { BoostPaymentProvider, BoostPaymentProviderName } from "@/lib/payments/boost/types";
import { fakeBoostPaymentProvider } from "@/lib/payments/boost/fake-provider";
import { stripeBoostPaymentProvider } from "@/lib/payments/boost/stripe-provider";

export const BOOST_PAYMENT_PROVIDER = (
  process.env.BOOST_PAYMENT_PROVIDER ?? "fake"
) as BoostPaymentProviderName;

export function getBoostPaymentProvider(): BoostPaymentProvider {
  if (BOOST_PAYMENT_PROVIDER === "stripe") {
    return stripeBoostPaymentProvider;
  }
  return fakeBoostPaymentProvider;
}
