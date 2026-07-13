"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/locale-provider";

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE, when: "beforeChildren" as const },
  },
};

const contentVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
};

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};

const buttonsContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.11, delayChildren: 0.3 },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: EASE },
  },
};

const FLOATING_ELEMENTS = [
  {
    className:
      "start-[8%] top-[14%] h-3 w-3 rounded-full bg-sky-300/25 shadow-[0_0_18px_rgba(125,211,252,0.35)] animate-[cta-float-slow_26s_ease-in-out_infinite]",
  },
  {
    className:
      "end-[10%] top-[22%] h-2 w-2 rounded-full bg-white/20 animate-[cta-sparkle-pulse_24s_ease-in-out_infinite]",
  },
  {
    className:
      "bottom-[18%] start-[14%] h-4 w-4 rounded-full bg-blue-200/15 shadow-[0_0_22px_rgba(147,197,253,0.2)] animate-[cta-float-drift_28s_ease-in-out_infinite]",
  },
  {
    className:
      "end-[16%] bottom-[20%] h-px w-16 rotate-45 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[cta-float-slow_30s_ease-in-out_infinite_reverse]",
  },
  {
    className:
      "start-[42%] top-[10%] h-1.5 w-1.5 rounded-full bg-white/30 animate-[cta-sparkle-pulse_22s_ease-in-out_infinite_2s]",
  },
] as const;

export function CtaSection() {
  const { t } = useTranslation();

  return (
    <section className="container-app py-14 sm:py-20 lg:py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
        className="relative isolate overflow-hidden rounded-[2rem] border border-white/[0.09] px-5 py-14 text-center shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_32px_80px_-28px_rgba(2,20,60,0.75),0_12px_40px_-16px_rgba(0,105,198,0.45)] sm:rounded-[2.5rem] sm:px-12 sm:py-16 lg:px-16 lg:py-24"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0B2D6E] via-[#0A3D8F] via-45% to-[#041A3D]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-8%,rgba(96,165,250,0.28),transparent_62%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_88%_92%,rgba(56,189,248,0.14),transparent_68%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transform-gpu animate-[cta-ambient-glow_9s_ease-in-out_infinite] bg-[radial-gradient(ellipse_50%_40%_at_18%_78%,rgba(59,130,246,0.22),transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/[0.09] via-white/[0.03] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-3 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent sm:inset-x-10"
        />

        {FLOATING_ELEMENTS.map((element, index) => (
          <span
            key={index}
            aria-hidden
            className={`pointer-events-none absolute transform-gpu ${element.className}`}
          />
        ))}

        <motion.div variants={contentVariants} className="relative z-10 mx-auto max-w-2xl">
          <motion.h2
            variants={fadeVariants}
            className="text-[1.875rem] font-bold leading-[1.12] tracking-tight text-white drop-shadow-[0_2px_28px_rgba(0,0,0,0.42)] sm:text-4xl sm:leading-[1.1] lg:text-[3.25rem]"
          >
            {t.home.ctaTitle}
          </motion.h2>

          <motion.p
            variants={fadeVariants}
            className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/78 sm:mt-5 sm:text-lg"
          >
            {t.home.ctaSubtitle}
          </motion.p>

          <motion.div
            variants={buttonsContainerVariants}
            className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4"
          >
            <motion.div
              variants={buttonVariants}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/register"
                className="group/btn relative inline-flex h-14 w-full min-w-0 items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-b from-white via-white to-brand-50 px-8 text-sm font-semibold tracking-[0.01em] text-brand-800 shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset,0_2px_4px_0_rgba(1,84,161,0.08)_inset,0_12px_32px_-6px_rgba(0,0,0,0.35),0_20px_48px_-12px_rgba(0,105,198,0.4)] transition-[box-shadow,filter] duration-300 ease-out hover:brightness-[1.02] hover:shadow-[0_1px_0_0_rgba(255,255,255,1)_inset,0_2px_6px_0_rgba(1,84,161,0.1)_inset,0_16px_40px_-4px_rgba(0,0,0,0.4),0_28px_56px_-10px_rgba(0,105,198,0.48)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-800 sm:min-w-[220px] sm:w-auto"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-[52%] rounded-t-2xl bg-gradient-to-b from-white/80 via-white/20 to-transparent"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 start-0 w-[40%] bg-gradient-to-r from-transparent via-white/70 to-transparent [@media(hover:hover)]:group-hover/btn:animate-[ribbon-shine_1.1s_ease-in-out]"
                />
                <span className="relative z-[1]">{t.home.ctaStart}</span>
                <span className="relative z-[1] flex shrink-0 items-center justify-center">
                  <ChevronRight
                    className="h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:translate-x-1 group-active/btn:translate-x-1.5"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </span>
              </Link>
            </motion.div>

            <motion.div
              variants={buttonVariants}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/pricing"
                className="group/sec relative inline-flex h-14 w-full min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white/[0.07] px-8 text-sm font-semibold tracking-[0.02em] text-white/92 shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset] backdrop-blur-[6px] transition-[border-color,background-color,box-shadow] duration-300 ease-out hover:border-white/45 hover:bg-white/[0.12] hover:text-white hover:shadow-[0_0_28px_rgba(255,255,255,0.14),0_8px_28px_-8px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900 sm:min-w-[200px] sm:w-auto"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.14)_45%,rgba(255,255,255,0.28)_50%,rgba(255,255,255,0.14)_55%,transparent_100%)] bg-[length:220%_100%] opacity-0 transition-opacity duration-300 [@media(hover:hover)]:group-hover/sec:animate-[cta-border-shimmer_3.5s_ease-in-out_infinite] [@media(hover:hover)]:group-hover/sec:opacity-100"
                />
                <span className="relative z-[1]">{t.home.ctaPricing}</span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
