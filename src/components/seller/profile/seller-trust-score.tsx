"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import type { Property, SellerPublicProfile } from "@/types/database";
import {
  buildTrustScoreItems,
  calculateTrustScore,
  isPremiumSeller,
} from "@/lib/seller/profile-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerTrustScoreProps {
  seller: SellerPublicProfile;
  listings: Property[];
}

export function SellerTrustScore({ seller, listings }: SellerTrustScoreProps) {
  const { t } = useTranslation();
  const premium = isPremiumSeller(seller, listings);
  const score = calculateTrustScore(seller.verification, seller.stats, premium);

  const items = buildTrustScoreItems(seller.verification, seller.stats, premium, {
    verifiedIdentity: t.seller.trustVerifiedIdentity,
    verifiedEmail: t.seller.trustVerifiedEmail,
    verifiedPhone: t.seller.trustVerifiedPhone,
    premiumSeller: t.seller.premiumSeller,
    responseQuality: t.seller.trustResponseQuality,
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="trust-score-heading"
      className="rounded-[24px] border border-surface-200/80 bg-gradient-to-br from-brand-50/40 via-white to-white p-6 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-[0_4px_16px_-4px_rgba(0,105,198,0.45)]">
            <Shield className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h2 id="trust-score-heading" className="text-xl font-bold text-surface-900 sm:text-2xl">
              {t.seller.trustScoreTitle}
            </h2>
            <p className="text-sm text-surface-500">{t.seller.trustScoreSubtitle}</p>
          </div>
        </div>
        <div className="text-center sm:text-end">
          <p className="text-4xl font-bold tracking-tight text-brand-700">{score}%</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
          >
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span
                className={cn(
                  "font-medium",
                  item.active ? "text-surface-800" : "text-surface-400"
                )}
              >
                {item.label}
              </span>
              <span className="font-semibold text-surface-900">{item.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-100">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
                className={cn(
                  "h-full rounded-full",
                  item.active ? "bg-brand-600" : "bg-surface-300"
                )}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
