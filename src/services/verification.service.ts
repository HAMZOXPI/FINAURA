import type { Profile, VerificationRequestStatus } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

export async function getLatestVerificationRequest(sellerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getLatestVerificationRequest:", error.message);
    return null;
  }

  return data;
}

export async function getPendingVerificationRequest(sellerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    console.error("getPendingVerificationRequest:", error.message);
    return null;
  }

  return data;
}

export type SellerVerificationStatus =
  | "not_verified"
  | "pending"
  | "verified"
  | "rejected";

export function resolveSellerVerificationStatus(
  profile: Pick<Profile, "is_verified" | "verified_seller">,
  latestRequest: { status: VerificationRequestStatus } | null
): SellerVerificationStatus {
  if (profile.is_verified || profile.verified_seller) return "verified";
  if (latestRequest?.status === "pending") return "pending";
  if (latestRequest?.status === "rejected") return "rejected";
  return "not_verified";
}
