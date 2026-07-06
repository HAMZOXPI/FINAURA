"use server";

import { resolveUserId } from "@/lib/supabase/auth";
import { getEffectiveUserPlan } from "@/services/subscription.service";

export async function fetchDashboardPlanState() {
  const userId = await resolveUserId();
  if (!userId) return null;
  return getEffectiveUserPlan(userId);
}
