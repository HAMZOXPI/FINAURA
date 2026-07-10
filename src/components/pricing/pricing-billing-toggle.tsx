"use client";

import { motion } from "framer-motion";
import type { BillingInterval } from "@/lib/pricing/pricing-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PricingBillingToggleProps {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}

export function PricingBillingToggle({ interval, onChange }: PricingBillingToggleProps) {
  const { t } = useTranslation();
  const billing = t.pricing.billing;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative inline-flex rounded-2xl border border-surface-200/80 bg-surface-100/80 p-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => onChange("monthly")}
          className={cn(
            "relative z-10 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            interval === "monthly" ? "text-surface-900" : "text-surface-500 hover:text-surface-700"
          )}
        >
          {billing.monthly}
          {interval === "monthly" && (
            <motion.span
              layoutId="billing-pill"
              className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm ring-1 ring-surface-200/80"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => onChange("yearly")}
          className={cn(
            "relative z-10 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            interval === "yearly" ? "text-surface-900" : "text-surface-500 hover:text-surface-700"
          )}
        >
          {billing.yearly}
          {interval === "yearly" && (
            <motion.span
              layoutId="billing-pill"
              className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm ring-1 ring-surface-200/80"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
        </button>
      </div>

      {interval === "yearly" && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/80"
        >
          {billing.yearlyComingSoon}
        </motion.p>
      )}
    </div>
  );
}
