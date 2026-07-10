"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import type { SellerPublicProfile } from "@/types/database";
import { buildCompleteness } from "@/lib/seller/profile-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerCompletenessCardProps {
  seller: SellerPublicProfile;
}

export function SellerCompletenessCard({ seller }: SellerCompletenessCardProps) {
  const { t } = useTranslation();

  const { items, percent } = buildCompleteness(seller, {
    identity: t.seller.completenessIdentity,
    phone: t.seller.completenessPhone,
    email: t.seller.completenessEmail,
    bio: t.seller.completenessBio,
    listings: t.seller.completenessListings,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] border border-surface-200/80 bg-white p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]"
      aria-labelledby="completeness-heading"
    >
      <div className="flex items-center justify-between">
        <h3 id="completeness-heading" className="text-lg font-bold text-surface-900">
          {t.seller.completenessTitle}
        </h3>
        <span className="text-2xl font-bold text-brand-700">{percent}%</span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-100">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600"
        />
      </div>

      <ul className="mt-5 space-y-2.5">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-sm">
            {item.complete ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-surface-300" aria-hidden />
            )}
            <span
              className={cn(
                item.complete ? "font-medium text-surface-800" : "text-surface-400"
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
