"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/types/database";

function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.04;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  } catch {
    // Optional sound — ignore failures
  }
}

export function useConversationMessages(
  conversationId: string | null,
  initialMessages: ChatMessage[],
  currentUserId: string,
  options?: { soundEnabled?: boolean; isActive?: boolean }
) {
  const [messages, setMessages] = useState(initialMessages);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, conversationId]);

  const typingChannelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();
    const messagesChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const row = payload.new as ChatMessage;
          const { data } = await supabase
            .from("messages")
            .select("*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)")
            .eq("id", row.id)
            .single();

          const message = (data as ChatMessage) ?? row;
          setMessages((current) => {
            if (current.some((item) => item.id === message.id)) return current;
            return [...current, message];
          });

          if (
            options?.soundEnabled &&
            message.sender_id !== currentUserId &&
            (!options.isActive || document.hidden)
          ) {
            playNotificationSound();
          }
        }
      )
      .subscribe();

    const typingChannel = supabase
      .channel(`typing:${conversationId}`, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const data = payload as { userId?: string; typing?: boolean };
        if (!data.userId || data.userId === currentUserId) return;

        if (data.typing) {
          setTypingUserId(data.userId);
          if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = window.setTimeout(() => setTypingUserId(null), 2500);
        } else {
          setTypingUserId(null);
        }
      })
      .subscribe();

    typingChannelRef.current = typingChannel;

    return () => {
      typingChannelRef.current = null;
      void messagesChannel.unsubscribe();
      void supabase.removeChannel(messagesChannel);
      void typingChannel.unsubscribe();
      void supabase.removeChannel(typingChannel);
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, currentUserId, options?.isActive, options?.soundEnabled]);

  const broadcastTyping = useCallback(
    (typing: boolean) => {
      void typingChannelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: currentUserId, typing },
      });
    },
    [currentUserId]
  );

  return { messages, setMessages, typingUserId, broadcastTyping };
}

export function useConversationListRealtime(
  userId: string,
  onUpdate: () => void
) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversations:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => onUpdate()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [userId, onUpdate]);
}
