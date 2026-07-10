"use client";

import { motion } from "framer-motion";
import { Headphones, Lock, ShieldCheck, Sparkles } from "lucide-react";
import type { Property } from "@/types/database";
import type { SellerPublicProfile } from "@/types/database";
import { buildTrustItems } from "@/lib/property/details-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const TRUST_ICONS = {
  "verified-seller": ShieldCheck,
  "verified-listing": Sparkles,
  "secure-communication": Lock,
  support: Headphones,
} as const;

interface PropertyTrustSectionProps {
  property: Property;
  seller: SellerPublicProfile | null;
}

export function PropertyTrustSection({ property, seller }: PropertyTrustSectionProps) {
  const { t } = useTranslation();

  const items = buildTrustItems(property, seller, {
    verifiedSeller: t.propertyDetail.trustVerifiedSeller,
    verifiedListing: t.propertyDetail.trustVerifiedListing,
    secureCommunication: t.propertyDetail.trustSecureCommunication,
    supportAvailable: t.propertyDetail.trustSupportAvailable,
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="property-trust-heading"
      className="rounded-[24px] border border-surface-200/80 bg-gradient-to-br from-brand-50/40 via-white to-white p-6 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]"
    >
      <h2 id="property-trust-heading" className="text-xl font-bold text-surface-900 sm:text-2xl">
        {t.propertyDetail.trustTitle}
      </h2>
      <p className="mt-2 text-sm text-surface-500">{t.propertyDetail.trustSubtitle}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => {
          const Icon = TRUST_ICONS[item.key as keyof typeof TRUST_ICONS] ?? ShieldCheck;

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-[250ms]",
                item.active
                  ? "border-brand-200/60 bg-white shadow-[0_2px_12px_-4px_rgba(0,105,198,0.1)]"
                  : "border-surface-200/60 bg-surface-50/50 opacity-70"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  item.active ? "bg-brand-50 text-brand-600" : "bg-surface-100 text-surface-400"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="text-sm font-semibold text-surface-800">{item.label}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
