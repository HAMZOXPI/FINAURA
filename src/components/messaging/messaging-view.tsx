"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import type { ChatMessage, ConversationWithMeta } from "@/types/database";
import { ChatWindow } from "@/components/messaging/chat-window";
import { ConversationList } from "@/components/messaging/conversation-list";
import { MessagingEmptyState } from "@/components/messaging/messaging-empty-state";
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
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId ?? initialConversations[0]?.id ?? null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    initialConversationId ? "chat" : "list"
  );

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

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

  const hasConversations = conversations.length > 0;

  return (
    <div className="grid min-h-[620px] gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-6">
      <div
        className={cn(
          "min-h-[520px] rounded-[24px] border border-surface-200/80 bg-surface-50/70 p-3 sm:p-4",
          mobileView === "chat" ? "hidden lg:block" : "block"
        )}
      >
        {hasConversations ? (
          <ConversationList
            userId={userId}
            initialConversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={handleSelectConversation}
            onConversationsChange={setConversations}
          />
        ) : (
          <MessagingEmptyState />
        )}
      </div>

      <div className={cn("min-h-[520px]", mobileView === "list" ? "hidden lg:block" : "block")}>
        {activeConversation && !loadingMessages ? (
          <ChatWindow
            conversation={activeConversation}
            initialMessages={messages}
            currentUserId={userId}
            showBackButton
            onBack={() => setMobileView("list")}
            onReadStateChange={(lastReadAt) => {
              setConversations((current) =>
                current.map((item) =>
                  item.id === activeConversation.id
                    ? { ...item, other_last_read_at: lastReadAt, unread_count: 0 }
                    : item
                )
              );
            }}
          />
        ) : activeConversation && loadingMessages ? (
          <div className="flex h-full min-h-[520px] items-center justify-center rounded-[24px] border border-surface-200/80 bg-white">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : (
          <div className="hidden h-full min-h-[520px] flex-col items-center justify-center rounded-[24px] border border-dashed border-surface-300 bg-white px-6 text-center lg:flex">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
              <MessageSquare className="h-8 w-8 text-brand-600" />
            </div>
            <h3 className="text-lg font-bold text-surface-900">{t.messaging.selectConversation}</h3>
            <p className="mt-2 max-w-sm text-sm text-surface-500">
              {t.messaging.selectConversationHint}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
