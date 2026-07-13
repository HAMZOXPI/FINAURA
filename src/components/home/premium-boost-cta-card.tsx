"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Rocket, Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

const BOOST_CENTER_HREF = "/dashboard/boost";

export function PremiumBoostCtaCard() {
  const { t } = useTranslation();

  const benefits = [
    t.home.boostCtaBenefit1,
    t.home.boostCtaBenefit2,
    t.home.boostCtaBenefit3,
    t.home.boostCtaBenefit4,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[24px] border border-amber-200/50 bg-gradient-to-br from-white via-amber-50/50 to-brand-50/50 p-6 shadow-[0_20px_50px_-22px_rgba(217,119,6,0.28)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_28px_64px_-20px_rgba(0,105,198,0.32)] sm:p-8 lg:p-10"
    >
      <div className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-brand-200/30 blur-3xl" />

      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px] lg:items-center">
        <div>
          <span className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-amber-500/95 via-yellow-500/95 to-amber-600/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-950 shadow-[0_2px_12px_rgba(251,191,36,0.35)] ring-1 ring-amber-300/45">
            <motion.span
              aria-hidden
              animate={{ x: ["-130%", "230%"] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
              className="absolute inset-y-0 start-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent"
            />
            <Sparkles className="h-3 w-3 fill-amber-900/25 text-amber-950" strokeWidth={2.25} />
            {t.home.boostCtaBadge}
          </span>

          <h3 className="mt-4 max-w-xl text-2xl font-bold leading-snug tracking-tight text-surface-900 sm:text-[1.75rem]">
            {t.home.boostCtaTitle}
          </h3>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-surface-500 sm:text-base">
            {t.home.boostCtaDescription}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5">
            {benefits.map((benefit) => (
              <span
                key={benefit}
                className="inline-flex items-center gap-2 text-sm font-semibold text-surface-700"
              >
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 fill-[#F7D774]/25 text-[#C89211]" strokeWidth={2} />
                {benefit}
              </span>
            ))}
          </div>

          <p className="mt-4 max-w-lg text-xs leading-relaxed text-surface-400">
            {t.home.boostCtaNote}
          </p>

          <div className="mt-7">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              <Link
                href={BOOST_CENTER_HREF}
                className="group/btn relative inline-flex h-[3.75rem] items-center justify-center gap-3 overflow-hidden rounded-2xl border border-[#F5E6A8]/70 bg-gradient-to-br from-[#FFF8DC] via-[#F3D56B] via-45% to-[#C8941A] px-9 text-sm font-semibold text-[#1A1208] shadow-[0_1px_0_0_rgba(255,255,255,0.55)_inset,0_2px_6px_0_rgba(139,90,10,0.18)_inset,0_10px_28px_-6px_rgba(200,146,17,0.62),0_22px_52px_-14px_rgba(160,110,15,0.38)] transition-[box-shadow,filter] duration-300 ease-out hover:border-[#FAECC0]/90 hover:brightness-[1.03] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.65)_inset,0_2px_8px_0_rgba(139,90,10,0.2)_inset,0_14px_36px_-4px_rgba(200,146,17,0.72),0_28px_60px_-12px_rgba(160,110,15,0.45)] active:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-[52%] rounded-t-2xl bg-gradient-to-b from-white/50 via-white/15 to-transparent"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 start-0 w-[42%] bg-gradient-to-r from-transparent via-white/60 to-transparent [@media(hover:hover)]:group-hover/btn:animate-[ribbon-shine_1.1s_ease-in-out]"
                />
                <span className="relative z-[1] tracking-[0.01em]">{t.home.boostCtaButton}</span>
                <span className="relative z-[1] flex shrink-0 items-center justify-center">
                  <ChevronRight
                    className="h-5 w-5 text-[#1A1208] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:translate-x-1 group-active/btn:translate-x-1.5"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="relative hidden h-48 items-center justify-center lg:flex">
          <div className="absolute h-36 w-36 rounded-full bg-brand-200/30 blur-2xl" />

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex h-28 w-28 items-center justify-center rounded-[28px] border border-white/70 bg-white/70 shadow-[0_20px_50px_-16px_rgba(0,105,198,0.35)] backdrop-blur-xl"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-inner">
              <Rocket className="h-8 w-8 text-white" strokeWidth={1.75} />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="absolute top-2 end-2 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/90 shadow-[0_10px_24px_-8px_rgba(217,119,6,0.4)]"
          >
            <Sparkles className="h-5 w-5 text-amber-500" strokeWidth={1.75} />
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
            className="absolute bottom-2 start-0 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/90 shadow-[0_10px_24px_-8px_rgba(0,105,198,0.35)]"
          >
            <TrendingUp className="h-5 w-5 text-brand-600" strokeWidth={1.75} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
