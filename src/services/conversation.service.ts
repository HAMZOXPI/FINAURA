import type {
  ChatMessage,
  Conversation,
  ConversationWithMeta,
  Profile,
} from "@/types/database";
import { createClient } from "@/lib/supabase/server";

function isMissingTableError(message: string): boolean {
  return (
    message.includes("does not exist") ||
    message.includes("Could not find the table") ||
    message.includes("schema cache")
  );
}

function getOtherParticipant(
  conversation: Conversation,
  userId: string
): Pick<Profile, "id" | "full_name" | "avatar_url"> {
  if (conversation.buyer_id === userId) {
    return (
      conversation.seller ?? {
        id: conversation.seller_id,
        full_name: null,
        avatar_url: null,
      }
    );
  }

  return (
    conversation.buyer ?? {
      id: conversation.buyer_id,
      full_name: null,
      avatar_url: null,
    }
  );
}

async function countUnreadMessages(
  conversationId: string,
  userId: string,
  lastReadAt: string | null
): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId);

  if (lastReadAt) {
    query = query.gt("created_at", lastReadAt);
  }

  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

export async function getUserConversations(
  userId: string
): Promise<ConversationWithMeta[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      property:properties(id, title, price, status, images, city),
      buyer:profiles!conversations_buyer_id_fkey(id, full_name, avatar_url),
      seller:profiles!conversations_seller_id_fkey(id, full_name, avatar_url)
    `
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) {
    if (!isMissingTableError(error.message)) {
      console.error("getUserConversations:", error.message);
    }
    return [];
  }

  const conversations = (data as Conversation[]) ?? [];
  if (conversations.length === 0) return [];

  const conversationIds = conversations.map((item) => item.id);
  const { data: reads } = await supabase
    .from("conversation_reads")
    .select("conversation_id, user_id, last_read_at")
    .in("conversation_id", conversationIds);

  const readMap = new Map<string, string>();
  const otherReadMap = new Map<string, string>();

  for (const row of reads ?? []) {
    const read = row as {
      conversation_id: string;
      user_id: string;
      last_read_at: string;
    };
    if (read.user_id === userId) {
      readMap.set(read.conversation_id, read.last_read_at);
    } else {
      otherReadMap.set(read.conversation_id, read.last_read_at);
    }
  }

  const enriched = await Promise.all(
    conversations.map(async (conversation) => {
      const myLastRead = readMap.get(conversation.id) ?? null;
      const unreadCount = await countUnreadMessages(
        conversation.id,
        userId,
        myLastRead
      );

      return {
        ...conversation,
        unread_count: unreadCount,
        other_participant: getOtherParticipant(conversation, userId),
        other_last_read_at: otherReadMap.get(conversation.id) ?? null,
      } satisfies ConversationWithMeta;
    })
  );

  return enriched;
}

export async function getConversationMessages(
  conversationId: string,
  userId: string
): Promise<ChatMessage[]> {
  const supabase = await createClient();

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (
    conversationError ||
    !conversation ||
    (conversation.buyer_id !== userId && conversation.seller_id !== userId)
  ) {
    return [];
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    if (!isMissingTableError(error.message)) {
      console.error("getConversationMessages:", error.message);
    }
    return [];
  }

  return (data as ChatMessage[]) ?? [];
}

export async function getUnreadConversationCount(userId: string): Promise<number> {
  const conversations = await getUserConversations(userId);
  return conversations.reduce((total, item) => total + item.unread_count, 0);
}

export async function getConversationById(
  conversationId: string,
  userId: string
): Promise<ConversationWithMeta | null> {
  const conversations = await getUserConversations(userId);
  return conversations.find((item) => item.id === conversationId) ?? null;
}
