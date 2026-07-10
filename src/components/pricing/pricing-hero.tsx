"use client";

import { motion } from "framer-motion";
import { Check, Shield } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

export function PricingHero() {
  const { t } = useTranslation();
  const hero = t.pricing.hero;

  const badges = [
    { icon: Shield, label: hero.trustSecure },
    { icon: Check, label: hero.trustCancel },
    { icon: Check, label: hero.trustNoFees },
  ];

  return (
    <section className="relative overflow-hidden pb-4 pt-12 sm:pt-16 lg:pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 via-white to-white" />
        <motion.div
          animate={{ x: [0, 24, 0], y: [0, -16, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -start-20 top-10 h-72 w-72 rounded-full bg-brand-200/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -end-16 top-24 h-80 w-80 rounded-full bg-violet-200/15 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute start-1/2 top-32 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-100/25 blur-3xl"
        />
      </div>

      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 shadow-sm backdrop-blur-sm"
          >
            {hero.eyebrow}
          </motion.span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-surface-500 sm:text-xl">
            {hero.subtitle}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {badges.map((badge, index) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 rounded-full border border-surface-200/80 bg-white/90 px-3.5 py-2 text-sm font-medium text-surface-700 shadow-sm backdrop-blur-sm"
              >
                <badge.icon
                  className={`h-4 w-4 ${index === 0 ? "text-brand-600" : "text-emerald-600"}`}
                />
                {badge.label}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
