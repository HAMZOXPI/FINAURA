import type { Locale } from "@/i18n/config";
import type { Property, PropertyStatus, SellerPublicProfile } from "@/types/database";
import type { FeatureKey } from "@/lib/constants";
import { FEATURE_KEYS } from "@/lib/constants";
import { formatArea } from "@/lib/utils";

export function formatDetailPrice(
  price: number,
  status: PropertyStatus,
  locale: Locale
): string {
  const num = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace(/\u00a0/g, " ");

  const base = `${num} DH`;
  const rentSuffix = locale === "ar" ? "/شهر" : "/mois";
  return status === "for_rent" ? `${base}${rentSuffix}` : base;
}

export function getStatusBadgeClass(status: PropertyStatus): string {
  switch (status) {
    case "for_rent":
      return "bg-brand-50 text-brand-700 ring-brand-200/60";
    case "sold":
      return "bg-surface-100 text-surface-600 ring-surface-200/60";
    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-200/60";
    default:
      return "bg-emerald-50 text-emerald-700 ring-emerald-200/60";
  }
}

export function hasFeature(features: string[], key: string): boolean {
  return features.some((feature) => feature.toLowerCase() === key.toLowerCase());
}

/** Simple frontend mortgage estimate (UI only). */
export function calculateMonthlyMortgage(
  price: number,
  downPayment: number,
  years: number,
  annualRate = 0.05
): number {
  const principal = Math.max(price - downPayment, 0);
  if (principal <= 0 || years <= 0) return 0;

  const monthlyRate = annualRate / 12;
  const months = years * 12;

  if (monthlyRate === 0) return principal / months;

  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function formatMortgageAmount(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 0,
  })
    .format(Math.round(amount))
    .replace(/\u00a0/g, " ");
}

export interface HighlightConfig {
  key: string;
  label: string;
  value: string;
  numericValue?: number;
  available?: boolean;
  show: boolean;
}

export function buildHighlightConfigs(
  property: Property,
  typeLabel: string,
  labels: {
    bedrooms: string;
    bathrooms: string;
    area: string;
    propertyType: string;
    furnished: string;
    furnishedYes: string;
    furnishedNo: string;
    parking: string;
    garden: string;
    pool: string;
    available: string;
    notAvailable: string;
  },
  locale: Locale
): HighlightConfig[] {
  const showRooms = property.property_type !== "terrain";
  const furnished = hasFeature(property.features, "furnished");
  const parking =
    hasFeature(property.features, "parking") || hasFeature(property.features, "garage");
  const garden = hasFeature(property.features, "garden");
  const pool = hasFeature(property.features, "pool");

  return [
    {
      key: "bedrooms",
      label: labels.bedrooms,
      value: String(property.bedrooms),
      numericValue: property.bedrooms,
      show: showRooms,
    },
    {
      key: "bathrooms",
      label: labels.bathrooms,
      value: String(property.bathrooms),
      numericValue: property.bathrooms,
      show: showRooms,
    },
    {
      key: "area",
      label: labels.area,
      value: formatArea(property.area_sqft, locale),
      numericValue: property.area_sqft,
      show: true,
    },
    {
      key: "type",
      label: labels.propertyType,
      value: typeLabel,
      show: true,
    },
    {
      key: "parking",
      label: labels.parking,
      value: parking ? labels.available : labels.notAvailable,
      available: parking,
      show: true,
    },
    {
      key: "garden",
      label: labels.garden,
      value: garden ? labels.available : labels.notAvailable,
      available: garden,
      show: true,
    },
    {
      key: "pool",
      label: labels.pool,
      value: pool ? labels.available : labels.notAvailable,
      available: pool,
      show: true,
    },
    {
      key: "furnished",
      label: labels.furnished,
      value: furnished ? labels.furnishedYes : labels.furnishedNo,
      available: furnished,
      show: true,
    },
  ].filter((item) => item.show);
}

export const AMENITY_FEATURE_KEYS: FeatureKey[] = [
  "security",
  "elevator",
  "terrace",
  "balcony",
  "parking",
  "garden",
  "pool",
];

export const EXTRA_AMENITY_KEYS = ["wifi", "airConditioning", "kitchen"] as const;

export type ExtraAmenityKey = (typeof EXTRA_AMENITY_KEYS)[number];

export function buildAmenityList(
  property: Property,
  featureLabels: Record<string, string>,
  extraLabels: Record<ExtraAmenityKey, string>
): { key: string; label: string; available: boolean }[] {
  const amenities: { key: string; label: string; available: boolean }[] = [];

  for (const key of EXTRA_AMENITY_KEYS) {
    amenities.push({
      key,
      label: extraLabels[key],
      available: hasFeature(property.features, key),
    });
  }

  for (const key of AMENITY_FEATURE_KEYS) {
    if (key === "parking") {
      amenities.push({
        key,
        label: featureLabels.parking ?? key,
        available:
          hasFeature(property.features, "parking") || hasFeature(property.features, "garage"),
      });
      continue;
    }
    amenities.push({
      key,
      label: featureLabels[key as FeatureKey] ?? key,
      available: hasFeature(property.features, key),
    });
  }

  const known = new Set([...EXTRA_AMENITY_KEYS, ...AMENITY_FEATURE_KEYS, "garage", "furnished"]);
  for (const feature of property.features) {
    if (known.has(feature as FeatureKey | ExtraAmenityKey)) continue;
    amenities.push({
      key: feature,
      label: featureLabels[feature as FeatureKey] ?? feature,
      available: true,
    });
  }

  return amenities;
}

export function buildTrustItems(
  property: Property,
  seller: SellerPublicProfile | null,
  labels: {
    verifiedSeller: string;
    verifiedListing: string;
    secureCommunication: string;
    supportAvailable: string;
  }
) {
  return [
    {
      key: "verified-seller",
      label: labels.verifiedSeller,
      active: Boolean(seller?.verification.verifiedSeller),
    },
    {
      key: "verified-listing",
      label: labels.verifiedListing,
      active: property.is_featured,
    },
    {
      key: "secure-communication",
      label: labels.secureCommunication,
      active: true,
    },
    {
      key: "support",
      label: labels.supportAvailable,
      active: true,
    },
  ];
}

export const NEARBY_CATEGORIES = [
  "schools",
  "hospitals",
  "restaurants",
  "mosques",
  "shopping",
] as const;

export type NearbyCategory = (typeof NEARBY_CATEGORIES)[number];

export function isPremiumProperty(property: Property): boolean {
  return Boolean(property.is_featured);
}

export { FEATURE_KEYS };
