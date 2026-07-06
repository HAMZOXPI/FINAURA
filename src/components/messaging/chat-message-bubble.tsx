"use client";

import Image from "next/image";
import { CheckCheck, FileText } from "lucide-react";
import type { ChatMessage } from "@/types/database";
import { formatMessageTime } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  isSeen: boolean;
  showAvatar?: boolean;
  avatarUrl?: string | null;
  avatarFallback: string;
}

export function ChatMessageBubble({
  message,
  isOwn,
  isSeen,
  showAvatar,
  avatarUrl,
  avatarFallback,
}: ChatMessageBubbleProps) {
  const { t, locale } = useTranslation();

  return (
    <div className={cn("flex gap-2", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && showAvatar && (
        <div className="mt-auto flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-xs font-bold text-brand-700">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={32} height={32} className="h-8 w-8 object-cover" />
          ) : (
            avatarFallback
          )}
        </div>
      )}

      <div className={cn("max-w-[82%] sm:max-w-[70%]", isOwn && "order-first")}>
        <div
          className={cn(
            "rounded-[20px] px-4 py-2.5 shadow-sm",
            isOwn
              ? "rounded-br-md bg-brand-600 text-white"
              : "rounded-bl-md border border-surface-200 bg-white text-surface-800"
          )}
        >
          {message.attachment_url && message.attachment_type === "image" && (
            <a href={message.attachment_url} target="_blank" rel="noopener noreferrer">
              <img
                src={message.attachment_url}
                alt={message.attachment_name ?? "Image"}
                className="mb-2 max-h-56 w-full rounded-xl object-cover"
              />
            </a>
          )}

          {message.attachment_url && message.attachment_type === "file" && (
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                isOwn ? "bg-white/10 text-white" : "bg-surface-50 text-surface-700"
              )}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{message.attachment_name ?? t.messaging.attachment}</span>
            </a>
          )}

          {message.content && (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
          )}
        </div>

        <div
          className={cn(
            "mt-1 flex items-center gap-1.5 px-1 text-[11px]",
            isOwn ? "justify-end text-surface-400" : "text-surface-400"
          )}
        >
          <span>{formatMessageTime(message.created_at, locale)}</span>
          {isOwn && (
            <span className="inline-flex items-center gap-1">
              {isSeen ? (
                <>
                  <CheckCheck className="h-3.5 w-3.5 text-brand-600" />
                  {t.messaging.seen}
                </>
              ) : (
                t.messaging.sent
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
