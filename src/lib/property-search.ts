import { PROPERTY_TYPE_VALUES } from "@/lib/constants";
import type { PropertyFilters, PropertyStatus, PropertyType } from "@/types/database";

const PROPERTY_TYPE_SET = new Set<string>(PROPERTY_TYPE_VALUES);

const PROPERTY_TYPE_ALIASES: Record<string, PropertyType> = {
  apartment: "appartement",
  appartement: "appartement",
  flat: "appartement",
  villa: "villa",
  house: "maison",
  maison: "maison",
  land: "terrain",
  terrain: "terrain",
  commercial: "local_commercial",
  local_commercial: "local_commercial",
  office: "bureau",
  bureau: "bureau",
  farm: "ferme",
  ferme: "ferme",
  riad: "riad",
};

const STATUS_ALIASES: Record<string, PropertyStatus> = {
  for_sale: "for_sale",
  sale: "for_sale",
  buy: "for_sale",
  for_rent: "for_rent",
  rent: "for_rent",
  rental: "for_rent",
  sold: "sold",
  pending: "pending",
};

export interface PropertySearchFormValues {
  search: string;
  city: string;
  region: string;
  property_type: string;
  status: string;
  min_bedrooms: string;
  min_bathrooms: string;
  min_area: string;
  min_price: string;
  max_price: string;
  sort: string;
  page?: string;
  view?: string;
  layout?: string;
}

export function sanitizeIlikePattern(value: string): string {
  return value.replace(/[%_,\\]/g, "").trim();
}

export function normalizePropertyType(value?: string | null): PropertyType | undefined {
  if (!value) return undefined;

  const normalized = value.trim().toLowerCase();
  if (PROPERTY_TYPE_SET.has(normalized)) {
    return normalized as PropertyType;
  }

  return PROPERTY_TYPE_ALIASES[normalized];
}

export function normalizePropertyStatus(value?: string | null): PropertyStatus | undefined {
  if (!value) return undefined;
  return STATUS_ALIASES[value.trim().toLowerCase()];
}

function parseNumber(value?: string | null): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function parsePropertySearchParams(
  params: Record<string, string | undefined>
): PropertyFilters {
  const rawType = params.property_type ?? params.type;
  const rawStatus = params.status ?? params.sale_rent;

  const rawSearch = params.search ?? params.q ?? params.title ?? "";
  const search = rawSearch.trim() ? sanitizeIlikePattern(rawSearch) : undefined;
  const rawRegion = params.region ?? params.state ?? "";
  const state = rawRegion.trim() ? sanitizeIlikePattern(rawRegion) : undefined;

  return {
    search: search || undefined,
    city: params.city?.trim() || undefined,
    state: state || undefined,
    property_type: normalizePropertyType(rawType),
    status: normalizePropertyStatus(rawStatus),
    min_price: parseNumber(params.min_price),
    max_price: parseNumber(params.max_price),
    min_bedrooms: parseNumber(params.min_bedrooms ?? params.bedrooms),
    min_bathrooms: parseNumber(params.min_bathrooms ?? params.bathrooms),
    min_area: parseNumber(params.min_area ?? params.area),
    sort: (params.sort as PropertyFilters["sort"]) || "newest",
  };
}

export function searchParamsToFormValues(
  params: Record<string, string | undefined>
): PropertySearchFormValues {
  const filters = parsePropertySearchParams(params);

  return {
    search: filters.search ?? "",
    city: filters.city ?? "",
    region: filters.state ?? "",
    property_type: filters.property_type ?? "",
    status: filters.status ?? "",
    min_bedrooms: filters.min_bedrooms ? String(filters.min_bedrooms) : "",
    min_bathrooms: filters.min_bathrooms ? String(filters.min_bathrooms) : "",
    min_area: filters.min_area ? String(filters.min_area) : "",
    min_price: filters.min_price ? String(filters.min_price) : "",
    max_price: filters.max_price ? String(filters.max_price) : "",
    sort: filters.sort ?? "newest",
    page: params.page ?? "",
    view: params.view ?? "",
    layout: params.layout ?? "",
  };
}

export function buildPropertySearchParams(values: PropertySearchFormValues): URLSearchParams {
  const params = new URLSearchParams();

  if (values.search.trim()) params.set("search", values.search.trim());
  if (values.city.trim()) params.set("city", values.city.trim());
  if (values.region.trim()) params.set("region", values.region.trim());
  if (values.property_type.trim()) params.set("property_type", values.property_type.trim());
  if (values.status.trim()) params.set("status", values.status.trim());
  if (values.min_bedrooms.trim()) params.set("min_bedrooms", values.min_bedrooms.trim());
  if (values.min_bathrooms.trim()) params.set("min_bathrooms", values.min_bathrooms.trim());
  if (values.min_area.trim()) params.set("min_area", values.min_area.trim());
  if (values.min_price.trim()) params.set("min_price", values.min_price.trim());
  if (values.max_price.trim()) params.set("max_price", values.max_price.trim());
  if (values.sort && values.sort !== "newest") params.set("sort", values.sort);
  if (values.page?.trim()) params.set("page", values.page.trim());
  if (values.view?.trim()) params.set("view", values.view.trim());
  if (values.layout?.trim()) params.set("layout", values.layout.trim());

  return params;
}

export function hasActivePropertyFilters(params: Record<string, string | undefined>): boolean {
  const filters = parsePropertySearchParams(params);
  return Boolean(
    filters.search ||
      filters.city ||
      filters.state ||
      filters.property_type ||
      filters.status ||
      filters.min_price !== undefined ||
      filters.max_price !== undefined ||
      filters.min_bedrooms !== undefined ||
      filters.min_bathrooms !== undefined ||
      filters.min_area !== undefined ||
      (filters.sort && filters.sort !== "newest")
  );
}

export function getPropertySearchCacheKey(params: Record<string, string | undefined>): string {
  return buildPropertySearchParams(searchParamsToFormValues(params)).toString();
}

export const PROPERTIES_PAGE_SIZE = 12;

export function parseBrowsePage(value?: string | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

export function buildLoadMoreParams(
  params: Record<string, string | undefined>,
  nextPage: number
): string {
  const values = searchParamsToFormValues(params);
  values.page = String(nextPage);
  return buildPropertySearchParams(values).toString();
}

export function buildSortParams(
  params: Record<string, string | undefined>,
  sort: string
): string {
  const values = searchParamsToFormValues(params);
  values.sort = sort;
  values.page = "";
  return buildPropertySearchParams(values).toString();
}

export function buildViewParams(
  params: Record<string, string | undefined>,
  view: "grid" | "list"
): string {
  const values = searchParamsToFormValues(params);
  values.view = view;
  return buildPropertySearchParams(values).toString();
}

export type BrowseLayoutMode = "browse" | "map";

export function getBrowseLayout(params: Record<string, string | undefined>): BrowseLayoutMode {
  return params.layout === "map" ? "map" : "browse";
}

export function buildLayoutParams(
  params: Record<string, string | undefined>,
  layout: BrowseLayoutMode
): string {
  const values = searchParamsToFormValues(params);
  values.layout = layout === "map" ? "map" : "";
  if (layout === "map") values.page = "";
  return buildPropertySearchParams(values).toString();
}
