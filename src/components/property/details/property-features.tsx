"use client";

import { motion } from "framer-motion";
import {
  AirVent,
  ArrowUpDown,
  Car,
  ChefHat,
  Flower2,
  Shield,
  Sun,
  Trees,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { Property } from "@/types/database";
import { buildAmenityList, type ExtraAmenityKey } from "@/lib/property/details-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const AMENITY_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  airConditioning: AirVent,
  security: Shield,
  elevator: ArrowUpDown,
  terrace: Sun,
  balcony: Sun,
  kitchen: ChefHat,
  parking: Car,
  garden: Trees,
  pool: Waves,
};

function getAmenityIcon(key: string): LucideIcon {
  return AMENITY_ICONS[key] ?? Flower2;
}

interface PropertyFeaturesProps {
  property: Property;
}

export function PropertyFeatures({ property }: PropertyFeaturesProps) {
  const { t } = useTranslation();

  const extraLabels: Record<ExtraAmenityKey, string> = {
    wifi: t.propertyDetail.amenityWifi,
    airConditioning: t.propertyDetail.amenityAirConditioning,
    kitchen: t.propertyDetail.amenityKitchen,
  };

  const amenities = buildAmenityList(property, t.features as Record<string, string>, extraLabels);

  if (amenities.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="property-features-heading"
    >
      <h2
        id="property-features-heading"
        className="text-xl font-bold text-surface-900 sm:text-2xl"
      >
        {t.properties.features}
      </h2>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.04 } },
        }}
        className="mt-6 flex flex-wrap gap-2.5"
      >
        {amenities.map((amenity) => {
          const Icon = getAmenityIcon(amenity.key);

          return (
            <motion.span
              key={amenity.key}
              variants={{
                hidden: { opacity: 0, scale: 0.92 },
                visible: { opacity: 1, scale: 1 },
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-[250ms]",
                amenity.available
                  ? "border-brand-200/60 bg-brand-50/50 text-brand-800 [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_6px_20px_-6px_rgba(0,105,198,0.2)]"
                  : "border-surface-200/60 bg-surface-50/80 text-surface-400 line-through decoration-surface-300/80"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {amenity.label}
            </motion.span>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
