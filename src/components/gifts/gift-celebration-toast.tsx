"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Gift, X } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

interface GiftCelebrationToastProps {
  visible: boolean;
  giftName: string;
  onClose: () => void;
}

export function GiftCelebrationToast({ visible, giftName, onClose }: GiftCelebrationToastProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-6 end-6 z-[260] flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/95 px-5 py-4 shadow-2xl backdrop-blur-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-950">
              <Gift className="h-4 w-4" />
              {t.giftCelebration.toastTitle}
            </p>
            <p className="mt-0.5 text-sm text-emerald-900/90">
              {t.giftCelebration.toastBody.replace("{giftName}", giftName)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.giftCelebration.close}
            className="shrink-0 rounded-lg p-1 text-emerald-700/70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
