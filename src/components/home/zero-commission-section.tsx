"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Coins,
  Handshake,
  Home,
  KeyRound,
  MessageSquare,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";
import { MotionSection, MotionStagger, MotionItem } from "@/components/home/motion-section";
import { cn } from "@/lib/utils";

function FloatingChip({
  icon: Icon,
  className,
  delay = 0,
}: {
  icon: typeof Wallet;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay }}
      className={cn(
        "absolute flex h-7 w-7 items-center justify-center rounded-lg border border-white/60 bg-white/80 shadow-[0_12px_30px_-10px_rgba(15,23,42,0.25)] backdrop-blur-md md:h-10 md:w-10 md:rounded-xl lg:h-14 lg:w-14 lg:rounded-2xl",
        className
      )}
    >
      <Icon
        className="h-3.5 w-3.5 text-brand-600 md:h-5 md:w-5 lg:h-6 lg:w-6"
        strokeWidth={1.75}
      />
    </motion.div>
  );
}

function ZeroCommissionIllustration() {
  return (
    <div className="relative mx-auto flex h-[150px] w-full max-w-[190px] items-center justify-center md:h-[200px] md:max-w-[240px] lg:h-[380px] lg:max-w-md">
      <div className="absolute h-[104px] w-[104px] rounded-full bg-brand-200/32 blur-3xl md:h-44 md:w-44 md:bg-brand-200/40 lg:h-72 lg:w-72" />
      <div className="absolute -bottom-4 -end-3 h-[90px] w-[90px] rounded-full bg-emerald-200/24 blur-3xl md:-bottom-6 md:-end-4 md:h-36 md:w-36 md:bg-emerald-200/30 lg:-bottom-10 lg:-end-6 lg:h-56 lg:w-56" />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex h-[135px] w-[135px] items-center justify-center rounded-[24px] border border-white/70 bg-white/70 shadow-[0_24px_60px_-16px_rgba(0,105,198,0.35)] backdrop-blur-xl md:h-[180px] md:w-[180px] md:rounded-[28px] lg:h-60 lg:w-60 lg:rounded-[36px]"
      >
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-inner md:h-24 md:w-24 lg:h-36 lg:w-36">
          <Home className="h-8 w-8 text-white md:h-10 md:w-10 lg:h-14 lg:w-14" strokeWidth={1.5} />
        </div>

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute -bottom-1.5 -end-1.5 flex h-9 w-9 items-center justify-center rounded-lg border border-white/80 bg-white shadow-[0_10px_24px_-8px_rgba(0,105,198,0.4)] md:-bottom-2 md:-end-2 md:h-11 md:w-11 md:rounded-xl lg:-bottom-3 lg:-end-3 lg:h-14 lg:w-14 lg:rounded-2xl"
        >
          <Coins className="h-4 w-4 text-brand-600 md:h-5 md:w-5 lg:h-6 lg:w-6" strokeWidth={1.75} />
        </motion.div>
      </motion.div>

      <FloatingChip icon={KeyRound} className="top-2 start-3 md:top-0 md:start-5 lg:top-2 lg:start-2" delay={0.2} />
      <FloatingChip icon={Handshake} className="top-2 end-3 md:top-5 md:end-1 lg:top-8 lg:end-2" delay={1.5} />
      <FloatingChip icon={ShieldCheck} className="bottom-2 start-3 md:bottom-5 md:start-1 lg:bottom-6 lg:start-4" delay={0.9} />
      <FloatingChip icon={MessageSquare} className="bottom-2 end-3 md:bottom-1 md:end-5 lg:bottom-0 lg:end-10" delay={0.5} />
    </div>
  );
}

