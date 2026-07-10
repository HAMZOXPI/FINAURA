"use client";

import { motion } from "framer-motion";
import { Check, FilePlus2, Home, MessageSquare, Zap } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";
import { MotionSection } from "@/components/home/motion-section";

interface Step {
  number: string;
  icon: typeof Home;
  title: string;
  description: string;
  showCheck?: boolean;
}

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative h-full"
    >
      <div className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-brand-400 via-brand-300 to-transparent opacity-0 blur-[2px] transition-opacity duration-300 group-hover:opacity-70" />

      <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-surface-200/70 bg-white p-6 shadow-[0_8px_30px_-14px_rgba(15,23,42,0.10)] transition-shadow duration-300 group-hover:shadow-[0_24px_50px_-16px_rgba(0,105,198,0.22)] sm:p-7">
        <span
          aria-hidden
          className="absolute top-4 end-5 select-none text-5xl font-extrabold text-brand-50 transition-colors duration-300 group-hover:text-brand-100"
        >
          {step.number}
        </span>

        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 shadow-inner"
        >
          <step.icon className="h-6 w-6" strokeWidth={1.75} />
          {step.showCheck && (
            <span className="absolute -bottom-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
          )}
        </motion.div>

        <h3 className="relative mt-5 text-lg font-bold text-surface-900">{step.title}</h3>
        <p className="relative mt-2 text-sm leading-relaxed text-surface-500">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const { t } = useTranslation();

  const steps: Step[] = [
    {
      number: "01",
      icon: FilePlus2,
      title: t.home.howItWorksStep1Title,
      description: t.home.howItWorksStep1Desc,
    },
    {
      number: "02",
      icon: MessageSquare,
      title: t.home.howItWorksStep2Title,
      description: t.home.howItWorksStep2Desc,
    },
    {
      number: "03",
      icon: Zap,
      title: t.home.howItWorksStep3Title,
      description: t.home.howItWorksStep3Desc,
    },
    {
      number: "04",
      icon: Home,
      showCheck: true,
      title: t.home.howItWorksStep4Title,
      description: t.home.howItWorksStep4Desc,
    },
  ];

  return (
    <section className="border-y border-surface-200 bg-gradient-to-b from-surface-50/60 to-white py-16 lg:py-24">
      <div className="container-app">
        <MotionSection className="mx-auto mb-14 max-w-2xl text-center lg:mb-20">
          <h2 className="text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl lg:text-4xl">
            {t.home.howItWorksTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-surface-500">
            {t.home.howItWorksSubtitle}
          </p>
        </MotionSection>

        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[52px] z-0 hidden lg:block"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="mx-[13%] h-px origin-left bg-gradient-to-r from-brand-100 via-brand-400 to-brand-100"
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index > 0 && (
                  <div
                    aria-hidden
                    className="absolute -top-8 start-9 z-0 h-8 w-px bg-gradient-to-b from-brand-100 to-brand-300 sm:hidden"
                  />
                )}
                <StepCard step={step} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
