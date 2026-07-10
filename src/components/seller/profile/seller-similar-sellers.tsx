"use client";

import { motion } from "framer-motion";
import { UserCircle2, Users } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

export function SellerSimilarSellers() {
  const { t } = useTranslation();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="similar-sellers-heading"
    >
      <h2 id="similar-sellers-heading" className="text-xl font-bold text-surface-900 sm:text-2xl">
        {t.seller.similarSellersTitle}
      </h2>
      <p className="mt-2 text-sm text-surface-500">{t.seller.similarSellersSubtitle}</p>

      <div className="relative mt-8 overflow-hidden rounded-[24px] border border-surface-200/80 bg-gradient-to-br from-surface-50 via-white to-brand-50/20 px-8 py-14 text-center shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[20px] bg-white ring-1 ring-surface-200/80 shadow-sm">
          <Users className="h-9 w-9 text-brand-600" strokeWidth={1.5} aria-hidden />
          <UserCircle2 className="absolute -end-1 -top-1 h-6 w-6 text-surface-400" aria-hidden />
        </div>
        <h3 className="mt-6 text-lg font-bold text-surface-900">{t.seller.similarSellersEmpty}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-surface-500">
          {t.seller.comingSoon}
        </p>
      </div>
    </motion.section>
  );
}
