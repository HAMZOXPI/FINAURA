"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ConversationWithMeta } from "@/types/database";
import { ConversationListItem } from "@/components/messaging/conversation-list-item";
import { MessagingEmptyState } from "@/components/messaging/messaging-empty-state";
import { useConversationListRealtime } from "@/hooks/use-messaging-realtime";
import { useMessagingPresence } from "@/hooks/use-online-presence";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/i18n/locale-provider";

interface ConversationListProps {
  userId: string;
  initialConversations: ConversationWithMeta[];
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  onConversationsChange?: (conversations: ConversationWithMeta[]) => void;
  className?: string;
}

export function ConversationList({
  userId,
  initialConversations,
  activeConversationId,
  onSelect,
  onConversationsChange,
  className,
}: ConversationListProps) {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState(initialConversations);
  const watchIds = conversations.map((item) => item.other_participant.id);
  const { isOnline } = useMessagingPresence(userId, watchIds);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  const refreshConversations = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
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

    if (!data) return;

    const rows = data as ConversationWithMeta[];
    const conversationIds = rows.map((item) => item.id);
    const { data: reads } = await supabase
      .from("conversation_reads")
      .select("conversation_id, user_id, last_read_at")
      .in("conversation_id", conversationIds);

    const myReads = new Map<string, string>();
    const otherReads = new Map<string, string>();
    for (const read of reads ?? []) {
      if (read.user_id === userId) myReads.set(read.conversation_id, read.last_read_at);
      else otherReads.set(read.conversation_id, read.last_read_at);
    }

    const enriched = await Promise.all(
      rows.map(async (conversation) => {
        const lastReadAt = myReads.get(conversation.id) ?? null;
        let query = supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conversation.id)
          .neq("sender_id", userId);
        if (lastReadAt) query = query.gt("created_at", lastReadAt);
        const { count } = await query;

        const other =
          conversation.buyer_id === userId
            ? conversation.seller!
            : conversation.buyer!;

        return {
          ...conversation,
          unread_count: count ?? 0,
          other_participant: other,
          other_last_read_at: otherReads.get(conversation.id) ?? null,
        } satisfies ConversationWithMeta;
      })
    );

    setConversations(enriched);
    onConversationsChange?.(enriched);
  }, [userId, onConversationsChange]);

  useConversationListRealtime(userId, refreshConversations);

  if (conversations.length === 0) {
    return (
      <div className={className}>
        <MessagingEmptyState />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 px-1">
        <h2 className="text-lg font-bold text-surface-900">{t.messaging.conversations}</h2>
        <p className="text-sm text-surface-500">{t.messaging.conversationsSubtitle}</p>
      </div>

      <motion.div layout className="space-y-2">
        {conversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === activeConversationId}
            isOnline={isOnline(conversation.other_participant.id)}
            onSelect={() => onSelect(conversation.id)}
          />
        ))}
      </motion.div>
    </div>
  );
}
