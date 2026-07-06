"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { updateProfile } from "@/services/user.service";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${getSiteUrl()}/dashboard`,
    },
  });

  if (error) return { error: error.message };

  if (data.session) {
    redirect("/dashboard");
  }

  if (data.user && hasAdminClient()) {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(data.user.id, { email_confirm: true });

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError) {
      redirect("/dashboard");
    }
  }

  redirect("/login?message=check-email");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  const redirectTo = (formData.get("redirect") as string) || "/dashboard";
  redirect(redirectTo);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const result = await updateProfile(user.id, {
    full_name: formData.get("full_name") as string,
    phone: (formData.get("phone") as string) || null,
  });

  if (result.error) return { error: result.error };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { success: true };
}
