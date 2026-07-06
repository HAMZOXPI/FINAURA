import type { ContactInquiry } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { getUnreadConversationCount as getConversationUnreadCount } from "@/services/conversation.service";

export async function getUserMessages(userId: string): Promise<ContactInquiry[]> {
  const supabase = await createClient();

  const { data: ownedProperties, error: propError } = await supabase
    .from("properties")
    .select("id")
    .eq("owner_id", userId);

  if (propError) return [];

  const propertyIds = (ownedProperties ?? []).map((p) => (p as { id: string }).id);
  if (propertyIds.length === 0) return [];

  const { data, error } = await supabase
    .from("contact_inquiries")
    .select("*, property:properties(id, title, city, images)")
    .in("property_id", propertyIds)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as ContactInquiry[]) ?? [];
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  return getConversationUnreadCount(userId);
}
