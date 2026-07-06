"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { getRequestIpAddress } from "@/lib/admin/request-meta";
import {
  GIFT_TYPE_CONFIG,
  generateCouponCode,
  isPremiumGiftType,
  resolveEffectiveGiftStatus,
} from "@/lib/gifts/constants";
import {
  activatePremiumExtension,
  activatePremiumGift,
  restorePremiumGift,
  syncPremiumGiftExpiration,
} from "@/services/gift.service";
import { processExpiredGiftNotifications } from "@/lib/notifications/jobs/maintenance";
import { getAdminGiftById } from "@/services/admin-promotion.service";
import { createClient } from "@/lib/supabase/server";
import { notifyGiftGranted } from "@/lib/notifications/dispatch";
import type { AdminGiftAuditAction, AdminGiftPaymentSource, AdminGiftType } from "@/types/database";

export interface GrantGiftPayload {
  userId: string;
  giftType: AdminGiftType;
  quantity?: number | null;
  durationDays?: number | null;
  expiresAt?: string | null;
  notes?: string | null;
  paymentSource?: AdminGiftPaymentSource;
  premiumPlanSlug?: string;
  customTitle?: string | null;
  customDescription?: string | null;
}

function revalidatePromotionPaths() {
  revalidatePath("/admin/promotions");
  revalidatePath("/admin/promotions/history");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/pricing");
}

function computeExpiresAt(payload: GrantGiftPayload): string | null {
  if (payload.expiresAt) {
    const date = new Date(payload.expiresAt);
    if (!Number.isNaN(date.getTime())) {
      date.setHours(23, 59, 59, 999);
      return date.toISOString();
    }
  }

  if (payload.durationDays && payload.durationDays > 0) {
    const date = new Date();
    date.setDate(date.getDate() + payload.durationDays);
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  }

  return null;
}

