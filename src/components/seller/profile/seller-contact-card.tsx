"use client";

import { motion } from "framer-motion";
import { Clock, Crown, MessageCircle, ShieldCheck } from "lucide-react";
import type { Property, SellerPublicProfile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { isPremiumSeller } from "@/lib/seller/profile-display";
import { formatDate, interpolate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerContactCardProps {
  seller: SellerPublicProfile;
  listings: Property[];
  onContact: () => void;
}

export function SellerContactCard({ seller, listings, onContact }: SellerContactCardProps) {
  const { t, locale } = useTranslation();
  const premium = isPremiumSeller(seller, listings);
  const name = seller.profile.full_name ?? t.properties.defaultAgent;

  const whatsappPhone = seller.profile.phone?.replace(/\D/g, "");
  const mailto = seller.profile.email
    ? `mailto:${seller.profile.email}?subject=${encodeURIComponent(`Finaura - ${name}`)}`
    : null;

  const handleMessage = () => {
    if (whatsappPhone) {
      const message = encodeURIComponent(`${t.propertyDetail.whatsappMessage}`);
      window.open(`https://wa.me/${whatsappPhone}?text=${message}`, "_blank", "noopener,noreferrer");
      return;
    }
    if (mailto) {
      window.location.href = mailto;
      return;
    }
    onContact();
  };

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="hidden rounded-[24px] border border-surface-200/80 bg-white/90 p-6 shadow-[0_12px_40px_-14px_rgba(0,0,0,0.12)] backdrop-blur-xl lg:block lg:sticky lg:top-24 lg:self-start"
      aria-label={t.seller.contactCardLabel}
    >
      <h3 className="text-lg font-bold text-surface-900">{t.seller.contactSeller}</h3>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-surface-50 px-3 py-2.5 text-sm">
          <span className="text-surface-500">{t.seller.responseTime}</span>
          <span className="flex items-center gap-1 font-semibold text-surface-900">
            <Clock className="h-3.5 w-3.5 text-brand-600" aria-hidden />
            {interpolate(t.seller.withinHours, { hours: seller.stats.avgResponseTimeHours })}
          </span>
        </div>

        {seller.verification.verifiedSeller && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            {t.seller.verifiedSeller}
          </div>
        )}

        {premium && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">
            <Crown className="h-4 w-4" aria-hidden />
            {t.seller.premiumSeller}
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl bg-surface-50 px-3 py-2.5 text-sm">
          <span className="text-surface-500">{t.seller.lastActive}</span>
          <span className="font-semibold text-surface-900">
            {formatDate(seller.profile.updated_at, locale)}
          </span>
        </div>
      </div>

      <Button
        type="button"
        className="mt-6 h-12 w-full rounded-xl text-sm font-semibold shadow-[0_4px_16px_-4px_rgba(0,105,198,0.4)]"
        onClick={handleMessage}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        {t.seller.sendMessage}
      </Button>

      <button
        type="button"
        onClick={onContact}
        className="mt-3 w-full text-center text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2"
      >
        {t.seller.browseListingsToContact}
      </button>
    </motion.aside>
  );
}
