"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  completeBoostCheckoutAction,
  prepareBoostCheckoutAction,
} from "@/actions/boost.actions";
import type { BoostCheckoutPreview } from "@/lib/payments/boost/types";

interface UseBoostCheckoutOptions {
  onSuccess?: (result: { campaignId: string }, checkout: BoostCheckoutPreview) => void;
}

export function useBoostCheckout(options?: UseBoostCheckoutOptions) {
  const router = useRouter();
  const [checkout, setCheckout] = useState<BoostCheckoutPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const openCheckout = useCallback((listingId: string, position: number) => {
    setIsPreparing(true);
    setError(null);

    void (async () => {
      const result = await prepareBoostCheckoutAction(listingId, position);
      setIsPreparing(false);

      if ("error" in result) {
        setError(result.error);
        setCheckout(null);
        return;
      }
      setCheckout(result.data);
    })();
  }, []);

  const closeCheckout = useCallback(() => {
    if (isPaying) return;
    setCheckout(null);
    setError(null);
  }, [isPaying]);

  const confirmPayment = useCallback(async (): Promise<
    { campaignId: string } | { error: string } | null
  > => {
    if (!checkout) return null;

    setIsPaying(true);
    setError(null);

    const checkoutSnapshot = checkout;
    const result = await completeBoostCheckoutAction(checkout.checkoutId);

    setIsPaying(false);

    if ("error" in result) {
      setError(result.error);
      return { error: result.error };
    }

    setCheckout(null);
    router.refresh();
    options?.onSuccess?.(result, checkoutSnapshot);
    return { campaignId: result.campaignId };
  }, [checkout, router, options]);

  return {
    checkout,
    error,
    isPreparing,
    isPaying,
    openCheckout,
    closeCheckout,
    confirmPayment,
    clearError: () => setError(null),
  };
}