async function writeAuditLog(params: {
  giftId?: string | null;
  action: AdminGiftAuditAction;
  adminId: string;
  userId: string;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const ip = await getRequestIpAddress();

  await supabase.from("admin_gift_audit_log").insert({
    gift_id: params.giftId ?? null,
    action: params.action,
    admin_id: params.adminId,
    user_id: params.userId,
    reason: params.reason?.trim() || null,
    ip_address: ip,
    metadata: params.metadata ?? {},
  });
}

export async function grantAdminGift(payload: GrantGiftPayload) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const config = GIFT_TYPE_CONFIG[payload.giftType];
  const quantity = config.needsQuantity ? Math.max(1, Number(payload.quantity) || 1) : null;
  const durationDays =
    config.needsDuration || config.optionalDuration
      ? payload.durationDays
        ? Math.max(1, Number(payload.durationDays))
        : null
      : null;
  const expiresAt = computeExpiresAt(payload);

  if (config.needsDuration && !expiresAt && !config.optionalDuration) {
    return { error: "Expiration date or duration is required" };
  }

  const supabase = await createClient();

  const { data: recipient } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", payload.userId)
    .maybeSingle();

  if (!recipient) return { error: "User not found" };

  let metadata: Record<string, unknown> = {};
  let quantityRemaining = quantity;

  try {
    if (payload.giftType === "premium_subscription") {
      const premiumMeta = await activatePremiumGift(
        payload.userId,
        expiresAt,
        payload.premiumPlanSlug ?? "pro"
      );
      metadata = {
        previous_plan_id: premiumMeta.previousPlanId,
        previous_period_end: premiumMeta.previousPeriodEnd,
        premium_plan_slug: premiumMeta.premiumPlanSlug,
      };
    }

    if (payload.giftType === "premium_extension") {
      const extensionMeta = await activatePremiumExtension(
        payload.userId,
        expiresAt,
        durationDays
      );
      metadata = {
        previous_plan_id: extensionMeta.previousPlanId,
        previous_period_end: extensionMeta.previousPeriodEnd,
        extension: true,
      };
    }

    if (payload.giftType === "discount_coupon") {
      metadata = {
        coupon_code: generateCouponCode(),
        discount_percent: quantity ?? 10,
      };
      quantityRemaining = 1;
    }

    if (payload.giftType === "custom_gift") {
      metadata = {
        custom_title: payload.customTitle?.trim() || "Custom gift",
        custom_description: payload.customDescription?.trim() || null,
      };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to activate gift" };
  }

  const paymentSource = payload.paymentSource ?? "gift";
  metadata = { ...metadata, payment_source: paymentSource };

  const { data: gift, error } = await supabase
    .from("admin_gifts")
    .insert({
      user_id: payload.userId,
      gift_type: payload.giftType,
      quantity,
      quantity_remaining: quantityRemaining,
      duration_days: durationDays,
      expires_at: expiresAt,
      status: "active",
      granted_by: session.user.id,
      notes: payload.notes?.trim() || null,
      metadata,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await writeAuditLog({
    giftId: gift.id,
    action: "grant",
    adminId: session.user.id,
    userId: payload.userId,
    reason: payload.notes,
    metadata: {
      gift_type: payload.giftType,
      quantity,
      duration_days: durationDays,
      expires_at: expiresAt,
      payment_source: paymentSource,
    },
  });

  await notifyGiftGranted(
    payload.userId,
    payload.giftType.replace(/_/g, " "),
    gift.id
  );

  if (payload.giftType === "premium_subscription" || payload.giftType === "premium_extension") {
    const { notifyPremiumActivated } = await import("@/lib/notifications/dispatch");
    await notifyPremiumActivated(payload.userId, payload.premiumPlanSlug ?? "Premium");
  }

  revalidatePromotionPaths();
  return { success: true, giftId: gift.id, couponCode: metadata.coupon_code as string | undefined };
}

export async function revokeAdminGift(giftId: string, reason?: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const gift = await getAdminGiftById(giftId);
  if (!gift) return { error: "Gift not found" };
  if (gift.status === "revoked") return { error: "Gift is already revoked" };

  try {
    if (isPremiumGiftType(gift.gift_type)) {
      await restorePremiumGift(gift.user_id, gift.metadata, gift.gift_type);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to revoke premium gift" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_gifts")
    .update({ status: "revoked" })
    .eq("id", giftId);

  if (error) return { error: error.message };

  await writeAuditLog({
    giftId,
    action: "revoke",
    adminId: session.user.id,
    userId: gift.user_id,
    reason: reason ?? gift.notes,
    metadata: { gift_type: gift.gift_type },
  });

  revalidatePromotionPaths();
  return { success: true };
}

export async function extendAdminGiftExpiration(giftId: string, expiresAt: string, reason?: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const gift = await getAdminGiftById(giftId);
  if (!gift) return { error: "Gift not found" };
  if (gift.status === "revoked") return { error: "Cannot extend a revoked gift" };

  const nextExpiration = new Date(expiresAt);
  if (Number.isNaN(nextExpiration.getTime())) {
    return { error: "Invalid expiration date" };
  }
  nextExpiration.setHours(23, 59, 59, 999);
  const iso = nextExpiration.toISOString();

  if (isPremiumGiftType(gift.gift_type)) {
    try {
      await syncPremiumGiftExpiration(gift.user_id, iso);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to extend subscription" };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_gifts")
    .update({
      expires_at: iso,
      status: resolveEffectiveGiftStatus("active", iso) === "expired" ? "expired" : "active",
    })
    .eq("id", giftId);

  if (error) return { error: error.message };

  await writeAuditLog({
    giftId,
    action: "extend",
    adminId: session.user.id,
    userId: gift.user_id,
    reason,
    metadata: { new_expires_at: iso, previous_expires_at: gift.expires_at },
  });

  revalidatePromotionPaths();
  return { success: true };
}

export async function updateAdminGiftNotes(giftId: string, notes: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const gift = await getAdminGiftById(giftId);
  if (!gift) return { error: "Gift not found" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_gifts")
    .update({ notes: notes.trim() || null })
    .eq("id", giftId);

  if (error) return { error: error.message };

  await writeAuditLog({
    giftId,
    action: "edit",
    adminId: session.user.id,
    userId: gift.user_id,
    reason: notes,
    metadata: { previous_notes: gift.notes },
  });

  revalidatePromotionPaths();
  return { success: true };
}

export async function refreshExpiredAdminGifts() {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  await processExpiredGiftNotifications();
  revalidatePromotionPaths();
  return { success: true };
}

export async function searchUsersForGift(query: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error, users: [] as never[] };

  const { searchAdminGiftUsers } = await import("@/services/admin-promotion.service");
  const users = await searchAdminGiftUsers(query);
  return { success: true, users };
}

export async function fetchUserPromotionStatus(userId: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const { getUserPromotionStatus } = await import("@/services/admin-promotion.service");
  const status = await getUserPromotionStatus(userId);
  if (!status) return { error: "User not found" };
  return { success: true, status };
}

export async function fetchGiftAuditLog(giftId: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const { getGiftAuditLog } = await import("@/services/admin-promotion.service");
  const logs = await getGiftAuditLog(giftId);
  return { success: true, logs };
}
