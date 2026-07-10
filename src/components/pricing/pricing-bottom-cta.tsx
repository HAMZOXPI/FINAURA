"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

export function PricingBottomCta() {
  const { t } = useTranslation();
  const cta = t.pricing.bottomCta;

  return (
    <section className="container-app pb-16 pt-6 sm:pb-24 sm:pt-8 lg:pb-32 lg:pt-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700/95 via-brand-800 to-brand-950 px-6 py-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_64px_rgba(0,105,198,0.28)] sm:rounded-[2rem] sm:px-10 sm:py-16 lg:px-14 lg:py-20"
      >
        <div className="absolute -start-24 -top-24 h-64 w-64 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute -bottom-24 -end-24 h-64 w-64 rounded-full bg-brand-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-brand-100 sm:mt-5 sm:text-lg">
            {cta.subtitle}
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-12 sm:flex-row sm:items-center sm:gap-5">
            <Link
              href="/register"
              className="inline-flex h-13 min-h-[3.25rem] items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-brand-800 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all hover:-translate-y-1 hover:bg-brand-50 hover:shadow-xl sm:min-w-[220px]"
            >
              {cta.startFree}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex h-13 min-h-[3.25rem] items-center justify-center rounded-full border-2 border-white/25 px-8 text-sm font-semibold text-white transition-all hover:-translate-y-1 hover:border-white/45 hover:bg-white/10 sm:min-w-[220px]"
            >
              {cta.upgradeNow}
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
