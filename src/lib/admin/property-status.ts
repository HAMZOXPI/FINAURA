import type { Property } from "@/types/database";

export const ADMIN_REJECTED_FEATURE = "admin_rejected";
export const ADMIN_REJECTION_PREFIX = "admin_rejection:";

export type AdminPropertyDisplayStatus =
  | "active"
  | "pending"
  | "rejected"
  | "hidden"
  | "sold";

export function getAdminPropertyDisplayStatus(
  property: Pick<Property, "listing_status" | "status" | "features">
): AdminPropertyDisplayStatus {
  if (property.status === "sold") return "sold";
  if (property.listing_status === "draft") return "pending";
  if (property.listing_status === "archived") {
    if (property.features?.includes(ADMIN_REJECTED_FEATURE)) return "rejected";
    return "hidden";
  }
  return "active";
}

export function getAdminRejectionReason(features: string[] | null | undefined): string | null {
  const entry = (features ?? []).find((feature) => feature.startsWith(ADMIN_REJECTION_PREFIX));
  if (!entry) return null;
  return entry.slice(ADMIN_REJECTION_PREFIX.length) || null;
}

export function withRejectionFeatures(features: string[], reason: string): string[] {
  const cleaned = withoutAdminMarkers(features);
  const trimmed = reason.trim();
  return [...cleaned, ADMIN_REJECTED_FEATURE, `${ADMIN_REJECTION_PREFIX}${trimmed}`];
}

export function withoutAdminMarkers(features: string[] | null | undefined): string[] {
  return (features ?? []).filter(
    (feature) => feature !== ADMIN_REJECTED_FEATURE && !feature.startsWith(ADMIN_REJECTION_PREFIX)
  );
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}
