import type { Profile, Property } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import {
  ADMIN_REJECTED_FEATURE,
  type AdminPropertyDisplayStatus,
  getAdminPropertyDisplayStatus,
  isUuid,
} from "@/lib/admin/property-status";
import { sanitizeIlikePattern } from "@/lib/property-search";

const PAGE_SIZE_DEFAULT = 12;

export type AdminPropertySort = "newest" | "oldest" | "price_asc" | "price_desc" | "views";

export type AdminPropertyFilterStatus = AdminPropertyDisplayStatus | "all";

export type AdminPropertyOwner = Pick<
  Profile,
  "id" | "full_name" | "email" | "avatar_url" | "phone"
>;

export interface AdminPropertyRow extends Omit<Property, "owner"> {
  owner: AdminPropertyOwner | null;
  favorite_count: number;
  admin_status: AdminPropertyDisplayStatus;
}

export interface AdminPropertyFilters {
  search?: string;
  status?: AdminPropertyFilterStatus;
  sort?: AdminPropertySort;
  page?: number;
  pageSize?: number;
}

export interface AdminPropertyListResult {
  rows: AdminPropertyRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminPropertyStats {
  active: number;
  pending: number;
  rejected: number;
  hidden: number;
  sold: number;
}

async function resolveOwnerIdsForSearch(search: string): Promise<string[] | null> {
  const supabase = await createClient();
  const term = sanitizeIlikePattern(search.trim());
  if (!term) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);

  return (data ?? []).map((row) => row.id);
}

async function attachFavoriteCounts(rows: Property[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (rows.length === 0) return counts;

  const supabase = await createClient();
  const ids = rows.map((row) => row.id);
  const { data } = await supabase.from("favorites").select("property_id").in("property_id", ids);

  for (const row of data ?? []) {
    const propertyId = (row as { property_id: string }).property_id;
    counts.set(propertyId, (counts.get(propertyId) ?? 0) + 1);
  }

  return counts;
}

function sortRows(rows: AdminPropertyRow[], sort: AdminPropertySort): AdminPropertyRow[] {
  const copy = [...rows];
  switch (sort) {
    case "oldest":
      return copy.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case "price_asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price_desc":
      return copy.sort((a, b) => b.price - a.price);
    case "views":
      return copy.sort((a, b) => b.favorite_count - a.favorite_count);
    default:
      return copy.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
}

export async function getAdminPropertyStats(): Promise<AdminPropertyStats> {
  const supabase = await createClient();

  const [active, pending, rejected, hidden, sold] = await Promise.all([
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("listing_status", "published")
      .neq("status", "sold"),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("listing_status", "draft"),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("listing_status", "archived")
      .contains("features", [ADMIN_REJECTED_FEATURE]),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("listing_status", "archived")
      .not("features", "cs", `{${ADMIN_REJECTED_FEATURE}}`),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "sold"),
  ]);

  return {
    active: active.count ?? 0,
    pending: pending.count ?? 0,
    rejected: rejected.count ?? 0,
    hidden: hidden.count ?? 0,
    sold: sold.count ?? 0,
  };
}

export async function getAdminProperties(
  filters: AdminPropertyFilters = {}
): Promise<AdminPropertyListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? PAGE_SIZE_DEFAULT;
  const sort = filters.sort ?? "newest";
  const useViewSort = sort === "views";

  let query = supabase
    .from("properties")
    .select("*, owner:profiles!properties_owner_id_fkey(id, full_name, email, avatar_url, phone)", {
      count: "exact",
    });

  if (filters.status && filters.status !== "all") {
    switch (filters.status) {
      case "active":
        query = query.eq("listing_status", "published").neq("status", "sold");
        break;
      case "pending":
        query = query.eq("listing_status", "draft");
        break;
      case "rejected":
        query = query.eq("listing_status", "archived").contains("features", [ADMIN_REJECTED_FEATURE]);
        break;
      case "hidden":
        query = query.eq("listing_status", "archived").not("features", "cs", `{${ADMIN_REJECTED_FEATURE}}`);
        break;
      case "sold":
        query = query.eq("status", "sold");
        break;
    }
  }

  if (filters.search?.trim()) {
    const term = filters.search.trim();
    const ownerIds = await resolveOwnerIdsForSearch(term);
    const ilikeTerm = sanitizeIlikePattern(term);

    if (isUuid(term)) {
      query = query.eq("id", term);
    } else if (ownerIds && ownerIds.length > 0 && ilikeTerm) {
      query = query.or(
        `title.ilike.%${ilikeTerm}%,city.ilike.%${ilikeTerm}%,owner_id.in.(${ownerIds.join(",")})`
      );
    } else if (ilikeTerm) {
      query = query.or(`title.ilike.%${ilikeTerm}%,city.ilike.%${ilikeTerm}%`);
    } else if (ownerIds && ownerIds.length > 0) {
      query = query.in("owner_id", ownerIds);
    } else {
      return { rows: [], total: 0, page, pageSize, totalPages: 0 };
    }
  }

  if (!useViewSort) {
    switch (sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }
  }

  if (useViewSort) {
    const { data, error } = await query.limit(5000);
    if (error) {
      console.error("getAdminProperties:", error.message);
      return { rows: [], total: 0, page, pageSize, totalPages: 0 };
    }

    const properties = (data as Property[]) ?? [];
    const favoriteCounts = await attachFavoriteCounts(properties);
    const enriched: AdminPropertyRow[] = properties.map((property) => ({
      ...property,
      owner: (property as Property & { owner?: AdminPropertyOwner | null }).owner ?? null,
      favorite_count: favoriteCounts.get(property.id) ?? 0,
      admin_status: getAdminPropertyDisplayStatus(property),
    }));

    const sorted = sortRows(enriched, sort);
    const total = sorted.length;
    const from = (page - 1) * pageSize;
    const rows = sorted.slice(from, from + pageSize);

    return {
      rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 0,
    };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("getAdminProperties:", error.message);
    return { rows: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const properties = (data as (Property & { owner?: AdminPropertyOwner | null })[]) ?? [];
  const favoriteCounts = await attachFavoriteCounts(properties);
  const rows: AdminPropertyRow[] = properties.map((property) => ({
    ...property,
    owner: property.owner ?? null,
    favorite_count: favoriteCounts.get(property.id) ?? 0,
    admin_status: getAdminPropertyDisplayStatus(property),
  }));

  const total = count ?? 0;

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 0,
  };
}

export async function getAdminPropertyById(propertyId: string): Promise<AdminPropertyRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, owner:profiles!properties_owner_id_fkey(id, full_name, email, avatar_url, phone)")
    .eq("id", propertyId)
    .maybeSingle();

  if (error || !data) return null;

  const property = data as Property & { owner?: AdminPropertyOwner | null };
  const favoriteCounts = await attachFavoriteCounts([property]);

  return {
    ...property,
    owner: property.owner ?? null,
    favorite_count: favoriteCounts.get(property.id) ?? 0,
    admin_status: getAdminPropertyDisplayStatus(property),
  };
}
