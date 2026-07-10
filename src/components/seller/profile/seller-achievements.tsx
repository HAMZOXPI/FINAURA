"use client";

import { motion } from "framer-motion";
import {
  Award,
  Crown,
  Rocket,
  ShieldCheck,
  Star,
  Timer,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Property, SellerPublicProfile } from "@/types/database";
import { buildAchievements, isPremiumSeller } from "@/lib/seller/profile-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  verified: ShieldCheck,
  premium: Crown,
  quick: Timer,
  top: Rocket,
  trusted: Star,
  years: Award,
  boosted: Zap,
};

interface SellerAchievementsProps {
  seller: SellerPublicProfile;
  listings: Property[];
}

export function SellerAchievements({ seller, listings }: SellerAchievementsProps) {
  const { t } = useTranslation();
  const premium = isPremiumSeller(seller, listings);

  const achievements = buildAchievements(seller, listings, premium, {
    verifiedSeller: t.seller.verifiedSeller,
    premiumSeller: t.seller.premiumSeller,
    quickResponder: t.seller.achievementQuickResponder,
    topAdvertiser: t.seller.achievementTopAdvertiser,
    trustedMember: t.seller.achievementTrustedMember,
    yearsOnPlatform: t.seller.achievementYearsOnPlatform,
    boostedListing: t.seller.achievementBoostedListing,
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="achievements-heading"
    >
      <h2 id="achievements-heading" className="text-xl font-bold text-surface-900 sm:text-2xl">
        {t.seller.achievementsTitle}
      </h2>
      <p className="mt-2 text-sm text-surface-500">{t.seller.achievementsSubtitle}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        {achievements.map((achievement, index) => {
          const Icon = ACHIEVEMENT_ICONS[achievement.key] ?? Award;

          return (
            <motion.div
              key={achievement.key}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-[250ms]",
                achievement.unlocked
                  ? "border-amber-200/70 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 shadow-[0_2px_12px_-4px_rgba(251,191,36,0.2)] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5"
                  : "border-surface-200/60 bg-surface-50/80 text-surface-400 opacity-60"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {achievement.label}
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
