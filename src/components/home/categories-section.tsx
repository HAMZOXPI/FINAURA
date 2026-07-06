"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Home,
  Landmark,
  Map,
  Store,
  Briefcase,
  Trees,
  Sparkles,
} from "lucide-react";
import type { PropertyType } from "@/types/database";
import { useTranslation } from "@/i18n/locale-provider";
import { PROPERTY_TYPE_VALUES } from "@/lib/constants";
import { getPropertyTypeLabel } from "@/lib/utils";
import { MotionSection, MotionStagger, MotionItem } from "@/components/home/motion-section";

const CATEGORY_ICONS: Record<PropertyType, typeof Building2> = {
  appartement: Building2,
  villa: Landmark,
  maison: Home,
  terrain: Map,
  local_commercial: Store,
  bureau: Briefcase,
  ferme: Trees,
  riad: Sparkles,
};

const CATEGORY_GRADIENTS = [
  "from-amber-500/10 to-orange-600/5",
  "from-brand-500/10 to-brand-700/5",
  "from-emerald-500/10 to-teal-600/5",
  "from-violet-500/10 to-purple-600/5",
  "from-rose-500/10 to-pink-600/5",
  "from-sky-500/10 to-blue-600/5",
  "from-lime-500/10 to-green-600/5",
  "from-fuchsia-500/10 to-purple-600/5",
];

export function CategoriesSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-app">
        <MotionSection className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
            {t.home.categoriesTitle}
          </h2>
          <p className="mt-4 text-lg text-surface-500">{t.home.categoriesSubtitle}</p>
        </MotionSection>

        <MotionStagger className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4 lg:gap-6">
          {PROPERTY_TYPE_VALUES.map((type, index) => {
            const Icon = CATEGORY_ICONS[type];
            const gradient = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length];

            return (
              <MotionItem key={type}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                >
                  <Link
                    href={`/properties?property_type=${type}`}
                    className="group flex flex-col items-center rounded-3xl border border-surface-200/80 bg-white p-6 text-center shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] transition-[box-shadow,border-color] duration-300 hover:border-brand-200 hover:shadow-[0_20px_40px_-12px_rgba(0,105,198,0.18)] lg:p-8"
                  >
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-brand-600 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    <span className="mt-4 text-sm font-semibold text-surface-800 transition-colors duration-300 group-hover:text-brand-700">
                      {getPropertyTypeLabel(type, t)}
                    </span>
                  </Link>
                </motion.div>
              </MotionItem>
            );
          })}
        </MotionStagger>
      </div>
    </section>
  );
}
