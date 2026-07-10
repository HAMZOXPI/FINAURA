import type { PropertyType } from "@/types/database";

export const HERO_POPULAR_CITIES = [
  "Casablanca",
  "Marrakech",
  "Agadir",
  "Rabat",
] as const;

export const HERO_POPULAR_TYPES: PropertyType[] = [
  "appartement",
  "villa",
  "terrain",
];

export const RECENT_SEARCHES_KEY = "finaura-hero-recent-searches";
export const MAX_RECENT_SEARCHES = 5;

export interface HeroRecentSearch {
  city: string;
  propertyType: string;
  label: string;
  timestamp: number;
}

export function getRecentSearches(): HeroRecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HeroRecentSearch[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(entry: Omit<HeroRecentSearch, "timestamp">) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentSearches().filter(
      (item) => !(item.city === entry.city && item.propertyType === entry.propertyType)
    );
    const next: HeroRecentSearch[] = [
      { ...entry, timestamp: Date.now() },
      ...existing,
    ].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors */
  }
}

export type QuickFilterId =
  | "premium"
  | "maison"
  | "appartement"
  | "villa"
  | "reduced"
  | "verified";

export interface QuickFilterConfig {
  id: QuickFilterId;
  propertyType?: PropertyType;
  comingSoon?: boolean;
}

export const QUICK_FILTER_CONFIGS: QuickFilterConfig[] = [
  { id: "premium", comingSoon: true },
  { id: "maison", propertyType: "maison" },
  { id: "appartement", propertyType: "appartement" },
  { id: "villa", propertyType: "villa" },
  { id: "reduced", comingSoon: true },
  { id: "verified", comingSoon: true },
];

export const ADVANCED_FILTER_KEYS = [
  "bedrooms",
  "bathrooms",
  "area",
  "parking",
  "garden",
  "pool",
  "furnished",
  "boosted",
  "premium",
] as const;

export type HeroAdvancedAmenityKey = "parking" | "pool" | "garden" | "furnished";

export const HERO_ADVANCED_FILTER_PROPERTY_TYPES = [
  "appartement",
  "villa",
  "maison",
  "terrain",
] as const satisfies readonly PropertyType[];

export interface HeroAdvancedFiltersState {
  propertyTypes: PropertyType[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: Record<HeroAdvancedAmenityKey, boolean>;
}

export const EMPTY_HERO_ADVANCED_FILTERS: HeroAdvancedFiltersState = {
  propertyTypes: [],
  bedrooms: 0,
  bathrooms: 0,
  area: 0,
  amenities: {
    parking: false,
    pool: false,
    garden: false,
    furnished: false,
  },
};

export const HERO_ADVANCED_FILTERS_UI_DEFAULTS: HeroAdvancedFiltersState = {
  propertyTypes: [],
  bedrooms: 2,
  bathrooms: 1,
  area: 100,
  amenities: {
    parking: false,
    pool: false,
    garden: false,
    furnished: false,
  },
};

export function hasAppliedAdvancedFilters(filters: HeroAdvancedFiltersState): boolean {
  return (
    filters.propertyTypes.length > 0 ||
    filters.bedrooms > 0 ||
    filters.bathrooms > 0 ||
    filters.area > 0 ||
    Object.values(filters.amenities).some(Boolean)
  );
}

export function getHeroAdvancedFiltersDraft(
  applied: HeroAdvancedFiltersState
): HeroAdvancedFiltersState {
  if (!hasAppliedAdvancedFilters(applied)) {
    return {
      ...HERO_ADVANCED_FILTERS_UI_DEFAULTS,
      amenities: { ...HERO_ADVANCED_FILTERS_UI_DEFAULTS.amenities },
    };
  }

  return {
    ...applied,
    propertyTypes: [...applied.propertyTypes],
    amenities: { ...applied.amenities },
  };
}
