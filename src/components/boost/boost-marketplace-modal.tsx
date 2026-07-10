"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Rocket, X } from "lucide-react";
import { fetchBoostMarketplaceData } from "@/actions/boost.actions";
import { BoostCheckoutModal } from "@/components/boost/boost-checkout-modal";
import { BoostPositionSlot } from "@/components/boost/boost-position-slot";
import { useBoostCheckout } from "@/hooks/use-boost-checkout";
import type { BoostMarketplaceData } from "@/types/boost";
import { useTranslation } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface BoostMarketplaceModalProps {
  open: boolean;
  listingId: string;
  listingTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BoostMarketplaceModal({
  open,
  listingId,
  listingTitle,
  onClose,
  onSuccess,
}: BoostMarketplaceModalProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<BoostMarketplaceData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [boostingPosition, setBoostingPosition] = useState<number | null>(null);

  const {
    checkout,
    error: checkoutError,
    isPreparing,
    isPaying,
    openCheckout,
    closeCheckout,
    confirmPayment,
    clearError,
  } = useBoostCheckout({
    onSuccess: () => {
      onSuccess?.();
      loadData();
    },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const result = await fetchBoostMarketplaceData(listingId);
    if ("error" in result) {
      setLoadError(result.error);
      setData(null);
    } else {
      setData(result.data);
    }
    setIsLoading(false);
  }, [listingId]);

  useEffect(() => {
    if (!open) return;
    loadData();
    setLoadError(null);
    clearError();
  }, [open, loadData, clearError]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !checkout && !isPaying) onClose();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, checkout, isPaying, onClose]);

  const handleBoost = (position: number) => {
    setBoostingPosition(position);
    clearError();
    openCheckout(listingId, position);
  };

  useEffect(() => {
    if (!checkout && !isPreparing && boostingPosition !== null) {
      setBoostingPosition(null);
    }
  }, [checkout, isPreparing, boostingPosition]);

  const displayError = loadError ?? checkoutError;

  return (
    <>
      <AnimatePresence>
        {open && !checkout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="boost-marketplace-title"
          >
            <motion.button
              type="button"
              aria-label={t.boost.close}
              className="absolute inset-0 bg-surface-950/75 backdrop-blur-xl"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-gradient-to-b from-surface-900 via-[#0c1222] to-black shadow-[0_32px_100px_rgba(0,0,0,0.65)] ring-1 ring-white/10 sm:max-w-4xl sm:rounded-3xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.18),transparent_70%)]" />

              <div className="relative shrink-0 border-b border-white/10 px-5 py-5 sm:px-7 sm:py-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
                  aria-label={t.boost.close}
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-3 pe-10">
                  <motion.div
                    animate={{ rotate: [0, -6, 6, 0], scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/30"
                  >
                    <Rocket className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h2
                      id="boost-marketplace-title"
                      className="text-xl font-bold tracking-tight text-white sm:text-2xl"
                    >
                      {t.boost.modalTitle}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-white/55">{listingTitle}</p>
                    <p className="mt-2 text-xs font-medium tracking-wide text-white/35 uppercase">
                      {t.boost.modalSubtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">
                {isLoading && !data && (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "animate-pulse rounded-2xl border border-white/5 bg-white/5",
                          index === 0 ? "h-44" : "h-40"
                        )}
                      />
                    ))}
                  </div>
                )}

                {displayError && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                  >
                    {displayError}
                  </motion.div>
                )}

                {data && (
                  <div className="space-y-4 pb-2">
                    {data.positions.map((slot, index) => (
                      <BoostPositionSlot
                        key={slot.position}
                        slot={slot}
                        index={index}
                        isBoosting={isPreparing}
                        boostingPosition={boostingPosition}
                        onBoost={handleBoost}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BoostCheckoutModal
        open={Boolean(checkout)}
        checkout={checkout}
        isPaying={isPaying}
        error={checkoutError}
        onClose={closeCheckout}
        onConfirmPayment={confirmPayment}
      />
    </>
  );
}
