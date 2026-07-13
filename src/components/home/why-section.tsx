"use client";

import { motion } from "framer-motion";
import { Search, Shield, Star, TrendingUp } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";
import { MotionSection, MotionStagger, MotionItem } from "@/components/home/motion-section";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export function WhySection() {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 767px)");

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

        <MotionStagger className="mt-16 grid gap-3 max-md:mt-12 sm:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-8">
          {features.map((feature) => (
            <MotionItem key={feature.title}>
              <motion.div
                whileHover={isMobile ? undefined : { scale: 1.03, y: -4 }}
                whileTap={isMobile ? { scale: 0.985 } : undefined}
                transition={
                  isMobile
                    ? { duration: 0.22, ease: "easeOut" }
                    : { type: "spring", stiffness: 360, damping: 24 }
                }
                className={cn(
                  "group/icon h-full backdrop-blur-sm transition-[border-color,background-color,box-shadow,transform] duration-300",
                  "max-md:relative max-md:overflow-hidden max-md:rounded-2xl max-md:border max-md:border-white/[0.08] max-md:bg-white/[0.06] max-md:px-3.5 max-md:py-2.5",
                  "max-md:shadow-[0_2px_14px_-10px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)]",
                  "max-md:before:pointer-events-none max-md:before:absolute max-md:before:inset-x-0 max-md:before:top-0 max-md:before:h-px max-md:before:bg-gradient-to-r max-md:before:from-transparent max-md:before:via-white/18 max-md:before:to-transparent",
                  "max-md:active:border-white/12 max-md:active:bg-white/[0.08] max-md:active:shadow-[0_4px_18px_-8px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.07)]",
                  "max-md:transition-[border-color,background-color,box-shadow,transform] max-md:duration-[220ms]",
                  "rounded-3xl border border-white/10 bg-white/5 p-8 lg:p-9",
                  "md:hover:border-white/20 md:hover:bg-white/10 md:hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)]"
                )}
              >
                <div className="max-md:flex max-md:items-start max-md:gap-3">
                  <div
                    className={cn(
                      "flex shrink-0 items-center justify-center transition-all duration-300",
                      feature.accent,
                      "max-md:h-10 max-md:w-10 max-md:rounded-2xl max-md:border max-md:border-white/10",
                      "max-md:bg-gradient-to-br max-md:from-sky-400/22 max-md:via-brand-500/18 max-md:to-brand-700/24 max-md:text-brand-100",
                      "max-md:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_12px_-6px_rgba(0,105,198,0.35)]",
                      "max-md:duration-[220ms] max-md:group-active/icon:scale-[1.03]",
                      "h-14 w-14 rounded-2xl md:group-hover/icon:scale-105"
                    )}
                  >
                    <feature.icon
                      className="h-6 w-6 max-md:h-[18px] max-md:w-[18px]"
                      strokeWidth={1.5}
                    />
                  </div>

                  <div className="max-md:min-w-0 max-md:flex-1">
                    <h3
                      className={cn(
                        "font-semibold leading-snug text-white",
                        "mt-6 text-lg max-md:mt-0 max-md:text-[15px] max-md:font-extrabold max-md:leading-[1.2]"
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={cn(
                        "leading-relaxed text-white/60",
                        "mt-3 text-sm max-md:mt-0.5 max-md:line-clamp-2 max-md:text-[13px] max-md:leading-[1.3] max-md:text-white/48"
                      )}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