function ZeroCommissionHighlightCard() {
  const { t } = useTranslation();

  const EASE = [0.22, 1, 0.36, 1] as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.62, ease: EASE, when: "beforeChildren" as const },
    },
  };

  const contentVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.14 },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.82, y: 14 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 280, damping: 22 },
    },
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.52, ease: EASE },
    },
  };

  const FLOATING_DECOR = [
    "start-[7%] top-[16%] h-2.5 w-2.5 rounded-full bg-brand-400/80 animate-[value-particle-float_26s_ease-in-out_infinite]",
    "end-[9%] top-[20%] h-1.5 w-1.5 rounded-full bg-amber-300/70 animate-[value-sparkle-pulse_24s_ease-in-out_infinite]",
    "bottom-[18%] start-[11%] h-3 w-3 rounded-full bg-sky-300/60 animate-[value-particle-float_28s_ease-in-out_infinite_reverse]",
    "end-[13%] bottom-[22%] h-px w-14 rotate-[35deg] bg-gradient-to-r from-transparent via-brand-300/50 to-transparent animate-[value-particle-float_30s_ease-in-out_infinite]",
    "start-[44%] top-[11%] h-1.5 w-1.5 rounded-full bg-white/80 animate-[value-sparkle-pulse_22s_ease-in-out_infinite_1.5s]",
  ] as const;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={cardVariants}
      className="relative mt-14 lg:mt-16"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 px-6 py-11 text-center shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset,0_24px_64px_-28px_rgba(0,105,198,0.22),0_8px_32px_-16px_rgba(15,23,42,0.08)] sm:rounded-[2.25rem] sm:px-14 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-[#F8FBFF] to-[#F2F7FD]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(96,165,250,0.16),transparent_68%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_92%_88%,rgba(251,191,36,0.1),transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transform-gpu animate-[value-glow-drift_11s_ease-in-out_infinite] bg-[radial-gradient(ellipse_40%_35%_at_12%_82%,rgba(59,130,246,0.14),transparent_72%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-white/70 via-white/20 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-3 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent sm:inset-x-12"
        />

        {FLOATING_DECOR.map((className, index) => (
          <span
            key={index}
            aria-hidden
            className={`pointer-events-none absolute transform-gpu opacity-[0.08] ${className}`}
          />
        ))}

        <span
          aria-hidden
          className="pointer-events-none absolute start-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 select-none text-[4.5rem] font-black leading-none text-brand-600/[0.035] sm:text-[5.5rem]"
        >
          100%
        </span>

        <motion.div variants={contentVariants} className="relative mx-auto max-w-xl">
          <motion.div variants={iconVariants} className="relative mx-auto w-fit">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-3 rounded-full bg-brand-400/20 animate-[value-glow-drift_8s_ease-in-out_infinite]"
            />
            <div className="relative flex h-[4.75rem] w-[4.75rem] animate-[value-icon-float_6.5s_ease-in-out_infinite] items-center justify-center rounded-full border border-white/90 bg-white/85 shadow-[0_1px_0_0_rgba(255,255,255,0.95)_inset,0_12px_32px_-8px_rgba(0,105,198,0.28),0_4px_16px_-6px_rgba(15,23,42,0.12)] sm:h-20 sm:w-20">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_18%,rgba(147,197,253,0.35),transparent_62%)]"
              />
              <Wallet
                className="relative h-8 w-8 text-brand-700 sm:h-9 sm:w-9"
                strokeWidth={1.65}
                aria-hidden
              />
            </div>
          </motion.div>

          <motion.p
            variants={fadeVariants}
            className="mt-5 text-[1.35rem] font-bold leading-[1.25] tracking-tight text-surface-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] sm:mt-6 sm:text-2xl sm:leading-[1.2]"
          >
            <span className="bg-gradient-to-br from-surface-900 via-surface-800 to-brand-800 bg-clip-text text-transparent">
              {t.home.zeroCommissionHighlightTitle}
            </span>
          </motion.p>

          <motion.p
            variants={fadeVariants}
            className="mx-auto mt-3.5 max-w-md text-sm leading-[1.7] text-surface-500 sm:mt-4 sm:text-base sm:leading-[1.75]"
          >
            {t.home.zeroCommissionHighlightDesc}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function ZeroCommissionSection() {
  const { t } = useTranslation();

  const shortBenefits = [
    t.home.zeroCommissionNoIntermediaries,
    t.home.zeroCommissionNoCommissionLine,
    t.home.zeroCommissionNoHiddenFees,
  ];

  const benefitCards = [
    {
      icon: Wallet,
      title: t.home.zeroCommissionCard1Title,
      description: t.home.zeroCommissionCard1Desc,
    },
    {
      icon: MessageSquare,
      title: t.home.zeroCommissionCard2Title,
      description: t.home.zeroCommissionCard2Desc,
    },
    {
      icon: ShieldCheck,
      title: t.home.zeroCommissionCard3Title,
      description: t.home.zeroCommissionCard3Desc,
    },
  ];

  const finauraPoints = [
    t.home.zeroCommissionCompareFinaura1,
    t.home.zeroCommissionCompareFinaura2,
    t.home.zeroCommissionCompareFinaura3,
    t.home.zeroCommissionCompareFinaura4,
    t.home.zeroCommissionCompareFinaura5,
  ];

  const traditionalPoints = [
    t.home.zeroCommissionCompareOthers1,
    t.home.zeroCommissionCompareOthers2,
    t.home.zeroCommissionCompareOthers3,
    t.home.zeroCommissionCompareOthers4,
    t.home.zeroCommissionCompareOthers5,
  ];

  return (
    <section className="relative scroll-mt-20 bg-white py-10 max-md:overflow-visible md:overflow-hidden md:py-12 lg:py-28">
      <div className="container-app">
        <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-2 lg:gap-16">
          <MotionSection className="flex flex-col items-center text-center md:items-start md:text-start">
            <span className="hidden w-fit items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700 md:inline-flex">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              {t.home.zeroCommissionBadge}
            </span>

            <h2 className="mt-0 text-[2rem] font-bold leading-[1.15] tracking-tight text-surface-900 md:mt-4 md:text-3xl md:leading-tight lg:mt-5 lg:text-[2.75rem]">
              {t.home.zeroCommissionTitle}
            </h2>

            <div className="relative mt-2.5 inline-flex md:mt-4 lg:mt-7">
              <motion.div
                aria-hidden
                animate={{ scale: [1, 1.05, 1], opacity: [0.28, 0.48, 0.28] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-3 rounded-[28px] bg-gradient-to-r from-brand-400 to-brand-600 blur-xl"
              />
              <div className="relative flex items-center gap-2.5 rounded-[20px] bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 shadow-[0_20px_45px_-14px_rgba(0,105,198,0.55)] lg:gap-3 lg:rounded-[22px] lg:px-6 lg:py-3.5">
                <span className="text-2xl font-black tracking-tight text-white lg:text-4xl">
                  0%
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-brand-50 lg:text-sm">
                  {t.home.zeroCommissionBadgeValue}
                </span>
              </div>
            </div>

            <p className="mt-2.5 max-w-lg text-base leading-relaxed text-surface-500 md:mt-6">
              {t.home.zeroCommissionSubtitle}
            </p>

            <ul className="mx-auto mt-2.5 w-full max-w-[340px] space-y-2.5 md:mt-6 md:max-w-none">
              {shortBenefits.map((benefit) => (
                <li
                  key={benefit}
                  className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-x-2.5 text-start text-base font-medium text-surface-700 md:flex md:items-center md:gap-2.5 md:text-sm"
                >
                  <CheckCircle2
                    className="h-[18px] w-[18px] shrink-0 text-brand-600"
                    strokeWidth={2}
                  />
                  <span className="leading-snug">{benefit}</span>
                </li>
              ))}
            </ul>

            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="mt-3 w-full max-w-[340px] md:mt-8 md:inline-block md:w-auto md:max-w-none"
            >
              <Link
                href="/dashboard/new"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-base font-semibold text-white shadow-[0_16px_36px_-12px_rgba(0,105,198,0.55)] transition-colors hover:bg-brand-700 md:text-sm lg:h-14 lg:w-auto lg:px-8"
              >
                {t.home.zeroCommissionCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <div className="mt-5 hidden flex-col gap-2 md:flex md:flex-row md:items-center md:gap-5">
              {[
                t.home.zeroCommissionCompareFinaura3,
                `0% ${t.home.zeroCommissionBadgeValue}`,
                t.home.zeroCommissionCompareFinaura2,
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-surface-400"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-brand-500" strokeWidth={2} />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-7 w-full pb-9 md:hidden">
              <ZeroCommissionIllustration />
            </div>
          </MotionSection>

          <MotionSection delay={0.1} className="hidden md:block">
            <ZeroCommissionIllustration />
          </MotionSection>
        </div>

        <MotionStagger className="mt-0 grid gap-6 sm:grid-cols-3 md:mt-20 lg:mt-24 lg:gap-8">
          {benefitCards.map((card) => (
            <MotionItem key={card.title}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="group relative h-full rounded-[28px] border border-surface-200/70 bg-white p-7 shadow-[0_8px_30px_-14px_rgba(15,23,42,0.10)] transition-shadow duration-300 hover:shadow-[0_24px_50px_-16px_rgba(0,105,198,0.22)]"
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 shadow-inner"
                >
                  <card.icon className="h-6 w-6" strokeWidth={1.75} />
                </motion.div>
                <h3 className="mt-5 text-lg font-bold text-surface-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-500">{card.description}</p>
              </motion.div>
            </MotionItem>
          ))}
        </MotionStagger>

        <MotionSection delay={0.1} className="mt-14 lg:mt-16">
          <div className="overflow-hidden rounded-[32px] border border-surface-200/70 bg-white shadow-[0_16px_50px_-20px_rgba(15,23,42,0.14)]">
            <div className="border-b border-surface-100 px-6 py-6 text-center sm:px-10">
              <h3 className="text-2xl font-bold tracking-tight text-surface-900">
                {t.home.zeroCommissionCompareTitle}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="border-b border-surface-100 bg-gradient-to-br from-brand-50/60 to-white px-6 py-8 sm:border-b-0 sm:border-e sm:px-10">
                <p className="mb-5 text-sm font-bold uppercase tracking-wide text-brand-700">
                  {t.home.zeroCommissionCompareFinauraLabel}
                </p>
                <ul className="space-y-4">
                  {finauraPoints.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm font-semibold text-surface-800">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-6 py-8 sm:px-10">
                <p className="mb-5 text-sm font-bold uppercase tracking-wide text-surface-400">
                  {t.home.zeroCommissionCompareOthersLabel}
                </p>
                <ul className="space-y-4">
                  {traditionalPoints.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm font-medium text-surface-500">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-100 text-surface-400">
                        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </MotionSection>

        <ZeroCommissionHighlightCard />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-14 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 px-8 py-14 text-center shadow-[0_32px_64px_-24px_rgba(0,105,198,0.4)] sm:px-16 lg:mt-16 lg:py-20"
        >
          <div className="absolute -start-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -end-24 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />

          <div className="relative mx-auto max-w-xl">
            <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {t.home.zeroCommissionCtaTitle}
            </h3>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard/new"
                className="inline-flex h-14 w-full min-w-[240px] items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-brand-800 shadow-lg transition-all hover:scale-[1.02] hover:bg-brand-50 hover:shadow-xl sm:w-auto"
              >
                {t.home.zeroCommissionCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/properties"
                className="inline-flex h-14 w-full min-w-[220px] items-center justify-center gap-2 rounded-full border-2 border-white/30 px-8 text-sm font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10 sm:w-auto"
              >
                {t.home.howItWorksCtaSecondary}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
