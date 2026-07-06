"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Infinity as InfinityIcon, Sparkles, Star, X } from "lucide-react";
import {
  clearActiveBanner,
  loadActiveBanner,
  type ActiveGiftBanner,
} from "@/lib/gifts/celebration-config";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export function GiftStatusBanner() {
  const { t } = useTranslation();
  const [banner, setBanner] = useState<ActiveGiftBanner | null>(null);

  useEffect(() => {
    setBanner(loadActiveBanner());

    const handleCelebration = () => {
      setBanner(loadActiveBanner());
    };

    window.addEventListener("finaura-gift-banner-update", handleCelebration);
    return () => window.removeEventListener("finaura-gift-banner-update", handleCelebration);
  }, []);

  const dismiss = () => {
    clearActiveBanner();
    setBanner(null);
  };

  if (!banner) return null;

  const isPremium = banner.bannerKey === "premiumActive";
  const isUnlimited = banner.bannerKey === "unlimitedActive";
  const label = isPremium
    ? t.giftCelebration.bannerPremium
    : isUnlimited
      ? t.giftCelebration.bannerUnlimited
      : null;

  if (!label) return null;

  const Icon = isPremium ? Star : InfinityIcon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        className="mb-6 overflow-hidden"
      >
        <div
          className={cn(
            "relative flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
            isPremium
              ? "border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50"
              : "border-violet-200/80 bg-gradient-to-r from-violet-50 via-indigo-50/80 to-violet-50"
          )}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                boxShadow: isPremium
                  ? [
                      "0 0 0 rgba(245,158,11,0)",
                      "0 0 20px rgba(245,158,11,0.35)",
                      "0 0 0 rgba(245,158,11,0)",
                    ]
                  : [
                      "0 0 0 rgba(139,92,246,0)",
                      "0 0 20px rgba(139,92,246,0.35)",
                      "0 0 0 rgba(139,92,246,0)",
                    ],
              }}
              transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
                isPremium
                  ? "bg-amber-100 text-amber-700 ring-amber-200/80"
                  : "bg-violet-100 text-violet-700 ring-violet-200/80"
              )}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-surface-900">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                {label}
              </p>
              <p className="mt-0.5 text-xs text-surface-600">{t.giftCelebration.bannerSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={isUnlimited ? "/dashboard/new" : "/dashboard/settings"}
              className={cn(
                "inline-flex h-9 items-center rounded-xl px-4 text-xs font-semibold transition-colors",
                isPremium
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-violet-600 text-white hover:bg-violet-700"
              )}
            >
              {isUnlimited ? t.giftCelebration.ctaStartPublishing : t.giftCelebration.ctaViewBenefits}
            </Link>
            <button
              type="button"
              onClick={dismiss}
              aria-label={t.giftCelebration.dismissBanner}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 transition-colors hover:bg-white/80 hover:text-surface-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
