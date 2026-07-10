"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Bath,
  Bed,
  Building2,
  Car,
  Maximize,
  Sofa,
  Trees,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { Property } from "@/types/database";
import { buildHighlightConfigs } from "@/lib/property/details-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const ICON_MAP: Record<string, LucideIcon> = {
  bedrooms: Bed,
  bathrooms: Bath,
  area: Maximize,
  type: Building2,
  parking: Car,
  garden: Trees,
  pool: Waves,
  furnished: Sofa,
};

interface PropertyHighlightsProps {
  property: Property;
  typeLabel: string;
}

function AnimatedValue({ value, numericValue }: { value: string; numericValue?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || numericValue === undefined || Number.isNaN(numericValue)) {
      setDisplay(value);
      return;
    }

    const duration = 700;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(String(Math.round(numericValue * eased)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, numericValue, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {numericValue !== undefined && inView ? display : value}
    </span>
  );
}

export function PropertyHighlights({ property, typeLabel }: PropertyHighlightsProps) {
  const { t, locale } = useTranslation();

  const items = buildHighlightConfigs(property, typeLabel, {
    bedrooms: t.form.bedrooms,
    bathrooms: t.form.bathrooms,
    area: t.form.area,
    propertyType: t.form.propertyType,
    furnished: t.propertyDetail.furnished,
    furnishedYes: t.propertyDetail.furnishedYes,
    furnishedNo: t.propertyDetail.furnishedNo,
    parking: t.features.parking,
    garden: t.features.garden,
    pool: t.features.pool,
    available: t.propertyDetail.available,
    notAvailable: t.propertyDetail.notAvailable,
  }, locale);

  return (
    <section aria-labelledby="property-highlights-heading">
      <h2
        id="property-highlights-heading"
        className="sticky top-20 z-10 bg-surface-50/95 py-2 text-xl font-bold text-surface-900 backdrop-blur-sm sm:text-2xl lg:static lg:bg-transparent lg:py-0"
      >
        {t.propertyDetail.featuresTitle}
      </h2>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
        className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {items.map((item) => {
          const Icon = ICON_MAP[item.key] ?? Building2;
          const muted = item.available === false;

          return (
            <motion.div
              key={item.key}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "group flex flex-col rounded-[20px] border bg-white p-5 transition-all duration-[250ms]",
                "shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_12px_32px_-10px_rgba(0,105,198,0.12)]",
                muted
                  ? "border-surface-200/60 opacity-60"
                  : "border-surface-200/80 hover:border-brand-200/60"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-[250ms]",
                  muted ? "bg-surface-100 text-surface-400" : "bg-brand-50 text-brand-600 group-hover:bg-brand-100"
                )}
              >
                <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-bold text-surface-900">
                <AnimatedValue value={item.value} numericValue={item.numericValue} />
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
