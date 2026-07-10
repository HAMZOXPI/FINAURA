"use client";

import { motion } from "framer-motion";
import { Briefcase, Globe, Languages, Sparkles } from "lucide-react";
import type { SellerPublicProfile } from "@/types/database";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerAboutCardProps {
  seller: SellerPublicProfile;
}

export function SellerAboutCard({ seller }: SellerAboutCardProps) {
  const { t } = useTranslation();

  const fields = [
    {
      key: "bio",
      icon: Sparkles,
      label: t.seller.aboutBio,
      value: seller.profile.bio,
    },
    {
      key: "languages",
      icon: Languages,
      label: t.seller.aboutLanguages,
      value: null as string | null,
      comingSoon: true,
    },
    {
      key: "experience",
      icon: Briefcase,
      label: t.seller.aboutExperience,
      value: null as string | null,
      comingSoon: true,
    },
    {
      key: "agency",
      icon: Briefcase,
      label: t.seller.aboutAgency,
      value: seller.profile.role === "agent" ? t.seller.subtitleAgent : null,
    },
    {
      key: "website",
      icon: Globe,
      label: t.seller.aboutWebsite,
      value: null as string | null,
      comingSoon: true,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="about-seller-heading"
      className="rounded-[24px] border border-surface-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]"
    >
      <h2 id="about-seller-heading" className="text-xl font-bold text-surface-900 sm:text-2xl">
        {t.seller.aboutTitle}
      </h2>

      <div className="mt-6 space-y-5">
        {fields.map((field) => (
          <div key={field.key} className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <field.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-surface-500">
                {field.label}
              </p>
              {field.comingSoon && !field.value ? (
                <p className="mt-1 text-sm text-surface-400">{t.seller.comingSoon}</p>
              ) : field.value ? (
                <p className="mt-1 text-sm leading-relaxed text-surface-700">{field.value}</p>
              ) : (
                <p className="mt-1 text-sm text-surface-400">{t.seller.comingSoon}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
