"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/locale-provider";

export function CtaSection() {
  const { t } = useTranslation();

  return (
    <section className="container-app py-20 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 px-8 py-16 text-center shadow-[0_32px_64px_-24px_rgba(0,105,198,0.45)] sm:px-16 lg:py-24"
      >
        <div className="absolute -start-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -end-24 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t.home.ctaTitle}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-brand-100">{t.home.ctaSubtitle}</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-brand-800 shadow-lg transition-all hover:scale-[1.02] hover:bg-brand-50 hover:shadow-xl"
            >
              {t.home.ctaStart}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-full border-2 border-white/30 px-8 text-sm font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
            >
              {t.home.ctaPricing}
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
