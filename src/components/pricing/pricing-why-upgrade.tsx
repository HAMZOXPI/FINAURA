"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Headphones,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

function BenefitCard({
  icon: Icon,
  title,
  description,
  delay,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="h-full rounded-2xl border border-surface-200/60 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)] sm:p-6"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-black/[0.04] ${accent}`}
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
      <h3 className="mt-4 text-lg font-bold text-surface-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-surface-500">{description}</p>
    </motion.div>
  );
}

export function PricingWhyUpgrade() {
  const { t } = useTranslation();
  const benefits = t.pricing.benefits;

  const items = [
    {
      icon: TrendingUp,
      title: benefits.visibilityTitle,
      description: benefits.visibilityDesc,
      accent: "bg-brand-50 text-brand-600",
    },
    {
      icon: Rocket,
      title: benefits.boostTitle,
      description: benefits.boostDesc,
      accent: "bg-orange-50 text-orange-600",
    },
    {
      icon: Headphones,
      title: benefits.supportTitle,
      description: benefits.supportDesc,
      accent: "bg-violet-50 text-violet-600",
    },
    {
      icon: BarChart3,
      title: benefits.analyticsTitle,
      description: benefits.analyticsDesc,
      accent: "bg-sky-50 text-sky-600",
    },
    {
      icon: ShieldCheck,
      title: benefits.profileTitle,
      description: benefits.profileDesc,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: Sparkles,
      title: benefits.premiumTitle,
      description: benefits.premiumDesc,
      accent: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <section className="bg-surface-50/50 py-14 sm:py-20 lg:py-24">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
            {benefits.title}
          </h2>
          <p className="mt-3 text-surface-500">{benefits.subtitle}</p>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <BenefitCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              accent={item.accent}
              delay={index * 0.06}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
