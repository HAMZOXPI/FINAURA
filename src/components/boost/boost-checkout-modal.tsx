"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import type { BoostCheckoutPreview } from "@/lib/payments/boost/types";
import {
  BoostOrderSummary,
  PaymentMethodLogos,
  SecurePaymentBadges,
} from "@/components/boost/boost-checkout-ui";
import {
  BoostPaymentSuccessModal,
  type BoostPaymentSuccessData,
} from "@/components/boost/boost-payment-success-modal";
import { sleep } from "@/lib/boost/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

type CheckoutPhase = "form" | "processing" | "success";

interface BoostCheckoutModalProps {
  open: boolean;
  checkout: BoostCheckoutPreview | null;
  isPaying: boolean;
  error: string | null;
  onClose: () => void;
  onConfirmPayment: () => Promise<{ campaignId: string } | { error: string } | null>;
}

export function BoostCheckoutModal({
  open,
  checkout,
  isPaying,
  error,
  onClose,
  onConfirmPayment,
}: BoostCheckoutModalProps) {
  const { t, locale } = useTranslation();
  const [phase, setPhase] = useState<CheckoutPhase>("form");
  const [successData, setSuccessData] = useState<BoostPaymentSuccessData | null>(null);

  useEffect(() => {
    if (open) {
      setPhase("form");
      setSuccessData(null);
    }
  }, [open, checkout?.checkoutId]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && phase === "form") onClose();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, phase, onClose]);

  const handlePay = useCallback(async () => {
    if (!checkout || phase !== "form") return;

    setPhase("processing");
    await sleep(1800);

    const result = await onConfirmPayment();

    if (!result || "error" in result) {
      setPhase("form");
      return;
    }

    setSuccessData({
      checkoutId: checkout.checkoutId,
      listingId: checkout.listingId,
      listingTitle: checkout.listingTitle,
      productName: checkout.productName,
      position: checkout.position,
      amount: checkout.amount,
      campaignId: result.campaignId,
    });
    setPhase("success");
  }, [checkout, phase, onConfirmPayment]);

  const handleCloseSuccess = useCallback(() => {
    setSuccessData(null);
    onClose();
  }, [onClose]);

  if (!checkout) return null;

  const isLocked = phase === "processing" || isPaying;

  return (
    <>
      <AnimatePresence>
        {open && phase !== "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-end justify-center sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="boost-checkout-title"
          >
            <motion.button
              type="button"
              aria-label={t.boost.close}
              className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm"
              onClick={isLocked ? undefined : onClose}
              disabled={isLocked}
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="relative z-10 flex max-h-[96vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] sm:max-w-2xl sm:rounded-3xl sm:shadow-2xl lg:max-w-3xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Header */}
              <div className="relative border-b border-surface-100 px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLocked}
                  className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 disabled:opacity-40"
                  aria-label={t.boost.close}
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 pe-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/25">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 id="boost-checkout-title" className="text-lg font-bold text-surface-900">
                      {t.boost.checkoutTitle}
                    </h2>
                    <p className="text-sm text-surface-500">{t.boost.checkoutSubtitle}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <SecurePaymentBadges />
                </div>
              </div>

              <div className="relative flex-1 overflow-y-auto">
                {phase === "processing" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/92 backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Loader2 className="h-12 w-12 text-brand-600" />
                    </motion.div>
                    <p className="mt-5 text-base font-semibold text-surface-900">
                      {t.boost.checkoutProcessing}
                    </p>
                    <p className="mt-1 text-sm text-surface-500">{t.boost.checkoutProcessingHint}</p>
                  </motion.div>
                )}

                <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
                  <div className="order-2 lg:order-1">
                    <BoostOrderSummary checkout={checkout} />

                    <div className="mt-4 hidden sm:block">
                      <PaymentMethodLogos />
                    </div>
                  </div>

                  <div className="order-1 space-y-4 lg:order-2">
                    <div>
                      <p className="mb-3 text-sm font-semibold text-surface-900">
                        {t.boost.checkoutPaymentDetails}
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-surface-500">
                            {t.boost.checkoutCardNumber}
                          </label>
                          <Input
                            readOnly
                            value="4242 4242 4242 4242"
                            className="h-12 border-surface-200 bg-surface-50 text-base tracking-widest"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-surface-500">
                              {t.boost.checkoutExpiry}
                            </label>
                            <Input readOnly value="12 / 30" className="h-12 border-surface-200 bg-surface-50" />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-surface-500">
                              {t.boost.checkoutCvc}
                            </label>
                            <Input readOnly value="123" className="h-12 border-surface-200 bg-surface-50" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="sm:hidden">
                      <PaymentMethodLogos />
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-xs text-surface-600">
                      <Lock className="h-4 w-4 shrink-0 text-emerald-600" />
                      {t.boost.checkoutSecureNote}
                    </div>

                    {error && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <Button
                      type="button"
                      size="lg"
                      disabled={isLocked}
                      onClick={handlePay}
                      className="h-14 w-full text-base font-semibold shadow-lg shadow-brand-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/25 active:translate-y-0"
                    >
                      {t.boost.checkoutPayButton.replace(
                        "{amount}",
                        formatPrice(checkout.amount, undefined, locale)
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t border-surface-100 bg-surface-50/80 px-5 py-3 text-center sm:px-6">
                <p className="flex items-center justify-center gap-1.5 text-xs text-surface-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-500" />
                  {t.boost.checkoutPoweredBy}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BoostPaymentSuccessModal
        open={phase === "success" && Boolean(successData)}
        data={successData}
        onClose={handleCloseSuccess}
      />
    </>
  );
}
