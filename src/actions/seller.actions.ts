"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const AVATAR_BUCKET = "profile-avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export async function updateSellerProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const bio = ((formData.get("bio") as string) ?? "").trim();
  const phone = ((formData.get("phone") as string) ?? "").trim();
  const avgResponseRaw = formData.get("avg_response_time_hours");
  const avgResponseTimeHours = avgResponseRaw ? Number(avgResponseRaw) : null;

  if (bio.length > 500) {
    return { error: "Bio is too long (max 500 characters)" };
  }

  if (
    avgResponseTimeHours !== null &&
    (!Number.isFinite(avgResponseTimeHours) || avgResponseTimeHours < 0 || avgResponseTimeHours > 168)
  ) {
    return { error: "Invalid response time" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      bio: bio || null,
      phone: phone || null,
      ...(avgResponseTimeHours !== null ? { avg_response_time_hours: avgResponseTimeHours } : {}),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath(`/seller/${user.id}`);

  return { success: true };
}

export async function uploadSellerAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "No file selected" };
  if (file.size > MAX_AVATAR_BYTES) return { error: "Image must be under 2 MB" };

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Invalid image format" };
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/dashboard/settings");
  revalidatePath(`/seller/${user.id}`);
  revalidatePath("/properties");

  return { success: true, avatarUrl };
}
