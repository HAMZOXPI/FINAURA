"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Rocket, Sparkles } from "lucide-react";
import { BoostCheckoutModal } from "@/components/boost/boost-checkout-modal";
import { BoostMarketplaceModal } from "@/components/boost/boost-marketplace-modal";
import { useBoostCheckout } from "@/hooks/use-boost-checkout";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface BoostListingTriggerProps {
  listingId: string;
  listingTitle: string;
  size?: "sm" | "md";
  className?: string;
  autoOpenCheckoutPosition?: number;
}

export function BoostListingTrigger({
  listingId,
  listingTitle,
  size = "sm",
  className,
  autoOpenCheckoutPosition,
}: BoostListingTriggerProps) {
  const { t } = useTranslation();
  const boost = t.boost;
  const [open, setOpen] = useState(false);
  const autoOpenedRef = useRef(false);

  const {
    checkout,
    error: checkoutError,
    isPaying,
    openCheckout,
    closeCheckout,
    confirmPayment,
    clearError,
  } = useBoostCheckout();

  useEffect(() => {
    if (!autoOpenCheckoutPosition || autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    clearError();
    openCheckout(listingId, autoOpenCheckoutPosition);
  }, [autoOpenCheckoutPosition, listingId, openCheckout, clearError]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={boost.buttonTitle}
        className={cn(
          "group/boost-cta relative w-full min-w-0 overflow-hidden rounded-2xl text-start",
          "min-h-[50px] md:min-h-[54px]",
          "border border-amber-200/70",
          "bg-gradient-to-r from-[#FFD66B] via-[#F7B733] to-[#D97706]",
          "shadow-[0_3px_14px_rgba(217,119,6,0.21),0_0_22px_rgba(255,214,107,0.14)]",
          "transition-all duration-[250ms] ease-out",
          "hover:-translate-y-[3px]",
          "hover:border-amber-100/90",
          "hover:bg-gradient-to-r hover:from-[#FFE082] hover:via-[#FBBF24] hover:to-[#EA580C]",
          "hover:shadow-[0_8px_26px_rgba(217,119,6,0.29),0_0_35px_rgba(255,214,107,0.26)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/80 focus-visible:ring-offset-2",
          className
        )}
      >
        <span
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.35),transparent_55%)]"
          aria-hidden
        />

        <span
          className={cn(
            "absolute end-2.5 top-0 z-10 hidden rounded-b-md px-1.5 py-px md:block",
            "bg-gradient-to-r from-amber-950/90 to-amber-900/90",
            "text-[8px] font-bold uppercase tracking-[0.12em] text-amber-100",
            "shadow-[0_3px_10px_rgba(120,53,15,0.2)] ring-1 ring-amber-300/30"
          )}
        >
          {boost.buttonBadge}
        </span>

        <span className="relative flex h-full min-h-[inherit] items-center gap-2.5 px-3 py-2 md:gap-3 md:px-3.5 md:pe-4">
          <span
            className={cn(
              "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
              "bg-amber-950/8 ring-1 ring-amber-950/10",
              size === "md" && "md:h-[38px] md:w-[38px]"
            )}
          >
            <Rocket
              className={cn(
                "h-[18px] w-[18px] text-amber-950 transition-transform duration-[250ms] ease-out",
                "group-hover/boost-cta:rotate-[5deg]",
                size === "md" && "md:h-5 md:w-5"
              )}
              strokeWidth={2.25}
            />
            <Sparkles
              className="absolute -end-px -top-px h-3 w-3 text-amber-900/80 transition-transform duration-[250ms] group-hover/boost-cta:scale-110"
              strokeWidth={2.25}
            />
          </span>

          <span className="min-w-0 flex-1 md:pe-5">
            <span className="block truncate whitespace-nowrap text-[13px] font-bold leading-tight text-amber-950 md:text-sm">
              {boost.buttonTitle}
            </span>
            <span className="mt-px block truncate whitespace-nowrap text-[10px] font-medium leading-snug text-amber-950/60 md:text-[11px]">
              {boost.buttonSubtitle}
            </span>
          </span>

          <ArrowRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-amber-950/85 transition-transform duration-[250ms] ease-out",
              "group-hover/boost-cta:translate-x-1 md:h-4 md:w-4"
            )}
            strokeWidth={2.5}
          />
        </span>
      </button>

      <BoostMarketplaceModal
        open={open}
        listingId={listingId}
        listingTitle={listingTitle}
        onClose={() => setOpen(false)}
      />

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
