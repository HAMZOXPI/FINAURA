"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  GraduationCap,
  HeartPulse,
  MapPin,
  ShoppingBag,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import type { Property } from "@/types/database";
import { NEARBY_CATEGORIES, type NearbyCategory } from "@/lib/property/details-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const PropertyMap = dynamic(
  () => import("@/components/properties/property-map").then((m) => m.PropertyMap),
  {
    loading: () => (
      <div className="h-72 animate-pulse rounded-[20px] bg-surface-200 sm:h-96" />
    ),
  }
);

const NEARBY_ICONS: Record<NearbyCategory, typeof MapPin> = {
  schools: GraduationCap,
  hospitals: HeartPulse,
  restaurants: UtensilsCrossed,
  mosques: Star,
  shopping: ShoppingBag,
};

interface PropertyMapSectionProps {
  property: Property;
}

export function PropertyMapSection({ property }: PropertyMapSectionProps) {
  const { t } = useTranslation();

  if (!property.latitude || !property.longitude) return null;

  const nearbyLabels: Record<NearbyCategory, string> = {
    schools: t.propertyDetail.nearbySchools,
    hospitals: t.propertyDetail.nearbyHospitals,
    restaurants: t.propertyDetail.nearbyRestaurants,
    mosques: t.propertyDetail.nearbyMosques,
    shopping: t.propertyDetail.nearbyShopping,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="property-map-heading"
      className="rounded-[24px] border border-surface-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]"
    >
      <h2 id="property-map-heading" className="text-xl font-bold text-surface-900 sm:text-2xl">
        {t.properties.location}
      </h2>
      <p className="mt-2 flex items-start gap-2 text-sm text-surface-500">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
        <span>
          {property.address}, {property.city}, {property.state} {property.zip_code}
        </span>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {NEARBY_CATEGORIES.map((category) => {
          const Icon = NEARBY_ICONS[category];
          return (
            <span
              key={category}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-surface-200/80 bg-surface-50 px-3 py-1.5 text-xs font-medium text-surface-500"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {nearbyLabels[category]}
              <span className="text-surface-400">· {t.propertyDetail.comingSoon}</span>
            </span>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-[20px] border border-surface-200/80 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]">
        <PropertyMap
          latitude={property.latitude}
          longitude={property.longitude}
          title={property.title}
        />
      </div>
    </motion.section>
  );
}
