"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import type { ChatMessage, ConversationWithMeta } from "@/types/database";
import { ChatInput } from "@/components/messaging/chat-input";
import { ChatMessageBubble } from "@/components/messaging/chat-message-bubble";
import { ChatConversationHeader } from "@/components/messaging/messaging-info-panel";
import { useConversationMessages } from "@/hooks/use-messaging-realtime";
import { useMessagingPresence } from "@/hooks/use-online-presence";
import { markConversationRead } from "@/actions/message.actions";
import {
  findFirstUnreadIndex,
  groupMessagesByDate,
  resolveOtherParticipant,
} from "@/lib/messaging/messaging-display";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { MessagingSectionErrorBoundary } from "@/components/messaging/messaging-section-error-boundary";
import { useUnreadMessages } from "@/components/messaging/unread-messages-provider";

interface ChatWindowProps {
  conversation: ConversationWithMeta;
  initialMessages: ChatMessage[];
  currentUserId: string;
  onBack?: () => void;
  showBackButton?: boolean;
  onReadStateChange?: (otherLastReadAt: string) => void;
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

export function ChatWindow({
  conversation,
  initialMessages = [],
  currentUserId,
  onBack,
  showBackButton,
  onReadStateChange,
  onMessagesChange,
}: ChatWindowProps) {
  const { t, locale } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { decrementUnread } = useUnreadMessages();
  const other = resolveOtherParticipant(conversation, currentUserId);
  const otherParticipantId = other.id;
  const [otherLastReadAt, setOtherLastReadAt] = useState(conversation.other_last_read_at);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [floatingDate, setFloatingDate] = useState<string | null>(null);
  const [myLastReadAt, setMyLastReadAt] = useState<string | null>(null);

  const { isOnline } = useMessagingPresence(
    currentUserId,
    otherParticipantId ? [otherParticipantId] : []
  );

  const { messages, typingUserId, broadcastTyping } = useConversationMessages(
    conversation?.id ?? null,
    initialMessages ?? [],
    currentUserId,
    { soundEnabled: true, isActive: true }
  );

  const safeMessages = useMemo(
    () => (Array.isArray(messages) ? messages : []),
    [messages]
  );

  const dateLabels = useMemo(
    () => ({ today: t.messaging.today, yesterday: t.messaging.yesterday }),
    [t.messaging.today, t.messaging.yesterday]
  );

  const messageGroups = useMemo(
    () => groupMessagesByDate(safeMessages, locale, dateLabels),
    [safeMessages, locale, dateLabels]
  );

  const firstUnreadIndex = useMemo(
    () => findFirstUnreadIndex(safeMessages, myLastReadAt, currentUserId),
    [safeMessages, myLastReadAt, currentUserId]
  );

  useEffect(() => {
    onMessagesChange?.(safeMessages);
  }, [safeMessages, onMessagesChange]);

  useEffect(() => {
    setOtherLastReadAt(conversation.other_last_read_at);
  }, [conversation.other_last_read_at, conversation.id]);

  useEffect(() => {
    const supabase = createClient();
    void supabase
      .from("conversation_reads")
      .select("last_read_at")
      .eq("conversation_id", conversation.id)
      .eq("user_id", currentUserId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.last_read_at) setMyLastReadAt(data.last_read_at);
      });
  }, [conversation.id, currentUserId]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    scrollToBottom("auto");
  }, [safeMessages.length, typingUserId, scrollToBottom]);

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
          if (!row.user_id || !row.last_read_at) return;
          if (row.user_id === currentUserId) {
            setMyLastReadAt(row.last_read_at);
            return;
          }
          setOtherLastReadAt(row.last_read_at);
          onReadStateChange?.(row.last_read_at);
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [conversation.id, currentUserId, onReadStateChange]);

  useEffect(() => {
    void markConversationRead(conversation.id).then(() => {
      if ((conversation.unread_count ?? 0) > 0) {
        decrementUnread(conversation.unread_count ?? 0);
      }
    });
  }, [conversation.id, conversation.unread_count, decrementUnread]);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distanceFromBottom > 120);

    const separators = container.querySelectorAll<HTMLElement>("[data-date-label]");
    let currentLabel: string | null = null;
    for (const separator of separators) {
      if (separator.offsetTop - container.scrollTop <= 72) {
        currentLabel = separator.dataset.dateLabel ?? null;
      }
    }
    setFloatingDate(currentLabel);
  };

  let globalIndex = 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-surface-50/80 to-white",
        "lg:min-h-[620px] lg:rounded-[24px] lg:border lg:border-white/70 lg:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.12)]"
      )}
    >
      <ChatConversationHeader
        conversation={conversation}
        isOnline={otherParticipantId ? isOnline(otherParticipantId) : false}
        typingUserId={typingUserId}
        onBack={onBack}
        showBackButton={showBackButton}
      />

      <div className="relative min-h-0 flex-1">
        <AnimatePresence>
          {floatingDate && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="pointer-events-none absolute start-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-semibold text-surface-600 shadow-sm backdrop-blur-md"
            >
              {floatingDate}
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 space-y-3 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5"
        >
          {(messageGroups ?? []).map((group) => (
            <div key={group.key} className="space-y-3">
              <div data-date-label={group.label} className="flex justify-center py-1">
                <span className="rounded-full border border-surface-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold text-surface-500 shadow-sm backdrop-blur-sm">
                  {group.label}
                </span>
              </div>

              {(group.messages ?? []).map((message) => {
                const currentIndex = globalIndex;
                globalIndex += 1;

                if (!message?.id) return null;

                const isOwn = message.sender_id === currentUserId;
                const previous = safeMessages[currentIndex - 1];
                const showAvatar = !previous || previous.sender_id !== message.sender_id;
                const isSeen =
                  isOwn &&
                  Boolean(
                    otherLastReadAt &&
                      message.created_at &&
                      new Date(otherLastReadAt) >= new Date(message.created_at)
                  );
                const showUnreadDivider =
                  currentIndex === firstUnreadIndex && (conversation.unread_count ?? 0) > 0;

                return (
                  <div key={message.id}>
                    {showUnreadDivider && (
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-brand-200" />
                        <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-700">
                          {t.messaging.unreadMessages}
                        </span>
                        <div className="h-px flex-1 bg-brand-200" />
                      </div>
                    )}
                    <ChatMessageBubble
                      message={message}
                      isOwn={isOwn}
                      isSeen={isSeen}
                      showAvatar={showAvatar}
                      avatarUrl={other.avatar_url}
                      avatarFallback={getInitials(other.full_name ?? t.properties.defaultAgent)}
                      index={currentIndex}
                    />
                  </div>
                );
              })}
            </div>
          ))}

          {typingUserId && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-xs text-surface-500"
            >
              <span className="inline-flex gap-1 rounded-full border border-surface-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400" />
              </span>
              {t.messaging.typing}
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              onClick={() => scrollToBottom()}
              className="absolute bottom-4 end-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/95 text-brand-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)] backdrop-blur-md transition-transform hover:-translate-y-0.5"
              aria-label={t.messaging.scrollToLatest}
            >
              <ArrowDown className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <MessagingSectionErrorBoundary name="ChatInput">
        <ChatInput
          conversationId={conversation.id}
          onTyping={broadcastTyping}
        />
      </MessagingSectionErrorBoundary>
    </motion.div>
  );
}
