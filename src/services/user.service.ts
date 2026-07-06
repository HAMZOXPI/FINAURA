import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "full_name" | "phone" | "avatar_url">>
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(updates).eq("id", userId);

  if (error) return { error: error.message };
  return {};
}
