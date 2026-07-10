"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Archive, Search } from "lucide-react";
import type { ConversationWithMeta } from "@/types/database";
import { ConversationListItem } from "@/components/messaging/conversation-list-item";
import { MessagingEmptyState } from "@/components/messaging/messaging-empty-state";
import { useConversationListRealtime } from "@/hooks/use-messaging-realtime";
import { useMessagingPresence } from "@/hooks/use-online-presence";
import { filterConversations, getSafeWatchIds, resolveOtherParticipant } from "@/lib/messaging/messaging-display";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
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
  const [conversations, setConversations] = useState(initialConversations ?? []);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});

  const watchIds = getSafeWatchIds(conversations ?? []);
  const { isOnline } = useMessagingPresence(userId, watchIds);

  useEffect(() => {
    setConversations(initialConversations ?? []);
  }, [initialConversations]);

  useEffect(() => {
    const sellerIds = [
      ...new Set((conversations ?? []).map((item) => item?.seller_id).filter(Boolean)),
    ] as string[];
    if (sellerIds.length === 0) return;

    const supabase = createClient();
    void supabase
      .from("profiles")
      .select("id, verified_seller")
      .in("id", sellerIds)
      .then(({ data }) => {
        const next: Record<string, boolean> = {};
        for (const row of data ?? []) {
          next[row.id] = Boolean(row.verified_seller);
        }
        setVerifiedMap(next);
      });
  }, [conversations]);

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

    const rows = (data as ConversationWithMeta[]) ?? [];
    const conversationIds = rows.map((item) => item.id).filter(Boolean);
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

        const other = resolveOtherParticipant(conversation, userId);

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

  const filteredConversations = useMemo(
    () => filterConversations(conversations ?? [], searchQuery, unreadOnly),
    [conversations, searchQuery, unreadOnly]
  );

  const totalUnread = (conversations ?? []).reduce(
    (sum, item) => sum + (item?.unread_count ?? 0),
    0
  );

  if ((conversations ?? []).length === 0) {
    return (
      <div className={className}>
        <MessagingEmptyState />
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="mb-4 px-1">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-surface-900">{t.messaging.conversations}</h2>
            <p className="text-xs text-surface-500">
              {t.messaging.allConversations} · {(conversations ?? []).length}
              {totalUnread > 0 && (
                <span className="ms-2 font-semibold text-brand-700">
                  ({totalUnread} {t.messaging.unreadLabel})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="relative mt-3">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t.messaging.searchConversations}
            className="h-11 w-full rounded-2xl border border-surface-200/80 bg-white/90 ps-10 pe-4 text-sm text-surface-900 shadow-sm outline-none transition-all placeholder:text-surface-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/15"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setUnreadOnly((value) => !value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
              unreadOnly
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-surface-200 bg-white text-surface-600 hover:border-brand-200 hover:text-brand-700"
            )}
          >
            {t.messaging.unreadFilter}
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-surface-200 px-3 py-1.5 text-xs font-semibold text-surface-400"
          >
            <Archive className="h-3.5 w-3.5" />
            {t.messaging.archivedComingSoon}
          </button>
        </div>
      </div>

      {filteredConversations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-[20px] border border-dashed border-surface-200 bg-white/70 px-4 py-10 text-center">
          <p className="text-sm text-surface-500">{t.messaging.noSearchResults}</p>
        </div>
      ) : (
        <motion.div layout className="min-h-0 flex-1 space-y-2 overflow-y-auto pe-1">
          {(filteredConversations ?? []).map((conversation) => {
            if (!conversation?.id) return null;
            const otherId = resolveOtherParticipant(conversation, userId).id;
            return (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              isOnline={otherId ? isOnline(otherId) : false}
              isVerified={verifiedMap[conversation.seller_id ?? ""] ?? false}
              onSelect={() => onSelect(conversation.id)}
            />
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
