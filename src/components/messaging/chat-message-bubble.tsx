"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, CheckCheck, FileText } from "lucide-react";
import type { ChatMessage } from "@/types/database";
import { AudioMessagePlayer } from "@/components/messaging/audio-message-player";
import {
  getSafeImageSrc,
  isVoiceAttachment,
  parseVoiceDuration,
} from "@/lib/messaging/messaging-display";
import { formatMessageTime, cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  isSeen: boolean;
  showAvatar?: boolean;
  avatarUrl?: string | null;
  avatarFallback: string;
  index?: number;
}

export function ChatMessageBubble({
  message,
  isOwn,
  isSeen,
  showAvatar,
  avatarUrl,
  avatarFallback,
  index = 0,
}: ChatMessageBubbleProps) {
  const { t, locale } = useTranslation();

  const hasVoice = isVoiceAttachment(message);
  const hasImage = Boolean(
    message?.attachment_url && message?.attachment_type === "image" && !hasVoice
  );
  const hasFile = Boolean(
    message?.attachment_url && message?.attachment_type === "file" && !hasVoice
  );
  const hasContent = Boolean(message?.content?.trim());
  const isImageOnly = Boolean(hasImage && !hasContent && !hasFile && !hasVoice);
  const avatarSrc = getSafeImageSrc(avatarUrl, "");
  const attachmentSrc = getSafeImageSrc(message?.attachment_url, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.12), ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex gap-2.5", isOwn ? "justify-end" : "justify-start")}
    >
      {!isOwn && showAvatar && (
        <div className="mt-auto flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-[10px] font-bold text-brand-700 ring-2 ring-white shadow-sm">
          {avatarSrc ? (
            <Image src={avatarSrc} alt="" width={32} height={32} className="h-full w-full object-cover" />
          ) : (
            avatarFallback
          )}
        </div>
      )}

      <div className={cn("max-w-[88%] sm:max-w-[72%]", isOwn && "order-first")}>
        <div
          className={cn(
            "rounded-[20px] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]",
            isImageOnly ? "p-1" : "px-4 py-2.5",
            isOwn
              ? "rounded-br-md bg-gradient-to-br from-brand-600 via-brand-500 to-brand-600 text-white"
              : "rounded-bl-md border border-white/70 bg-white/90 text-surface-800 backdrop-blur-md"
          )}
        >
          {hasVoice && message.attachment_url && (
            <AudioMessagePlayer
              src={message.attachment_url}
              durationSeconds={parseVoiceDuration(message)}
              isOwn={isOwn}
            />
          )}

          {hasImage && attachmentSrc && (
            <a
              href={attachmentSrc}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("block overflow-hidden rounded-[16px]", hasContent && "mb-2")}
            >
              <img
                src={attachmentSrc}
                alt={message?.attachment_name ?? "Image"}
                loading="lazy"
                decoding="async"
                className={cn(
                  "block h-auto w-auto max-w-[min(78vw,320px)] max-h-[min(52vh,280px)] rounded-[16px] object-contain",
                  "sm:max-h-56 sm:w-full sm:max-w-none sm:object-cover"
                )}
              />
            </a>
          )}

          {hasFile && (
            <a
              href={message.attachment_url!}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                isOwn ? "bg-white/10 text-white" : "bg-surface-50 text-surface-700"
              )}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{message?.attachment_name ?? t.messaging.attachment}</span>
            </a>
          )}

          {message?.content && (
            <p
              className={cn(
                "whitespace-pre-wrap break-words text-[15px] leading-relaxed sm:text-sm",
                hasVoice && "mt-2"
              )}
            >
              {message.content}
            </p>
          )}
        </div>

        <div
          className={cn(
            "mt-1.5 flex items-center gap-1.5 px-1 text-[11px] text-surface-400",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          <span>{message?.created_at ? formatMessageTime(message.created_at, locale) : ""}</span>
          {isOwn && (
            <span className="inline-flex items-center gap-1">
              {isSeen ? (
                <>
                  <CheckCheck className="h-3.5 w-3.5 text-brand-600" />
                  <span>{t.messaging.read}</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>{t.messaging.sent}</span>
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
