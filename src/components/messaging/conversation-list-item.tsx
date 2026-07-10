"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import type { ConversationWithMeta } from "@/types/database";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { getSafeImageSrc, getSafePropertyImage, resolveOtherParticipant } from "@/lib/messaging/messaging-display";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { UnreadCountBadge } from "@/components/messaging/unread-count-badge";

interface ConversationListItemProps {
  conversation: ConversationWithMeta;
  isActive: boolean;
  isOnline: boolean;
  isVerified?: boolean;
  onSelect: () => void;
}

export function ConversationListItem({
  conversation,
  isActive,
  isOnline,
  isVerified = false,
  onSelect,
}: ConversationListItemProps) {
  const { t, locale } = useTranslation();
  const other = resolveOtherParticipant(conversation);
  const property = conversation?.property;
  const propertyImage = getSafePropertyImage(property?.images, PLACEHOLDER_IMAGE);
  const avatarSrc = getSafeImageSrc(other?.avatar_url, "");

  return (
    <motion.button
      type="button"
      layout
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={cn(
        "group relative flex w-full items-start gap-3 overflow-hidden rounded-[20px] border px-3 py-3 text-start transition-all duration-200",
        isActive
          ? "border-brand-300/80 bg-gradient-to-r from-brand-50/90 to-white shadow-[0_10px_28px_-12px_rgba(0,105,198,0.35)]"
          : "border-transparent bg-white/90 hover:border-surface-200 hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
      )}
    >
      {isActive && (
        <span className="absolute inset-y-3 start-0 w-1 rounded-full bg-gradient-to-b from-brand-500 to-brand-700" />
      )}

      <div className="relative shrink-0 ps-1">
        <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white shadow-sm">
          {avatarSrc ? (
            <Image src={avatarSrc} alt="" fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-brand-50 text-xs font-bold text-brand-700">
              {getInitials(other.full_name ?? t.properties.defaultAgent)}
            </span>
          )}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 end-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-semibold text-surface-900">
                {other.full_name ?? t.properties.defaultAgent}
              </p>
              {isVerified && other?.id && other.id === conversation?.seller_id && (
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-label={t.seller.verifiedSeller} />
              )}
            </div>
            <p className="truncate text-xs font-medium text-brand-700">{property?.title}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {conversation.last_message_at && (
              <span className="text-[11px] text-surface-400">
                {formatRelativeTime(conversation.last_message_at, locale)}
              </span>
            )}
            <UnreadCountBadge count={conversation?.unread_count ?? 0} />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2.5">
          <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-surface-200/80">
            <Image src={propertyImage} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
          <p
            className={cn(
              "line-clamp-2 text-xs leading-relaxed",
              (conversation?.unread_count ?? 0) > 0
                ? "font-semibold text-surface-800"
                : "text-surface-500"
            )}
          >
            {conversation.last_message_text ?? t.messaging.noMessagesYet}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
