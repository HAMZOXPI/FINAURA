"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import type { Property, SellerPublicProfile } from "@/types/database";
import { buildTimeline } from "@/lib/seller/profile-display";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerTimelineProps {
  seller: SellerPublicProfile;
  listings: Property[];
}

export function SellerTimeline({ seller, listings }: SellerTimelineProps) {
  const { t, locale } = useTranslation();

  const items = buildTimeline(
    seller,
    listings,
    {
      joined: t.seller.timelineJoined,
      gotVerified: t.seller.timelineVerified,
      publishedListing: t.seller.timelinePublished,
      boostedListing: t.seller.timelineBoosted,
    },
    (date) => formatDate(date, locale)
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="timeline-heading"
      className="rounded-[24px] border border-surface-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]"
    >
      <h2 id="timeline-heading" className="text-xl font-bold text-surface-900 sm:text-2xl">
        {t.seller.timelineTitle}
      </h2>

      <ol className="relative mt-8 space-y-0 border-s border-surface-200 ps-6">
        {items.map((item, index) => (
          <motion.li
            key={item.key}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="relative pb-8 last:pb-0"
          >
            <span className="absolute -start-[1.65rem] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-brand-200">
              <CheckCircle2 className="h-4 w-4 text-brand-600" aria-hidden />
            </span>
            <p className="font-semibold text-surface-900">{item.label}</p>
            <p className="mt-0.5 text-sm text-surface-500">
              {item.comingSoon
                ? t.seller.comingSoon
                : item.date ?? t.seller.comingSoon}
            </p>
          </motion.li>
        ))}
        {items.length === 0 && (
          <li className="flex items-center gap-2 text-sm text-surface-500">
            <Circle className="h-4 w-4" aria-hidden />
            {t.seller.comingSoon}
          </li>
        )}
      </ol>
    </motion.section>
  );
}
