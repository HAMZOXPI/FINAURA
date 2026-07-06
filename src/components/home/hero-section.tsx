"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Search } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";
import { MOROCCAN_CITIES, PROPERTY_TYPE_VALUES } from "@/lib/constants";
import { cn, getPropertyTypeLabel } from "@/lib/utils";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1569388337122-48a945fd1649?w=2400&q=85&auto=format&fit=crop";

const FIELD_CLASS =
  "flex min-h-[3.25rem] w-full flex-col justify-center gap-0.5 px-4 md:h-14 md:min-h-0 md:gap-1";

export function HeroSection() {
  const { t, locale } = useTranslation();
  const isRtl = locale === "ar";

  return (
    <section className="relative min-h-[88vh] lg:min-h-[92vh]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Immobilier au Maroc"
          fill
          priority
          className="scale-105 object-cover object-center"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/70 via-black/20 to-brand-900/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.35)_100%)]" />
      </div>

      <div className="container-app relative z-10 flex min-h-[88vh] flex-col pt-28 lg:min-h-[92vh] lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex max-w-4xl flex-1 flex-col justify-center pb-8 text-center lg:pb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/95 backdrop-blur-md"
          >
            {t.home.heroBadge}
          </motion.span>

          <h1 className="mt-8 text-4xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-7xl">
            {t.home.heroTitle}{" "}
            <span className="bg-gradient-to-r from-brand-200 via-white to-brand-300 bg-clip-text text-transparent">
              {t.home.heroHighlight}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/90 drop-shadow-sm sm:text-lg lg:text-xl">
            {t.home.heroSubtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 mb-[-2.5rem] w-full shrink-0 pb-6 lg:mb-[-2.5rem] lg:pb-8"
        >
          <form
            action="/properties"
            method="GET"
            dir={isRtl ? "rtl" : "ltr"}
            className="mx-auto flex w-full max-w-4xl flex-col gap-2 rounded-[1.75rem] border border-white/20 bg-white/[0.97] p-2 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.18),0_20px_48px_-12px_rgba(0,0,0,0.28)] backdrop-blur-xl md:h-[4.25rem] md:flex-row md:items-center md:gap-0 md:rounded-full md:p-1.5"
          >
            <div className="flex min-w-0 flex-1 flex-col md:h-14 md:flex-row md:items-stretch">
              <div
                className={cn(
                  FIELD_CLASS,
                  "border-b border-surface-200/90 md:flex-1 md:border-b-0 md:border-e md:border-surface-200"
                )}
              >
                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-surface-500 sm:text-[11px]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {t.home.searchCity}
                </label>
                <select
                  name="city"
                  defaultValue=""
                  className="h-6 w-full appearance-none bg-transparent text-start text-sm font-medium leading-none text-surface-900 outline-none sm:h-7"
                >
                  <option value="">{t.home.searchCityPlaceholder}</option>
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className={cn(FIELD_CLASS, "md:flex-1")}>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-surface-500 sm:text-[11px]">
                  {t.home.searchType}
                </label>
                <select
                  name="property_type"
                  defaultValue=""
                  className="h-6 w-full appearance-none bg-transparent text-start text-sm font-medium leading-none text-surface-900 outline-none sm:h-7"
                >
                  <option value="">{t.home.allTypes}</option>
                  {PROPERTY_TYPE_VALUES.map((type) => (
                    <option key={type} value={type}>
                      {getPropertyTypeLabel(type, t)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="flex h-[3.25rem] w-full shrink-0 items-center justify-center gap-2 self-center rounded-[1.25rem] bg-brand-600 px-6 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(0,105,198,0.45)] transition-all duration-200 hover:bg-brand-700 hover:shadow-[0_6px_20px_-2px_rgba(0,105,198,0.5)] md:h-14 md:w-auto md:min-w-[9.5rem] md:rounded-full md:px-8"
            >
              <Search className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
              {t.home.search}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
