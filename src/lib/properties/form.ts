import {
  ADMIN_REJECTED_FEATURE,
  ADMIN_REJECTION_PREFIX,
  withoutAdminMarkers,
} from "@/lib/admin/property-status";
import {
  LISTING_STATUS_VALUES,
  PROPERTY_STATUS_VALUES,
  PROPERTY_TYPE_VALUES,
} from "@/lib/constants";
import type {
  ListingStatus,
  Property,
  PropertyStatus,
  PropertyType,
} from "@/types/database";

export interface ParsedPropertyForm {
  title: string;
  description: string;
  price: number;
  property_type: PropertyType;
  status: PropertyStatus;
  listing_status: ListingStatus;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  features: string[];
  images: string[];
}

type FormDictionary = {
  form: {
    title: string;
    description: string;
    price: string;
    area: string;
    address: string;
    city: string;
    region: string;
    postalCode: string;
    imagesTitle: string;
  };
};

export function parsePropertyForm(formData: FormData): ParsedPropertyForm {
  const featuresRaw = formData.get("features") as string;
  const imagesRaw = formData.get("images") as string;
  const lat = formData.get("latitude") as string;
  const lng = formData.get("longitude") as string;

  return {
    title: (formData.get("title") as string)?.trim() ?? "",
    description: (formData.get("description") as string)?.trim() ?? "",
    price: Number(formData.get("price")),
    property_type: formData.get("property_type") as PropertyType,
    status: formData.get("status") as PropertyStatus,
    listing_status: ((formData.get("listing_status") as ListingStatus) || "draft") as ListingStatus,
    bedrooms: Number(formData.get("bedrooms") || 0),
    bathrooms: Number(formData.get("bathrooms") || 0),
    area_sqft: Number(formData.get("area_sqft")),
    address: (formData.get("address") as string)?.trim() ?? "",
    city: (formData.get("city") as string)?.trim() ?? "",
    state: (formData.get("state") as string)?.trim() ?? "",
    zip_code: (formData.get("zip_code") as string)?.trim() ?? "",
    country: ((formData.get("country") as string) || "Maroc").trim(),
    latitude: lat ? Number(lat) : null,
    longitude: lng ? Number(lng) : null,
    features: featuresRaw
      ? featuresRaw
          .split(",")
          .map((feature) => feature.trim())
          .filter(Boolean)
      : [],
    images: imagesRaw ? (JSON.parse(imagesRaw) as string[]) : [],
  };
}

export function validatePropertyForm(
  data: ParsedPropertyForm,
  dict: FormDictionary
): string | null {
  if (!data.title) return `${dict.form.title} is required`;
  if (!data.description) return `${dict.form.description} is required`;
  if (!Number.isFinite(data.price) || data.price < 0) return `${dict.form.price} is invalid`;
  if (!Number.isFinite(data.area_sqft) || data.area_sqft <= 0) return `${dict.form.area} is invalid`;
  if (!PROPERTY_TYPE_VALUES.includes(data.property_type)) return "Invalid property type";
  if (!PROPERTY_STATUS_VALUES.includes(data.status)) return "Invalid property status";
  if (!LISTING_STATUS_VALUES.includes(data.listing_status)) return "Invalid listing status";
  if (!data.address) return `${dict.form.address} is required`;
  if (!data.city) return `${dict.form.city} is required`;
  if (!data.state) return `${dict.form.region} is required`;
  if (!data.zip_code) return `${dict.form.postalCode} is required`;
  if (data.images.length === 0) return `${dict.form.imagesTitle} is required`;
  if (data.bedrooms < 0 || data.bathrooms < 0) return "Invalid room count";
  return null;
}

function getAdminFeatureMarkers(features: string[]): string[] {
  return features.filter(
    (feature) =>
      feature === ADMIN_REJECTED_FEATURE || feature.startsWith(ADMIN_REJECTION_PREFIX)
  );
}

export function mergePropertyFeaturesForUpdate(
  userFeatures: string[],
  existingFeatures: string[]
): string[] {
  const adminMarkers = getAdminFeatureMarkers(existingFeatures);
  const cleanedUserFeatures = withoutAdminMarkers(userFeatures);
  return [...cleanedUserFeatures, ...adminMarkers];
}

export function buildPropertyUpdatePayload(
  existing: Property,
  parsed: ParsedPropertyForm
): Omit<ParsedPropertyForm, never> {
  return {
    ...parsed,
    features: mergePropertyFeaturesForUpdate(parsed.features, existing.features),
  };
}

function numbersEqual(a: number | null, b: number | null): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return a === b;
}

export function hasPropertyChanges(existing: Property, parsed: ParsedPropertyForm): boolean {
  const payload = buildPropertyUpdatePayload(existing, parsed);

  if (existing.title !== payload.title) return true;
  if (existing.description !== payload.description) return true;
  if (existing.price !== payload.price) return true;
  if (existing.property_type !== payload.property_type) return true;
  if (existing.status !== payload.status) return true;
  if (existing.listing_status !== payload.listing_status) return true;
  if (existing.bedrooms !== payload.bedrooms) return true;
  if (existing.bathrooms !== payload.bathrooms) return true;
  if (existing.area_sqft !== payload.area_sqft) return true;
  if (existing.address !== payload.address) return true;
  if (existing.city !== payload.city) return true;
  if (existing.state !== payload.state) return true;
  if (existing.zip_code !== payload.zip_code) return true;
  if (existing.country !== payload.country) return true;
  if (!numbersEqual(existing.latitude, payload.latitude)) return true;
  if (!numbersEqual(existing.longitude, payload.longitude)) return true;

  const existingImages = existing.images ?? [];
  if (existingImages.length !== payload.images.length) return true;
  if (existingImages.some((image, index) => image !== payload.images[index])) return true;

  const existingUserFeatures = withoutAdminMarkers(existing.features ?? []).slice().sort();
  const nextUserFeatures = withoutAdminMarkers(payload.features).slice().sort();
  if (existingUserFeatures.length !== nextUserFeatures.length) return true;
  if (existingUserFeatures.some((feature, index) => feature !== nextUserFeatures[index])) {
    return true;
  }

  return false;
}
