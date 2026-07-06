import type {
  Profile,
  VerificationRequest,
  VerificationRequestStatus,
} from "@/types/database";
import { createClient } from "@/lib/supabase/server";

const VERIFICATION_BUCKET = "verification-documents";
const PAGE_SIZE_DEFAULT = 10;

export type AdminVerificationSeller = Pick<
  Profile,
  "id" | "full_name" | "email" | "avatar_url" | "phone" | "is_verified"
>;

export interface AdminVerificationRequestRow extends VerificationRequest {
  seller: AdminVerificationSeller | null;
}

export interface AdminVerificationFilters {
  search?: string;
  status?: VerificationRequestStatus | "all";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminVerificationListResult {
  rows: AdminVerificationRequestRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminVerificationStats {
  pending: number;
  approved: number;
  rejected: number;
  today: number;
}

export interface VerificationDocumentUrls {
  idFront: string | null;
  idBack: string | null;
  selfie: string | null;
  proofOfAddress: string | null;
}

async function resolveSellerIdsForSearch(search: string): Promise<string[] | null> {
  const supabase = await createClient();
  const term = search.trim();
  if (!term) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);

  return (data ?? []).map((row) => row.id);
}

export async function getAdminVerificationStats(): Promise<AdminVerificationStats> {
  const supabase = await createClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [pending, approved, rejected, today] = await Promise.all([
    supabase
      .from("verification_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("verification_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("verification_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "rejected"),
    supabase
      .from("verification_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfToday.toISOString()),
  ]);

  return {
    pending: pending.count ?? 0,
    approved: approved.count ?? 0,
    rejected: rejected.count ?? 0,
    today: today.count ?? 0,
  };
}

export async function getAdminVerificationRequests(
  filters: AdminVerificationFilters = {}
): Promise<AdminVerificationListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? PAGE_SIZE_DEFAULT;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("verification_requests")
    .select(
      "*, seller:profiles!verification_requests_seller_id_fkey(id, full_name, email, avatar_url, phone, is_verified)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }

  if (filters.dateTo) {
    const end = new Date(filters.dateTo);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  if (filters.search?.trim()) {
    const sellerIds = await resolveSellerIdsForSearch(filters.search);
    if (!sellerIds || sellerIds.length === 0) {
      return { rows: [], total: 0, page, pageSize, totalPages: 0 };
    }
    query = query.in("seller_id", sellerIds);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("getAdminVerificationRequests:", error.message);
    return { rows: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const total = count ?? 0;

  return {
    rows: (data as AdminVerificationRequestRow[]) ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 0,
  };
}

async function createSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(VERIFICATION_BUCKET)
    .createSignedUrl(path, 3600);

  if (error) {
    console.error("createSignedUrl:", error.message);
    return null;
  }

  return data.signedUrl;
}

export async function getVerificationDocumentUrls(
  request: Pick<VerificationRequest, "id_front" | "id_back" | "selfie" | "proof_of_address">
): Promise<VerificationDocumentUrls> {
  const [idFront, idBack, selfie, proofOfAddress] = await Promise.all([
    createSignedUrl(request.id_front),
    createSignedUrl(request.id_back),
    createSignedUrl(request.selfie),
    createSignedUrl(request.proof_of_address),
  ]);

  return { idFront, idBack, selfie, proofOfAddress };
}

export async function getAdminVerificationRequestById(
  requestId: string
): Promise<AdminVerificationRequestRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("verification_requests")
    .select(
      "*, seller:profiles!verification_requests_seller_id_fkey(id, full_name, email, avatar_url, phone, is_verified)"
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error || !data) return null;
  return data as AdminVerificationRequestRow;
}
