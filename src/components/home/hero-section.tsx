"use client";



import Image from "next/image";

import { motion } from "framer-motion";

import { HeroPremiumSearch } from "@/components/home/hero/hero-premium-search";

import { useTranslation } from "@/i18n/locale-provider";



const HERO_IMAGE =

  "https://images.unsplash.com/photo-1569388337122-48a945fd1649?w=2400&q=85&auto=format&fit=crop";



export function HeroSection() {

  const { t } = useTranslation();



  return (

    <section className="relative min-h-[88vh] max-md:min-h-0 lg:min-h-[92vh]">

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



      <div className="container-app relative z-10 flex min-h-[88vh] flex-col pt-28 max-md:min-h-0 max-md:px-5 max-md:pb-4 lg:min-h-[92vh] lg:pt-32">

        <motion.div

          initial={{ opacity: 0, y: 32 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}

          className="mx-auto flex max-w-4xl flex-1 flex-col justify-center pb-8 text-center max-md:flex-none max-md:pb-6 lg:pb-12"

        >

          <motion.span

            initial={{ opacity: 0, scale: 0.95 }}

            animate={{ opacity: 1, scale: 1 }}

            transition={{ delay: 0.15, duration: 0.5 }}

            className="mx-auto inline-flex w-fit items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/95 backdrop-blur-md"

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



        <HeroPremiumSearch />

      </div>

    </section>

  );

}

