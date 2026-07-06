"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Property, PropertyStatus } from "@/types/database";
import type { Locale } from "@/i18n/config";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyMapListCardProps {
  property: Property;
  isActive?: boolean;
  onSelect: (property: Property) => void;
}

function formatCardPrice(price: number, status: PropertyStatus, locale: Locale): string {
  const num = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace(/\u00a0/g, " ");

  const base = `${num} DH`;
  const rentSuffix = locale === "ar" ? "/شهر" : "/mois";
  return status === "for_rent" ? `${base}${rentSuffix}` : base;
}

export function PropertyMapListCard({
  property,
  isActive = false,
  onSelect,
}: PropertyMapListCardProps) {
  const { locale } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const propertyHref = `/properties/${property.id}`;

  useEffect(() => {
    if (!isActive || !cardRef.current) return;
    cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isActive]);

  return (
    <motion.div
      ref={cardRef}
      layout
      role="button"
      tabIndex={0}
      onClick={() => onSelect(property)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(property);
        }
      }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.28 }}
      className={cn(
        "flex w-full cursor-pointer gap-3 rounded-[18px] border bg-white p-3 text-start shadow-sm transition-all duration-300",
        isActive
          ? "border-brand-400 ring-2 ring-brand-500/20 shadow-[0_8px_24px_-8px_rgba(0,105,198,0.35)]"
          : "border-surface-200/80 hover:border-brand-200 hover:shadow-md"
      )}
    >
      <Link
        href={propertyHref}
        onClick={(event) => event.stopPropagation()}
        className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl"
        aria-label={property.title}
      >
        <Image
          src={property.images[0] || PLACEHOLDER_IMAGE}
          alt={property.title}
          fill
          className="object-cover"
          sizes="112px"
        />
      </Link>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="text-base font-bold text-brand-700">
          {formatCardPrice(property.price, property.status, locale)}
        </p>
        <Link
          href={propertyHref}
          onClick={(event) => event.stopPropagation()}
          className="mt-1 block line-clamp-2 text-sm font-semibold text-surface-900 transition-colors hover:text-brand-700"
        >
          {property.title}
        </Link>
        <p className="mt-2 flex items-center gap-1 text-xs text-surface-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
          <span className="truncate">{property.city}</span>
        </p>
        <Link
          href={propertyHref}
          onClick={(event) => event.stopPropagation()}
          className="mt-2 inline-flex text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          Voir
        </Link>
      </div>
    </motion.div>
  );
}
