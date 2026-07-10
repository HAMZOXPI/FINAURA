import { createClient } from "@/lib/supabase/server";
import type { BoostPaymentProvider, BoostPaymentResult } from "@/lib/payments/boost/types";

export const fakeBoostPaymentProvider: BoostPaymentProvider = {
  name: "fake",

  async confirmPayment(checkoutId: string, userId: string): Promise<BoostPaymentResult> {
    const supabase = await createClient();

    const { data: payment, error } = await supabase
      .from("boost_payments")
      .select("id, status, user_id, expires_at")
      .eq("id", checkoutId)
      .maybeSingle();

    if (error || !payment) {
      return { success: false, error: "Checkout session not found." };
    }

    if (payment.user_id !== userId) {
      return { success: false, error: "Unauthorized checkout session." };
    }

    if (payment.status !== "pending") {
      return { success: false, error: "Checkout session is no longer valid." };
    }

    if (new Date(payment.expires_at as string).getTime() < Date.now()) {
      return { success: false, error: "Checkout session expired." };
    }

    return { success: true, providerPaymentId: `fake_pay_${checkoutId}` };
  },
};
