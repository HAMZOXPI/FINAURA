"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canCreateListing, canAddFavorite } from "@/services/subscription.service";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import type { ListingStatus, Property } from "@/types/database";
import {
  buildPropertyUpdatePayload,
  hasPropertyChanges,
  parsePropertyForm,
  validatePropertyForm,
} from "@/lib/properties/form";

async function getServerDict() {
  const locale = await getLocale();
  return getDictionary(locale);
}

function revalidateAllPropertyLists() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath("/properties");
}

function revalidatePropertyPaths(propertyId: string) {
  revalidateAllPropertyLists();
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath(`/dashboard/${propertyId}/edit`);
}

export async function uploadPropertyImages(
  formData: FormData
): Promise<{ urls?: string[]; error?: string }> {
  const files = formData.getAll("files") as File[];
  if (files.length === 0) return { urls: [] };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const dict = await getServerDict();
    return { error: dict.errors.unauthorized };
  }

  const urls: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("property-images")
      .upload(path, file, { upsert: false });

    if (error) return { error: error.message };

    const {
      data: { publicUrl },
    } = supabase.storage.from("property-images").getPublicUrl(path);

    urls.push(publicUrl);
  }

  return { urls };
}

export async function createProperty(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const dict = await getServerDict();
    return { error: dict.errors.unauthorized };
  }

  const limit = await canCreateListing(user.id);
  if (!limit.allowed) return { error: limit.message };

  const dict = await getServerDict();
  const data = parsePropertyForm(formData);
  const validationError = validatePropertyForm(data, dict);
  if (validationError) return { error: validationError };

  const { error } = await supabase.from("properties").insert({
    ...data,
    owner_id: user.id,
    is_featured: false,
  });

  if (error) return { error: error.message };

  revalidateAllPropertyLists();
  redirect("/dashboard/properties");
}

export async function updateProperty(propertyId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const dict = await getServerDict();
    return { error: dict.errors.unauthorized };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (fetchError || !existing) {
    const dict = await getServerDict();
    return { error: dict.errors.unauthorized };
  }

  const dict = await getServerDict();
  const parsed = parsePropertyForm(formData);
  const validationError = validatePropertyForm(parsed, dict);
  if (validationError) return { error: validationError };

  const property = existing as Property;

  if (!hasPropertyChanges(property, parsed)) {
    return { noChanges: true as const };
  }

  const payload = buildPropertyUpdatePayload(property, parsed);

  const { error } = await supabase
    .from("properties")
    .update(payload)
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePropertyPaths(propertyId);
  return { success: true as const, propertyId };
}

export async function deleteProperty(propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const dict = await getServerDict();
    return { error: dict.errors.unauthorized };
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePropertyPaths(propertyId);
  return { success: true };
}

export async function updateListingStatus(
  propertyId: string,
  listingStatus: ListingStatus
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const dict = await getServerDict();
    return { error: dict.errors.unauthorized };
  }

  const { error } = await supabase
    .from("properties")
    .update({ listing_status: listingStatus })
    .eq("id", propertyId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  return { success: true };
}

export async function toggleFavorite(propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const dict = await getServerDict();
    return { error: dict.errors.loginForFavorites };
  }

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  const existingId = (existing as { id: string } | null)?.id;

  if (existingId) {
    await supabase.from("favorites").delete().eq("id", existingId);
  } else {
    const limit = await canAddFavorite(user.id);
    if (!limit.allowed) return { error: limit.message };

    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      property_id: propertyId,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/properties");
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/favorites");

  return { success: true };
}

export async function submitContactInquiry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const propertyId = formData.get("property_id") as string;
  const senderName = formData.get("sender_name") as string;
  const senderEmail = formData.get("sender_email") as string;
  const senderPhone = (formData.get("sender_phone") as string) || null;
  const message = formData.get("message") as string;

  const { error } = await supabase.from("contact_inquiries").insert({
    property_id: propertyId,
    sender_id: user?.id ?? null,
    sender_name: senderName,
    sender_email: senderEmail,
    sender_phone: senderPhone,
    message,
  });

  if (error) return { error: error.message };
  return { success: true };
}
