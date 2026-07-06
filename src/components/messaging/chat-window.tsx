"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { ChatMessage, ConversationWithMeta } from "@/types/database";
import { ChatInput } from "@/components/messaging/chat-input";
import { ChatMessageBubble } from "@/components/messaging/chat-message-bubble";
import { PropertyPreviewBar } from "@/components/messaging/property-preview-bar";
import { useConversationMessages } from "@/hooks/use-messaging-realtime";
import { markConversationRead } from "@/actions/message.actions";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { useUnreadMessages } from "@/components/messaging/unread-messages-provider";

interface ChatWindowProps {
  conversation: ConversationWithMeta;
  initialMessages: ChatMessage[];
  currentUserId: string;
  onBack?: () => void;
  showBackButton?: boolean;
  onReadStateChange?: (otherLastReadAt: string) => void;
}

export function ChatWindow({
  conversation,
  initialMessages,
  currentUserId,
  onBack,
  showBackButton,
  onReadStateChange,
}: ChatWindowProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { decrementUnread } = useUnreadMessages();
  const other = conversation.other_participant;
  const [otherLastReadAt, setOtherLastReadAt] = useState(conversation.other_last_read_at);

  const { messages, typingUserId, broadcastTyping } = useConversationMessages(
    conversation.id,
    initialMessages,
    currentUserId,
    { soundEnabled: true, isActive: true }
  );

  useEffect(() => {
    setOtherLastReadAt(conversation.other_last_read_at);
  }, [conversation.other_last_read_at, conversation.id]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages.length, typingUserId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`reads:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_reads",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as {
            user_id?: string;
            last_read_at?: string;
          };
          if (!row.user_id || row.user_id === currentUserId || !row.last_read_at) return;
          setOtherLastReadAt(row.last_read_at);
          onReadStateChange?.(row.last_read_at);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversation.id, currentUserId, onReadStateChange]);

  useEffect(() => {
    void markConversationRead(conversation.id).then(() => {
      if (conversation.unread_count > 0) {
        decrementUnread(conversation.unread_count);
      }
    });
  }, [conversation.id, conversation.unread_count, decrementUnread]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-[24px] border border-surface-200/80 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center gap-3 border-b border-surface-200 px-4 py-3 sm:px-5">
        {showBackButton && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl p-2 text-surface-500 transition-colors hover:bg-surface-100 lg:hidden"
            aria-label={t.messaging.backToList}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-surface-900">
            {other.full_name ?? t.properties.defaultAgent}
          </p>
          <p className="text-xs text-surface-500">
            {typingUserId ? t.messaging.typing : t.messaging.conversationActive}
          </p>
        </div>
      </div>

      <PropertyPreviewBar conversation={conversation} />

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
        {messages.map((message, index) => {
          const isOwn = message.sender_id === currentUserId;
          const previous = messages[index - 1];
          const showAvatar = !previous || previous.sender_id !== message.sender_id;
          const isSeen =
            isOwn &&
            Boolean(
              otherLastReadAt && new Date(otherLastReadAt) >= new Date(message.created_at)
            );

          return (
            <ChatMessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              isSeen={isSeen}
              showAvatar={showAvatar}
              avatarUrl={other.avatar_url}
              avatarFallback={getInitials(other.full_name ?? t.properties.defaultAgent)}
            />
          );
        })}

        {typingUserId && (
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <span className="inline-flex gap-1 rounded-full bg-surface-100 px-3 py-2">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-surface-400 [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-surface-400 [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-surface-400" />
            </span>
            {t.messaging.typing}
          </div>
        )}
      </div>

      <ChatInput
        conversationId={conversation.id}
        onTyping={broadcastTyping}
      />
    </motion.div>
  );
}
