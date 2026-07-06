import type { Property, PropertyFilters } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { sanitizeIlikePattern } from "@/lib/property-search";

export async function getCities(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("city")
    .eq("listing_status", "published");

  if (error) return [];
  const cities = [...new Set((data ?? []).map((r) => (r as { city: string }).city))];
  return cities.sort();
}

export async function getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select("*, owner:profiles(*)")
    .eq("listing_status", "published");

  if (filters.property_type) query = query.eq("property_type", filters.property_type);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.min_price) query = query.gte("price", filters.min_price);
  if (filters.max_price) query = query.lte("price", filters.max_price);
  if (filters.min_bedrooms) query = query.gte("bedrooms", filters.min_bedrooms);
  if (filters.min_bathrooms) query = query.gte("bathrooms", filters.min_bathrooms);
  if (filters.min_area) query = query.gte("area_sqft", filters.min_area);
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.state) {
    const region = sanitizeIlikePattern(filters.state);
    if (region) query = query.ilike("state", `%${region}%`);
  }
  if (filters.search) {
    const term = sanitizeIlikePattern(filters.search);
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,city.ilike.%${term}%,state.ilike.%${term}%,address.ilike.%${term}%`
      );
    }
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "area_desc":
      query = query.order("area_sqft", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("getProperties:", error.message);
    return [];
  }
  return (data as Property[]) ?? [];
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, owner:profiles(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Property;
}

export async function getFeaturedProperties(limit = 3): Promise<Property[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, owner:profiles(*)")
    .eq("listing_status", "published")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as Property[]) ?? [];
}

export async function getUserProperties(userId: string): Promise<Property[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as Property[]) ?? [];
}

export async function getUserFavorites(userId: string): Promise<Property[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("property:properties(*, owner:profiles(*))")
    .eq("user_id", userId);

  if (error) return [];
  return (
    data?.map((f) => (f as unknown as { property: Property }).property).filter(Boolean) ?? []
  );
}

export async function isFavorite(userId: string, propertyId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("property_id", propertyId)
    .maybeSingle();

  return Boolean(data);
}
