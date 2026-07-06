"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ConversationWithMeta } from "@/types/database";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { UnreadCountBadge } from "@/components/messaging/unread-count-badge";

interface ConversationListItemProps {
  conversation: ConversationWithMeta;
  isActive: boolean;
  isOnline: boolean;
  onSelect: () => void;
}

export function ConversationListItem({
  conversation,
  isActive,
  isOnline,
  onSelect,
}: ConversationListItemProps) {
  const { t, locale } = useTranslation();
  const other = conversation.other_participant;
  const property = conversation.property;
  const propertyImage = property?.images?.[0] ?? PLACEHOLDER_IMAGE;
  const buyer = conversation.buyer;
  const seller = conversation.seller;

  return (
    <motion.button
      type="button"
      layout
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-[20px] border px-3 py-3 text-start transition-all duration-200",
        isActive
          ? "border-brand-200 bg-brand-50 shadow-sm"
          : "border-transparent bg-white hover:border-surface-200 hover:bg-surface-50"
      )}
    >
      <div className="relative shrink-0">
        <div className="flex -space-x-3 rtl:space-x-reverse">
          <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white">
            {seller?.avatar_url ? (
              <Image src={seller.avatar_url} alt="" fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-brand-50 text-[10px] font-bold text-brand-700">
                {getInitials(seller?.full_name ?? t.properties.defaultAgent)}
              </span>
            )}
          </div>
          <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white">
            {buyer?.avatar_url ? (
              <Image src={buyer.avatar_url} alt="" fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-surface-100 text-[10px] font-bold text-surface-700">
                {getInitials(buyer?.full_name ?? t.messaging.anonymousBuyer)}
              </span>
            )}
          </div>
        </div>
        {isOnline && (
          <span className="absolute bottom-0 end-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-surface-900">
              {other.full_name ?? t.properties.defaultAgent}
            </p>
            <p className="truncate text-xs text-brand-600">{property?.title}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {conversation.last_message_at && (
              <span className="text-[11px] text-surface-400">
                {formatRelativeTime(conversation.last_message_at, locale)}
              </span>
            )}
            <UnreadCountBadge count={conversation.unread_count} />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="relative h-8 w-10 shrink-0 overflow-hidden rounded-lg">
            <Image src={propertyImage} alt="" fill className="object-cover" />
          </div>
          <p className="line-clamp-2 text-xs leading-relaxed text-surface-500">
            {conversation.last_message_text ?? t.messaging.noMessagesYet}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
