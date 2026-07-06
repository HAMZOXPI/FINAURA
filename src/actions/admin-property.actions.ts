"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import {
  withoutAdminMarkers,
  withRejectionFeatures,
} from "@/lib/admin/property-status";
import { getAdminPropertyById } from "@/services/admin-property.service";
import { createClient } from "@/lib/supabase/server";
import {
  notifyPropertyApproved,
  notifyPropertyHidden,
  notifyPropertyRejected,
} from "@/lib/notifications/dispatch";
import type { ListingStatus, PropertyStatus, PropertyType } from "@/types/database";

function parseAdminPropertyForm(formData: FormData) {
  const featuresRaw = formData.get("features") as string;
  const imagesRaw = formData.get("images") as string;
  const lat = formData.get("latitude") as string;
  const lng = formData.get("longitude") as string;

  return {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    property_type: formData.get("property_type") as PropertyType,
    status: formData.get("status") as PropertyStatus,
    listing_status: (formData.get("listing_status") as ListingStatus) || "draft",
    bedrooms: Number(formData.get("bedrooms") || 0),
    bathrooms: Number(formData.get("bathrooms") || 0),
    area_sqft: Number(formData.get("area_sqft")),
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    zip_code: formData.get("zip_code") as string,
    country: (formData.get("country") as string) || "Maroc",
    latitude: lat ? Number(lat) : null,
    longitude: lng ? Number(lng) : null,
    features: featuresRaw
      ? featuresRaw
          .split(",")
          .map((feature) => feature.trim())
          .filter(Boolean)
      : [],
    images: imagesRaw ? (JSON.parse(imagesRaw) as string[]) : [],
    is_featured: formData.get("is_featured") === "true",
  };
}

function revalidatePropertyPaths(propertyId: string) {
  revalidatePath("/admin/properties");
  revalidatePath("/admin");
  revalidatePath("/properties");
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/dashboard");
}

async function getPropertyForAdmin(propertyId: string) {
  const property = await getAdminPropertyById(propertyId);
  if (!property) return { error: "Property not found" as const };
  return { property };
}

export async function adminUpdateProperty(propertyId: string, formData: FormData) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const existing = await getPropertyForAdmin(propertyId);
  if ("error" in existing) return { error: existing.error };

  const parsed = parseAdminPropertyForm(formData);
  const adminMarkers = existing.property.features.filter(
    (feature) =>
      feature === "admin_rejected" || feature.startsWith("admin_rejection:")
  );
  const userFeatures = parsed.features.filter(
    (feature) => feature !== "admin_rejected" && !feature.startsWith("admin_rejection:")
  );

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      ...parsed,
      features: [...withoutAdminMarkers(userFeatures), ...adminMarkers],
    })
    .eq("id", propertyId);

  if (error) return { error: error.message };

  revalidatePropertyPaths(propertyId);
  redirect("/admin/properties");
}

export async function adminApproveProperty(propertyId: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const existing = await getPropertyForAdmin(propertyId);
  if ("error" in existing) return { error: existing.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      listing_status: "published",
      features: withoutAdminMarkers(existing.property.features),
    })
    .eq("id", propertyId);

  if (error) return { error: error.message };

  await notifyPropertyApproved(
    existing.property.owner_id,
    existing.property.title,
    propertyId
  );

  revalidatePropertyPaths(propertyId);
  return { success: true };
}

export async function adminRejectProperty(propertyId: string, reason: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const trimmedReason = reason.trim();
  if (trimmedReason.length < 5) {
    return { error: "Rejection reason must be at least 5 characters" };
  }

  const existing = await getPropertyForAdmin(propertyId);
  if ("error" in existing) return { error: existing.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      listing_status: "archived",
      features: withRejectionFeatures(existing.property.features, trimmedReason),
    })
    .eq("id", propertyId);

  if (error) return { error: error.message };

  await notifyPropertyRejected(
    existing.property.owner_id,
    existing.property.title,
    trimmedReason,
    propertyId
  );

  revalidatePropertyPaths(propertyId);
  return { success: true };
}

