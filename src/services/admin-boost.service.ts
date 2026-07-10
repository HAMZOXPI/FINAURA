import { createClient } from "@/lib/supabase/server";
import { getBoostSettings, type BoostSettings } from "@/services/boost-settings.service";
import type {
  BoostCampaignStatus,
  BoostHistory,
  BoostHistoryAction,
  BoostProduct,
  Property,
} from "@/types/database";

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

function startOfTodayIso(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export interface AdminBoostStats {
  totalRevenue: number;
  todayRevenue: number;
  activeBoosts: number;
  expiredBoosts: number;
  boostProducts: number;
  activeProducts: number;
}

export interface AdminFeaturedListingRow {
  id: string;
  listingId: string;
  listingTitle: string;
  ownerEmail: string;
  productName: string;
  position: number;
  amount: number;
  status: BoostCampaignStatus;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface AdminBoostHistoryRow {
  id: string;
  campaignId: string;
  listingTitle: string;
  ownerEmail: string;
  action: BoostHistoryAction;
  amount: number;
  previousPosition: number | null;
  newPosition: number | null;
  createdAt: string;
}

export interface AdminBoostProductRow {
  id: string;
  name: string;
  slug: string;
  type: BoostProduct["type"];
  defaultPrice: number;
  defaultDuration: number;
  isActive: boolean;
}

export interface AdminBoostPageData {
  stats: AdminBoostStats;
  featuredListings: AdminFeaturedListingRow[];
  history: AdminBoostHistoryRow[];
  products: AdminBoostProductRow[];
  settings: BoostSettings;
}

export async function getAdminBoostStats(): Promise<AdminBoostStats> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const todayStart = startOfTodayIso();

  const { data: campaigns } = await supabase
    .from("boost_campaigns")
    .select("amount, status, expires_at, created_at, starts_at");

  const { data: products } = await supabase.from("boost_products").select("id, is_active");

  const rows = campaigns ?? [];
  const revenueStatuses: BoostCampaignStatus[] = ["active", "expired", "removed", "cancelled"];

  const totalRevenue = rows
    .filter((row) => revenueStatuses.includes(row.status as BoostCampaignStatus))
    .reduce((sum, row) => sum + toNumber(row.amount), 0);

  const todayRevenue = rows
    .filter((row) => {
      const createdAt = row.created_at as string;
      const startsAt = row.starts_at as string | null;
      const reference = startsAt ?? createdAt;
      return reference >= todayStart && revenueStatuses.includes(row.status as BoostCampaignStatus);
    })
    .reduce((sum, row) => sum + toNumber(row.amount), 0);

  const activeBoosts = rows.filter(
    (row) =>
      row.status === "active" &&
      row.expires_at &&
      (row.expires_at as string) > now
  ).length;

  const expiredBoosts = rows.filter((row) => row.status === "expired").length;
  const productRows = products ?? [];

  return {
    totalRevenue,
    todayRevenue,
    activeBoosts,
    expiredBoosts,
    boostProducts: productRows.length,
    activeProducts: productRows.filter((row) => row.is_active).length,
  };
}

export async function getAdminFeaturedListings(): Promise<AdminFeaturedListingRow[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("boost_campaigns")
    .select("*, product:boost_products(name), property:properties(title)")
    .eq("status", "active")
    .gt("expires_at", now)
    .order("position", { ascending: true });

  if (error || !data) {
    console.error("getAdminFeaturedListings:", error?.message);
    return [];
  }

  const userIds = [...new Set(data.map((row) => row.user_id as string))];
  const emailByUserId = new Map<string, string>();

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    for (const profile of profiles ?? []) {
      emailByUserId.set(profile.id, profile.email);
    }
  }

  return data.map((row) => {
    const property = row.property as Property | Property[] | null;
    const title = Array.isArray(property) ? property[0]?.title : property?.title;

    return {
      id: row.id,
      listingId: row.listing_id,
      listingTitle: title ?? "—",
      ownerEmail: emailByUserId.get(row.user_id as string) ?? "—",
      productName: (row.product as { name: string } | null)?.name ?? "—",
      position: toNumber(row.position),
      amount: toNumber(row.amount),
      status: row.status as BoostCampaignStatus,
      startsAt: row.starts_at,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    };
  });
}

export async function getAdminBoostHistory(limit = 100): Promise<AdminBoostHistoryRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("boost_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("getAdminBoostHistory:", error?.message);
    return [];
  }

  const historyRows = data as BoostHistory[];
  const campaignIds = [...new Set(historyRows.map((row) => row.campaign_id))];

  const titleByCampaign = new Map<string, string>();
  const emailByCampaign = new Map<string, string>();

  if (campaignIds.length > 0) {
    const { data: campaigns } = await supabase
      .from("boost_campaigns")
      .select("id, user_id, property:properties(title)")
      .in("id", campaignIds);

    const userIds = [...new Set((campaigns ?? []).map((row) => row.user_id as string))];
    const emailByUserId = new Map<string, string>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      for (const profile of profiles ?? []) {
        emailByUserId.set(profile.id, profile.email);
      }
    }

    for (const campaign of campaigns ?? []) {
      const property = campaign.property as { title: string } | { title: string }[] | null;
      const title = Array.isArray(property) ? property[0]?.title : property?.title;
      titleByCampaign.set(campaign.id, title ?? "—");
      emailByCampaign.set(
        campaign.id,
        emailByUserId.get(campaign.user_id as string) ?? "—"
      );
    }
  }

  return historyRows.map((row) => ({
    id: row.id,
    campaignId: row.campaign_id,
    listingTitle: titleByCampaign.get(row.campaign_id) ?? "—",
    ownerEmail: emailByCampaign.get(row.campaign_id) ?? "—",
    action: row.action,
    amount: toNumber(row.amount),
    previousPosition: row.previous_position,
    newPosition: row.new_position,
    createdAt: row.created_at,
  }));
}

export async function getAdminBoostProducts(): Promise<AdminBoostProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boost_products")
    .select("*")
    .order("default_price", { ascending: false });

  if (error || !data) return [];

  return (data as BoostProduct[]).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    type: product.type,
    defaultPrice: toNumber(product.default_price),
    defaultDuration: toNumber(product.default_duration),
    isActive: product.is_active,
  }));
}

export async function getAdminBoostPageData(): Promise<AdminBoostPageData> {
  const [stats, featuredListings, history, products, settings] = await Promise.all([
    getAdminBoostStats(),
    getAdminFeaturedListings(),
    getAdminBoostHistory(),
    getAdminBoostProducts(),
    getBoostSettings(),
  ]);

  return { stats, featuredListings, history, products, settings };
}
