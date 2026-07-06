"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Property, PropertyStatus } from "@/types/database";
import type { Locale } from "@/i18n/config";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { useTranslation } from "@/i18n/locale-provider";

interface SimilarPropertiesSectionProps {
  properties: Property[];
}

function formatCompactPrice(price: number, status: PropertyStatus, locale: Locale): string {
  const num = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace(/\u00a0/g, " ");

  const base = `${num} DH`;
  return status === "for_rent" ? `${base}${locale === "ar" ? "/شهر" : "/mois"}` : base;
}

export function SimilarPropertiesSection({ properties }: SimilarPropertiesSectionProps) {
  const { t, locale } = useTranslation();

  if (properties.length === 0) return null;

  return (
    <section className="mt-16 border-t border-surface-200 pt-12">
      <h2 className="text-xl font-bold text-surface-900 sm:text-2xl">
        {t.propertyDetail.similarTitle}
      </h2>
      <p className="mt-2 text-surface-500">{t.propertyDetail.similarSubtitle}</p>

      <div className="-mx-4 mt-8 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-thin md:mx-0 md:px-0">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className="w-[280px] shrink-0 snap-start sm:w-[300px]"
          >
            <Link
              href={`/properties/${property.id}`}
              className="group block overflow-hidden rounded-[20px] border border-surface-200/80 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)]"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={property.images[0] || PLACEHOLDER_IMAGE}
                  alt={property.title}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-[250ms] group-hover:scale-105"
                  sizes="300px"
                />
              </div>
              <div className="p-4">
                <p
                  className="text-lg font-bold text-surface-900"
                  dir={locale === "ar" ? "ltr" : undefined}
                >
                  <span className="[unicode-bidi:isolate]">
                    {formatCompactPrice(property.price, property.status, locale)}
                  </span>
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-surface-800 group-hover:text-brand-700">
                  {property.title}
                </h3>
                <p className="mt-2 flex items-center gap-1 text-xs text-surface-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">
                    {property.city}
                    {property.state ? `, ${property.state}` : ""}
                  </span>
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
