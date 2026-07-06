"use client";

import {
  Bed,
  Bath,
  Maximize,
  Building2,
  Sofa,
  Car,
  Trees,
  Waves,
} from "lucide-react";
import type { Property } from "@/types/database";
import { formatArea } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import type { FeatureKey } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface PropertyDetailFeaturesProps {
  property: Property;
  typeLabel: string;
}

function hasFeature(features: string[], key: string): boolean {
  return features.some((feature) => feature.toLowerCase() === key.toLowerCase());
}

export function PropertyDetailFeatures({ property, typeLabel }: PropertyDetailFeaturesProps) {
  const { t, locale } = useTranslation();
  const showRooms = property.property_type !== "terrain";

  const getFeatureLabel = (feature: string) => {
    const key = feature as FeatureKey;
    return t.features[key as keyof typeof t.features] ?? feature;
  };

  const items: {
    icon: typeof Bed;
    label: string;
    value: string;
    show: boolean;
  }[] = [
    {
      icon: Bed,
      label: t.form.bedrooms,
      value: String(property.bedrooms),
      show: showRooms,
    },
    {
      icon: Bath,
      label: t.form.bathrooms,
      value: String(property.bathrooms),
      show: showRooms,
    },
    {
      icon: Maximize,
      label: t.form.area,
      value: formatArea(property.area_sqft, locale),
      show: true,
    },
    {
      icon: Building2,
      label: t.form.propertyType,
      value: typeLabel,
      show: true,
    },
    {
      icon: Sofa,
      label: t.propertyDetail.furnished,
      value: hasFeature(property.features, "furnished")
        ? t.propertyDetail.furnishedYes
        : t.propertyDetail.furnishedNo,
      show: true,
    },
    {
      icon: Car,
      label: t.features.parking,
      value: hasFeature(property.features, "parking") || hasFeature(property.features, "garage")
        ? t.propertyDetail.available
        : t.propertyDetail.notAvailable,
      show: true,
    },
    {
      icon: Trees,
      label: t.features.garden,
      value: hasFeature(property.features, "garden")
        ? t.propertyDetail.available
        : t.propertyDetail.notAvailable,
      show: true,
    },
    {
      icon: Waves,
      label: t.features.pool,
      value: hasFeature(property.features, "pool")
        ? t.propertyDetail.available
        : t.propertyDetail.notAvailable,
      show: true,
    },
  ];

  return (
    <section>
      <h2 className="text-xl font-bold text-surface-900 sm:text-2xl">
        {t.propertyDetail.featuresTitle}
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items
          .filter((item) => item.show)
          .map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center rounded-2xl border border-surface-200/80 bg-white p-5 text-center shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-shadow duration-[250ms] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <item.icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-surface-500">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-surface-900">{item.value}</p>
            </div>
          ))}
      </div>

      {property.features.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-surface-500">
            {t.properties.features}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {property.features.map((feature) => (
              <Badge key={feature} variant="brand">
                {getFeatureLabel(feature)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
