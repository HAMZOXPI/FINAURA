"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";
import type { BoostCheckoutPreview } from "@/lib/payments/boost/types";
import { HOMEPAGE_SPOTLIGHT_DURATION_DAYS } from "@/lib/boost/ui";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export function PaymentMethodLogos() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <LogoChip label="Visa" className="bg-[#1A1F71] text-white" />
      <LogoChip label="MC" className="bg-[#EB001B] text-white" subtitle="Mastercard" />
      <LogoChip label=" Pay" className="bg-black text-white" prefix="Apple" />
      <LogoChip label=" Pay" className="bg-white text-surface-800 ring-1 ring-surface-200" prefix="G" />
    </div>
  );
}

function LogoChip({
  label,
  className,
  prefix,
  subtitle,
}: {
  label: string;
  className: string;
  prefix?: string;
  subtitle?: string;
}) {
  return (
    <div
      title={subtitle}
      className={`inline-flex h-7 min-w-[2.75rem] items-center justify-center rounded-md px-2 text-[10px] font-bold tracking-wide ${className}`}
    >
      {prefix && <span className="opacity-90">{prefix}</span>}
      {label}
    </div>
  );
}

export function SecurePaymentBadges() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
        <Lock className="h-3 w-3" />
        SSL
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-50 px-2.5 py-1 text-[11px] font-semibold text-surface-600 ring-1 ring-surface-200">
        <ShieldCheck className="h-3 w-3 text-brand-600" />
        {t.boost.checkoutSecureBadge}
      </span>
    </div>
  );
}

interface BoostOrderSummaryProps {
  checkout: BoostCheckoutPreview;
}

export function BoostOrderSummary({ checkout }: BoostOrderSummaryProps) {
  const { t, locale } = useTranslation();
  const vat = 0;
  const total = checkout.amount;

  const rows = [
    { label: t.boost.summaryProduct, value: checkout.productName },
    {
      label: t.boost.summaryDuration,
      value: t.boost.summaryDurationDays.replace(
        "{days}",
        String(HOMEPAGE_SPOTLIGHT_DURATION_DAYS)
      ),
    },
    {
      label: t.boost.summaryPosition,
      value: `#${checkout.position}`,
    },
    {
      label: t.boost.summaryPrice,
      value: formatPrice(checkout.amount, undefined, locale),
      bold: true,
    },
    {
      label: t.boost.summaryVat,
      value: formatPrice(vat, undefined, locale),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-surface-200 bg-gradient-to-br from-surface-50 to-white shadow-sm"
    >
      <div className="border-b border-surface-100 bg-white/80 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">
          {t.boost.summaryTitle}
        </p>
      </div>
      <div className="space-y-0 divide-y divide-surface-100 px-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-3 text-sm">
            <span className="text-surface-500">{row.label}</span>
            <span
              className={row.bold ? "font-bold text-surface-900" : "font-medium text-surface-800"}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-surface-200 bg-brand-50/40 px-4 py-3.5">
        <span className="text-sm font-semibold text-surface-700">{t.boost.summaryTotal}</span>
        <span className="text-lg font-bold text-brand-700">
          {formatPrice(total, undefined, locale)}
        </span>
      </div>
      <div className="border-t border-surface-100 px-4 py-2.5">
        <p className="truncate text-xs text-surface-500">{checkout.listingTitle}</p>
      </div>
    </motion.div>
  );
}

export function CheckoutShimmer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}
