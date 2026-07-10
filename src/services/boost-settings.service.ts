import { BOOST_BID_INCREMENT } from "@/lib/boost/constants";
import { createClient } from "@/lib/supabase/server";

export interface BoostSettings {
  bidIncrement: number;
  featuredPositions: number;
  updatedAt: string | null;
}

const DEFAULT_SETTINGS: BoostSettings = {
  bidIncrement: BOOST_BID_INCREMENT,
  featuredPositions: 5,
  updatedAt: null,
};

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value);
}

export async function getBoostSettings(): Promise<BoostSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boost_settings")
    .select("bid_increment, featured_positions, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_SETTINGS;
  }

  return {
    bidIncrement: toNumber(data.bid_increment) || DEFAULT_SETTINGS.bidIncrement,
    featuredPositions: toNumber(data.featured_positions) || DEFAULT_SETTINGS.featuredPositions,
    updatedAt: data.updated_at,
  };
}
