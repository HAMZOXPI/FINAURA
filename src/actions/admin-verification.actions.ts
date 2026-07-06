"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAdminVerificationRequestById, getVerificationDocumentUrls } from "@/services/admin-verification.service";
import {
  notifyVerificationApproved,
  notifyVerificationRejected,
} from "@/lib/notifications/dispatch";

export async function fetchVerificationDocumentUrls(requestId: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const request = await getAdminVerificationRequestById(requestId);
  if (!request) return { error: "Request not found" };

  const urls = await getVerificationDocumentUrls(request);
  return { success: true, urls, request };
}

export async function approveVerificationRequest(requestId: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const supabase = await createClient();
  const reviewedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("verification_requests")
    .update({
      status: "approved",
      reviewed_at: reviewedAt,
      reviewed_by: session.user.id,
      rejection_reason: null,
    })
    .eq("id", requestId)
    .select("seller_id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Request not found" };

  if (data.seller_id) {
    await notifyVerificationApproved(data.seller_id);
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
  revalidatePath("/dashboard/settings");
  if (data.seller_id) {
    revalidatePath(`/seller/${data.seller_id}`);
  }

  return { success: true };
}

export async function rejectVerificationRequest(requestId: string, reason: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const trimmedReason = reason.trim();
  if (trimmedReason.length < 5) {
    return { error: "Rejection reason must be at least 5 characters" };
  }

  const supabase = await createClient();
  const reviewedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("verification_requests")
    .update({
      status: "rejected",
      rejection_reason: trimmedReason,
      reviewed_at: reviewedAt,
      reviewed_by: session.user.id,
    })
    .eq("id", requestId)
    .select("seller_id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Request not found" };

  if (data.seller_id) {
    const profileClient = hasAdminClient() ? createAdminClient() : supabase;
    const { error: profileError } = await profileClient
      .from("profiles")
      .update({ is_verified: false })
      .eq("id", data.seller_id);

    if (profileError) return { error: profileError.message };
  }

  if (data.seller_id) {
    await notifyVerificationRejected(data.seller_id, trimmedReason);
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
  revalidatePath("/dashboard/settings");
  if (data.seller_id) {
    revalidatePath(`/seller/${data.seller_id}`);
  }

  return { success: true };
}