export async function adminHideProperty(propertyId: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const existing = await getPropertyForAdmin(propertyId);
  if ("error" in existing) return { error: existing.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      listing_status: "archived",
      features: withoutAdminMarkers(existing.property.features),
    })
    .eq("id", propertyId);

  if (error) return { error: error.message };

  await notifyPropertyHidden(existing.property.owner_id, existing.property.title, propertyId);

  revalidatePropertyPaths(propertyId);
  return { success: true };
}

export async function adminUnhideProperty(propertyId: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const existing = await getPropertyForAdmin(propertyId);
  if ("error" in existing) return { error: existing.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      listing_status: "published",
      features: withoutAdminMarkers(existing.property.features),
    })
    .eq("id", propertyId);

  if (error) return { error: error.message };

  revalidatePropertyPaths(propertyId);
  return { success: true };
}

export async function adminToggleFeaturedProperty(propertyId: string, featured: boolean) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const existing = await getPropertyForAdmin(propertyId);
  if ("error" in existing) return { error: existing.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({ is_featured: featured })
    .eq("id", propertyId);

  if (error) return { error: error.message };

  revalidatePropertyPaths(propertyId);
  return { success: true };
}

export async function adminDeleteProperty(propertyId: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const existing = await getPropertyForAdmin(propertyId);
  if ("error" in existing) return { error: existing.error };

  const supabase = await createClient();
  const { error } = await supabase.from("properties").delete().eq("id", propertyId);

  if (error) return { error: error.message };

  revalidatePropertyPaths(propertyId);
  return { success: true };
}

export async function adminBulkApproveProperties(propertyIds: string[]) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };
  if (propertyIds.length === 0) return { error: "No properties selected" };

  const supabase = await createClient();

  for (const propertyId of propertyIds) {
    const existing = await getAdminPropertyById(propertyId);
    if (!existing) continue;

    const { error } = await supabase
      .from("properties")
      .update({
        listing_status: "published",
        features: withoutAdminMarkers(existing.features),
      })
      .eq("id", propertyId);

    if (error) return { error: error.message };
    revalidatePropertyPaths(propertyId);
  }

  revalidatePath("/admin/properties");
  return { success: true, count: propertyIds.length };
}

export async function adminBulkHideProperties(propertyIds: string[]) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };
  if (propertyIds.length === 0) return { error: "No properties selected" };

  const supabase = await createClient();

  for (const propertyId of propertyIds) {
    const existing = await getAdminPropertyById(propertyId);
    if (!existing) continue;

    const { error } = await supabase
      .from("properties")
      .update({
        listing_status: "archived",
        features: withoutAdminMarkers(existing.features),
      })
      .eq("id", propertyId);

    if (error) return { error: error.message };
    revalidatePropertyPaths(propertyId);
  }

  revalidatePath("/admin/properties");
  return { success: true, count: propertyIds.length };
}

export async function adminBulkDeleteProperties(propertyIds: string[]) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };
  if (propertyIds.length === 0) return { error: "No properties selected" };

  const supabase = await createClient();
  const { error } = await supabase.from("properties").delete().in("id", propertyIds);

  if (error) return { error: error.message };

  for (const propertyId of propertyIds) {
    revalidatePropertyPaths(propertyId);
  }

  revalidatePath("/admin/properties");
  return { success: true, count: propertyIds.length };
}

export async function adminMarkPropertySold(propertyId: string) {
  const session = await getAdminSession();
  if ("error" in session) return { error: session.error };

  const existing = await getPropertyForAdmin(propertyId);
  if ("error" in existing) return { error: existing.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({ status: "sold" })
    .eq("id", propertyId);

  if (error) return { error: error.message };

  revalidatePropertyPaths(propertyId);
  return { success: true };
}
