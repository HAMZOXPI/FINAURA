"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface UnreadMessagesContextValue {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  decrementUnread: (amount?: number) => void;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextValue | null>(null);

export function UnreadMessagesProvider({
  userId,
  initialCount,
  children,
}: {
  userId: string | null;
  initialCount: number;
  children: ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(initialCount);

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    const supabase = createClient();
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id, buyer_id, seller_id")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

    if (!conversations?.length) {
      setUnreadCount(0);
      return;
    }

    const conversationIds = conversations.map((item) => item.id);
    const { data: reads } = await supabase
      .from("conversation_reads")
      .select("conversation_id, last_read_at")
      .eq("user_id", userId)
      .in("conversation_id", conversationIds);

    const readMap = new Map(
      (reads ?? []).map((row) => [row.conversation_id, row.last_read_at as string])
    );

    let total = 0;
    for (const conversation of conversations) {
      const lastReadAt = readMap.get(conversation.id) ?? null;
      let query = supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversation.id)
        .neq("sender_id", userId);

      if (lastReadAt) {
        query = query.gt("created_at", lastReadAt);
      }

      const { count } = await query;
      total += count ?? 0;
    }

    setUnreadCount(total);
  }, [userId]);

  useEffect(() => {
    setUnreadCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`unread:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          void refreshUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversation_reads" },
        () => {
          void refreshUnreadCount();
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [userId, refreshUnreadCount]);

  const decrementUnread = useCallback((amount = 1) => {
    setUnreadCount((current) => Math.max(0, current - amount));
  }, []);

  const value = useMemo(
    () => ({ unreadCount, refreshUnreadCount, decrementUnread }),
    [unreadCount, refreshUnreadCount, decrementUnread]
  );

  return (
    <UnreadMessagesContext.Provider value={value}>{children}</UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    return {
      unreadCount: 0,
      refreshUnreadCount: async () => {},
      decrementUnread: () => {},
    };
  }
  return context;
}
