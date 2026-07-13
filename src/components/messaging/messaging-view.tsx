"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import type { ChatMessage, ConversationWithMeta } from "@/types/database";
import { ChatWindow } from "@/components/messaging/chat-window";
import { ChatMessageSkeleton } from "@/components/messaging/chat-message-skeleton";
import { ConversationList } from "@/components/messaging/conversation-list";
import { MessagingEmptyState } from "@/components/messaging/messaging-empty-state";
import { MessagingInfoPanel } from "@/components/messaging/messaging-info-panel";
import { MessagingSectionErrorBoundary } from "@/components/messaging/messaging-section-error-boundary";
import { MobileChatFullscreenPortal } from "@/components/messaging/mobile-chat-fullscreen-portal";
import { useMessagingPresence } from "@/hooks/use-online-presence";
import { useMediaQuery } from "@/hooks/use-media-query";
import { resolveOtherParticipant } from "@/lib/messaging/messaging-display";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface MessagingViewProps {
  userId: string;
  initialConversations: ConversationWithMeta[];
  initialConversationId?: string | null;
}

export function MessagingView({
  userId,
  initialConversations,
  initialConversationId = null,
}: MessagingViewProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [conversations, setConversations] = useState(initialConversations ?? []);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId ?? (initialConversations ?? [])[0]?.id ?? null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    initialConversationId ? "chat" : "list"
  );

  useEffect(() => {
    setConversations(initialConversations ?? []);
  }, [initialConversations]);

  useEffect(() => {
    if (!isMobile || mobileView !== "chat") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileView, isMobile]);

  const activeConversation = useMemo(
    () => (conversations ?? []).find((item) => item?.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const watchIds = activeConversation
    ? [resolveOtherParticipant(activeConversation, userId).id].filter(Boolean)
    : [];
  const { isOnline } = useMessagingPresence(userId, watchIds);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages((data as ChatMessage[]) ?? []);
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    void loadMessages(activeConversationId);
  }, [activeConversationId, loadMessages]);

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setMobileView("chat");
  };

  const hasConversations = (conversations ?? []).length > 0;
  const isMobileChatOpen = mobileView === "chat";
  const showMobileChatOverlay = isMobile && isMobileChatOpen;

  const chatPanelContent =
    activeConversation && !loadingMessages ? (
      <MessagingSectionErrorBoundary name="ChatWindow">
        <ChatWindow
          conversation={activeConversation}
          initialMessages={messages ?? []}
          currentUserId={userId}
          showBackButton
          onBack={() => setMobileView("list")}
          onReadStateChange={(lastReadAt) => {
            setConversations((current) =>
              (current ?? []).map((item) =>
                item?.id === activeConversation.id
                  ? { ...item, other_last_read_at: lastReadAt, unread_count: 0 }
                  : item
              )
            );
          }}
          onMessagesChange={(next) => setMessages(Array.isArray(next) ? next : [])}
        />
      </MessagingSectionErrorBoundary>
    ) : activeConversation && loadingMessages ? (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white lg:min-h-[620px] lg:rounded-[24px] lg:border lg:border-white/70 lg:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.12)]">
        <div className="border-b border-surface-200 px-5 py-4">
          <div className="h-5 w-40 animate-pulse rounded-lg bg-surface-200" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-surface-100" />
        </div>
        <ChatMessageSkeleton />
      </div>
    ) : (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden h-full min-h-[620px] flex-col items-center justify-center rounded-[24px] border border-dashed border-surface-300/80 bg-white/85 px-6 text-center shadow-sm backdrop-blur-xl md:flex"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 shadow-sm">
          <MessageSquare className="h-8 w-8 text-brand-600" />
        </div>
        <h3 className="text-lg font-bold text-surface-900">{t.messaging.selectConversation}</h3>
        <p className="mt-2 max-w-sm text-sm text-surface-500">
          {t.messaging.selectConversationHint}
        </p>
      </motion.div>
    );

  return (
    <div className="grid min-h-0 gap-4 md:min-h-[680px] md:grid-cols-[300px_minmax(0,1fr)] md:gap-5 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
      <div
        className={cn(
          "min-h-[480px] overflow-hidden rounded-[24px] border border-white/70 bg-white/80 p-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:min-h-[620px] sm:p-4",
          isMobileChatOpen ? "hidden md:flex md:flex-col" : "flex flex-col"
        )}
      >
        {hasConversations ? (
          <MessagingSectionErrorBoundary name="ConversationList">
            <ConversationList
              userId={userId}
              initialConversations={conversations ?? []}
              activeConversationId={activeConversationId}
              onSelect={handleSelectConversation}
              onConversationsChange={(next) => setConversations(next ?? [])}
              className="h-full"
            />
          </MessagingSectionErrorBoundary>
        ) : (
          <MessagingEmptyState />
        )}
      </div>

      {showMobileChatOverlay ? (
        <MobileChatFullscreenPortal open>{chatPanelContent}</MobileChatFullscreenPortal>
      ) : (
        <div className="hidden min-h-0 md:block md:min-h-[620px]">{chatPanelContent}</div>
      )}

      {activeConversation && !loadingMessages && (
        <MessagingSectionErrorBoundary name="MessagingInfoPanel">
          <MessagingInfoPanel
            conversation={activeConversation}
            messages={messages ?? []}
            isOnline={isOnline(resolveOtherParticipant(activeConversation, userId).id)}
            className="hidden xl:flex"
          />
        </MessagingSectionErrorBoundary>
      )}
    </div>
  );
}
