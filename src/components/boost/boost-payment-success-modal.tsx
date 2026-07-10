"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle2, LayoutDashboard, Sparkles, X } from "lucide-react";
import { GiftConfetti } from "@/components/gifts/gift-confetti";
import { BoostPaymentReceipt } from "@/components/boost/boost-payment-receipt";
import {
  HOMEPAGE_SPOTLIGHT_DURATION_DAYS,
  addDaysFromNow,
  formatReceiptId,
} from "@/lib/boost/ui";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export interface BoostPaymentSuccessData {
  checkoutId: string;
  listingId: string;
  listingTitle: string;
  productName: string;
  position: number;
  amount: number;
  campaignId?: string;
}

interface BoostPaymentSuccessModalProps {
  open: boolean;
  data: BoostPaymentSuccessData | null;
  onClose: () => void;
}

export function BoostPaymentSuccessModal({
  open,
  data,
  onClose,
}: BoostPaymentSuccessModalProps) {
  const { t, locale } = useTranslation();

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!data) return null;

  const expirationDate = addDaysFromNow(HOMEPAGE_SPOTLIGHT_DURATION_DAYS);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[420] flex items-end justify-center p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <GiftConfetti active />

          <motion.button
            type="button"
            aria-label={t.boost.close}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative z-10 flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/20 bg-gradient-to-b from-white via-white to-brand-50/30 shadow-[0_32px_100px_rgba(0,0,0,0.28)] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute end-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-surface-100 text-surface-500 transition-colors hover:bg-surface-200"
              aria-label={t.boost.close}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="overflow-y-auto px-6 pb-8 pt-10 sm:px-8">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30"
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </motion.div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl"
                >
                  {t.boost.successModalTitle}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 }}
                  className="mt-2 text-base text-surface-600"
                >
                  {t.boost.successModalSubtitle}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-8 grid gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-4"
              >
                <SuccessRow
                  label={t.boost.summaryPosition}
                  value={`#${data.position}`}
                />
                <SuccessRow
                  label={t.boost.summaryDuration}
                  value={t.boost.summaryDurationDays.replace(
                    "{days}",
                    String(HOMEPAGE_SPOTLIGHT_DURATION_DAYS)
                  )}
                />
                <SuccessRow
                  label={t.boost.successExpiration}
                  value={formatDate(expirationDate.toISOString(), locale)}
                  icon={<Calendar className="h-4 w-4 text-amber-600" />}
                />
                <SuccessRow
                  label={t.boost.receiptAmount}
                  value={formatPrice(data.amount, undefined, locale)}
                  highlight
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
                className="mt-6"
              >
                <BoostPaymentReceipt
                  compact
                  receipt={{
                    id: data.checkoutId,
                    productName: data.productName,
                    listingTitle: data.listingTitle,
                    amount: data.amount,
                    position: data.position,
                    paymentMethod: t.boost.checkoutCardMasked,
                    createdAt: new Date().toISOString(),
                    status: "paid",
                  }}
                />
                <p className="mt-2 text-center text-xs text-surface-400">
                  {formatReceiptId(data.checkoutId)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Button
                  href={`/properties/${data.listingId}`}
                  className="flex-1 shadow-md shadow-brand-500/15 transition-transform hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4 w-4" />
                  {t.boost.successViewListing}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/dashboard/boost" variant="outline" className="flex-1">
                  <LayoutDashboard className="h-4 w-4" />
                  {t.boost.successGoDashboard}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessRow({
  label,
  value,
  highlight = false,
  icon,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-surface-600">
        {icon}
        {label}
      </span>
      <span
        className={`font-semibold ${highlight ? "text-lg text-brand-700" : "text-surface-900"}`}
      >
        {value}
      </span>
    </div>
  );
}
