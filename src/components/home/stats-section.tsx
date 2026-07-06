"use client";

import { Building2, MapPin, Users, ThumbsUp } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";
import { AnimatedStat } from "@/components/home/animated-stat";
import { MotionSection, MotionStagger, MotionItem } from "@/components/home/motion-section";

const STATS = [
  { key: "statListings" as const, value: 2500, suffix: "+", icon: Building2 },
  { key: "statCities" as const, value: 11, suffix: "", icon: MapPin },
  { key: "statUsers" as const, value: 10000, suffix: "+", icon: Users },
  { key: "statSatisfaction" as const, value: 98, suffix: "%", icon: ThumbsUp },
];

export function StatsSection() {
  const { t, locale } = useTranslation();

  return (
    <section className="border-y border-surface-200 bg-white py-16 lg:py-20">
      <div className="container-app">
        <MotionSection className="mb-12 text-center lg:mb-16">
          <h2 className="text-2xl font-bold text-surface-900 sm:text-3xl">{t.home.statsTitle}</h2>
          <p className="mt-3 text-surface-500">{t.home.statsSubtitle}</p>
        </MotionSection>

        <MotionStagger className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {STATS.map((stat) => (
            <MotionItem key={stat.key}>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <stat.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
                  <AnimatedStat
                    value={stat.value}
                    suffix={stat.suffix}
                    locale={locale}
                  />
                </p>
                <p className="mt-2 text-sm font-medium text-surface-500">{t.home[stat.key]}</p>
              </div>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
