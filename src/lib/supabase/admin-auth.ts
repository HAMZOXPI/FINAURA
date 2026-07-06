import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { getSessionUser } from "@/lib/supabase/auth";
import { getProfile } from "@/services/user.service";

export async function requireAdmin(): Promise<{ user: User; profile: Profile }> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const profile = await getProfile(user.id);

  if (!profile || profile.role !== "admin") {
    redirect("/admin/access-denied");
  }

  return { user, profile };
}

/** For server actions — returns an error instead of redirecting. */
export async function getAdminSession(): Promise<
  { user: User; profile: Profile } | { error: string }
> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const profile = await getProfile(user.id);
  if (!profile || profile.role !== "admin") return { error: "Forbidden" };

  return { user, profile };
}
