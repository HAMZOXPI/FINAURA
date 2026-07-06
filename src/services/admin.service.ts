import { createClient } from "@/lib/supabase/server";

export interface AdminDashboardStats {
  totalUsers: number;
  totalProperties: number;
  activeListings: number;
  pendingVerification: number;
  totalMessages: number;
  premiumUsers: number;
}

export interface AdminActivityItem {
  id: string;
  type: "user" | "property" | "verification" | "message";
  title: string;
  subtitle: string;
  createdAt: string;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient();

  const premiumPlanIds = await supabase
    .from("subscription_plans")
    .select("id")
    .neq("slug", "free");

  const premiumIds = (premiumPlanIds.data ?? []).map((plan) => plan.id);

  const premiumResult =
    premiumIds.length > 0
      ? await supabase
          .from("user_subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("status", "active")
          .in("plan_id", premiumIds)
      : { count: 0 };

  const [
    usersResult,
    propertiesResult,
    activeResult,
    verificationResult,
    messagesResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("listing_status", "published"),
    supabase
      .from("verification_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("messages").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: usersResult.count ?? 0,
    totalProperties: propertiesResult.count ?? 0,
    activeListings: activeResult.count ?? 0,
    pendingVerification: verificationResult.count ?? 0,
    totalMessages: messagesResult.count ?? 0,
    premiumUsers: typeof premiumResult.count === "number" ? premiumResult.count : 0,
  };
}

export async function getAdminRecentActivity(limit = 10): Promise<AdminActivityItem[]> {
  const supabase = await createClient();

  const [users, properties, verifications, messages] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("properties")
      .select("id, title, city, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("verification_requests")
      .select("id, status, created_at, seller:profiles!verification_requests_seller_id_fkey(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("messages")
      .select("id, content, created_at, sender:profiles!messages_sender_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const items: AdminActivityItem[] = [];

  for (const row of users.data ?? []) {
    items.push({
      id: `user-${row.id}`,
      type: "user",
      title: row.full_name || row.email || "New user",
      subtitle: "New account registered",
      createdAt: row.created_at,
    });
  }

  for (const row of properties.data ?? []) {
    items.push({
      id: `property-${row.id}`,
      type: "property",
      title: row.title,
      subtitle: row.city ? `Listing in ${row.city}` : "New property listing",
      createdAt: row.created_at,
    });
  }

  for (const row of verifications.data ?? []) {
    const seller = row.seller as { full_name?: string | null; email?: string } | null;
    items.push({
      id: `verification-${row.id}`,
      type: "verification",
      title: seller?.full_name || seller?.email || "Seller verification",
      subtitle: `Verification request · ${row.status}`,
      createdAt: row.created_at,
    });
  }

  for (const row of messages.data ?? []) {
    const sender = row.sender as { full_name?: string | null } | null;
    items.push({
      id: `message-${row.id}`,
      type: "message",
      title: sender?.full_name || "New message",
      subtitle: row.content?.slice(0, 80) || "Message sent",
      createdAt: row.created_at,
    });
  }

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
