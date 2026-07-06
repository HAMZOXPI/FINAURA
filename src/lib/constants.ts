import type { PropertyType, PropertyStatus, ListingStatus } from "@/types/database";

export const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";

export const DEFAULT_COUNTRY = "Maroc";

export const MOROCCAN_CITIES = [
  "Agadir",
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Fès",
  "Meknès",
  "Oujda",
  "Tétouan",
  "Laâyoune",
  "Dakhla",
] as const;

export const PROPERTY_TYPE_VALUES: PropertyType[] = [
  "appartement",
  "villa",
  "maison",
  "terrain",
  "local_commercial",
  "bureau",
  "ferme",
  "riad",
];

export const PROPERTY_STATUS_VALUES: PropertyStatus[] = [
  "for_sale",
  "for_rent",
  "sold",
  "pending",
];

export const LISTING_STATUS_VALUES: ListingStatus[] = ["draft", "published", "archived"];

export const FEATURE_KEYS = [
  "pool",
  "garage",
  "garden",
  "smartHome",
  "fireplace",
  "gym",
  "balcony",
  "petFriendly",
  "mountainView",
  "oceanView",
  "terrace",
  "parking",
  "elevator",
  "security",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

/** Default map center: Casablanca */
export const DEFAULT_MAP_LAT = 33.5731;
export const DEFAULT_MAP_LNG = -7.5898;
