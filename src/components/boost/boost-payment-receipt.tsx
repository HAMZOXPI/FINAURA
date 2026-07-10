"use client";

import { motion } from "framer-motion";
import { CreditCard, FileText } from "lucide-react";
import type { BoostCenterPayment } from "@/types/boost";
import { formatReceiptId } from "@/lib/boost/ui";
import { BoostStatusBadge } from "@/components/boost/boost-status-badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface BoostPaymentReceiptProps {
  receipt: {
    id: string;
    productName: string;
    listingTitle: string;
    amount: number;
    position: number;
    paymentMethod: string;
    createdAt: string;
    status: "paid" | "pending" | "failed";
  };
  compact?: boolean;
}

export function BoostPaymentReceipt({ receipt, compact = false }: BoostPaymentReceiptProps) {
  const { t, locale } = useTranslation();
  const receiptId = formatReceiptId(receipt.id);

  const rows = [
    { label: t.boost.receiptId, value: receiptId },
    { label: t.boost.receiptProduct, value: receipt.productName },
    { label: t.boost.receiptListing, value: receipt.listingTitle },
    {
      label: t.boost.receiptAmount,
      value: formatPrice(receipt.amount, undefined, locale),
      highlight: true,
    },
    { label: t.boost.receiptMethod, value: receipt.paymentMethod },
    { label: t.boost.receiptDate, value: formatDate(receipt.createdAt, locale) },
    {
      label: t.boost.receiptStatus,
      value: receipt.status === "paid" ? t.boost.receiptPaid : receipt.status,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm ${
        compact ? "" : "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
      }`}
    >
      <div className="flex items-center gap-3 border-b border-surface-100 bg-gradient-to-r from-surface-50 to-white px-4 py-3.5 sm:px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-surface-900">{t.boost.receiptTitle}</p>
          <p className="text-xs text-surface-500">{receiptId}</p>
        </div>
        {receipt.status === "paid" && (
          <BoostStatusBadge status="active" className="ms-auto" />
        )}
      </div>

      <div className={`grid gap-0 divide-y divide-surface-100 ${compact ? "text-sm" : ""}`}>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 px-4 py-3 sm:px-5"
          >
            <span className="shrink-0 text-surface-500">{row.label}</span>
            <span
              className={`text-end font-medium ${
                row.highlight ? "font-bold text-brand-700" : "text-surface-800"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
        {!compact && (
          <div className="flex items-center justify-between gap-4 bg-surface-50/80 px-4 py-3 sm:px-5">
            <span className="text-surface-500">{t.boost.summaryPosition}</span>
            <span className="font-semibold text-surface-900">#{receipt.position}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function boostPaymentToReceipt(payment: BoostCenterPayment) {
  return {
    id: payment.id,
    productName: payment.productName,
    listingTitle: payment.listingTitle,
    amount: payment.amount,
    position: payment.position,
    paymentMethod: payment.paymentMethod,
    createdAt: payment.completedAt ?? payment.createdAt,
    status:
      payment.status === "succeeded"
        ? ("paid" as const)
        : payment.status === "pending"
          ? ("pending" as const)
          : ("failed" as const),
  };
}

export function PaymentMethodDisplay() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-surface-700">
      <CreditCard className="h-4 w-4 text-surface-400" />
      {t.boost.checkoutCardMasked}
    </span>
  );
}
