import type { DashboardStats } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { getUserProperties, getUserFavorites } from "@/services/property.service";
import { getUserMessages } from "@/services/message.service";

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_dashboard_stats", {
    p_user_id: userId,
  });

  if (!error && data) {
    const stats = data as DashboardStats;
    return {
      listings_count: stats.listings_count ?? 0,
      published_count: stats.published_count ?? 0,
      favorites_count: stats.favorites_count ?? 0,
      messages_count: stats.messages_count ?? 0,
    };
  }

  const [properties, favorites, messages] = await Promise.all([
    getUserProperties(userId),
    getUserFavorites(userId),
    getUserMessages(userId),
  ]);

  return {
    listings_count: properties.length,
    published_count: properties.filter((p) => p.listing_status === "published").length,
    favorites_count: favorites.length,
    messages_count: messages.length,
  };
}
