"use client";

import { motion } from "framer-motion";
import { Search, Shield, Star, TrendingUp } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";
import { MotionSection, MotionStagger, MotionItem } from "@/components/home/motion-section";

export function WhySection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Search,
      title: t.home.featureSearchTitle,
      description: t.home.featureSearchDesc,
      accent: "bg-brand-500/15 text-brand-300",
    },
    {
      icon: Shield,
      title: t.home.featureVerifiedTitle,
      description: t.home.featureVerifiedDesc,
      accent: "bg-emerald-500/15 text-emerald-300",
    },
    {
      icon: Star,
      title: t.home.featureFavoritesTitle,
      description: t.home.featureFavoritesDesc,
      accent: "bg-amber-500/15 text-amber-300",
    },
    {
      icon: TrendingUp,
      title: t.home.featureManageTitle,
      description: t.home.featureManageDesc,
      accent: "bg-violet-500/15 text-violet-300",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-surface-950 py-20 text-white lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/40 via-transparent to-transparent" />

      <div className="container-app relative">
        <MotionSection className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.home.whyTitle}</h2>
          <p className="mt-4 text-lg text-white/60">{t.home.whySubtitle}</p>
        </MotionSection>

        <MotionStagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {features.map((feature) => (
            <MotionItem key={feature.title}>
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 360, damping: 24 }}
                className="group h-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)] lg:p-9"
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${feature.accent} transition-transform duration-300 group-hover:scale-105`}
                >
                  <feature.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 text-lg font-semibold leading-snug text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{feature.description}</p>
              </motion.div>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
