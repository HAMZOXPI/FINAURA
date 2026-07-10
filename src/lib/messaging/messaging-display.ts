import type { ChatMessage, ConversationWithMeta, Profile } from "@/types/database";
import type { Locale } from "@/i18n/config";

export interface MessageDateGroup {
  key: string;
  label: string;
  messages: ChatMessage[];
}

const FALLBACK_PARTICIPANT: Pick<Profile, "id" | "full_name" | "avatar_url"> = {
  id: "",
  full_name: null,
  avatar_url: null,
};

export function resolveOtherParticipant(
  conversation: ConversationWithMeta | null | undefined,
  currentUserId?: string
): Pick<Profile, "id" | "full_name" | "avatar_url"> {
  if (!conversation) return FALLBACK_PARTICIPANT;

  if (conversation.other_participant?.id) {
    return conversation.other_participant;
  }

  const isBuyer = currentUserId ? conversation.buyer_id === currentUserId : false;
  const joined = isBuyer ? conversation.seller : conversation.buyer;
  if (joined?.id) return joined;

  const fallbackId = isBuyer ? conversation.seller_id : conversation.buyer_id;
  return {
    id: fallbackId ?? "",
    full_name: null,
    avatar_url: null,
  };
}

export function getSafeWatchIds(
  conversations: ConversationWithMeta[] | null | undefined
): string[] {
  return (conversations ?? [])
    .map((conversation) => resolveOtherParticipant(conversation).id)
    .filter((id): id is string => Boolean(id));
}

export function getSafeImageSrc(
  value: unknown,
  fallback = ""
): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return fallback;
}

export function getSafePropertyImage(
  images: unknown,
  fallback: string
): string {
  if (!Array.isArray(images)) return fallback;
  return getSafeImageSrc(images[0], fallback);
}

export function filterConversations(
  conversations: ConversationWithMeta[] | null | undefined,
  query: string,
  unreadOnly: boolean
): ConversationWithMeta[] {
  if (!conversations?.length) return [];

  const normalized = query.trim().toLowerCase();

  return conversations.filter((conversation) => {
    if (!conversation?.id) return false;
    if (unreadOnly && (conversation.unread_count ?? 0) <= 0) return false;
    if (!normalized) return true;

    const other = resolveOtherParticipant(conversation);
    const otherName = other.full_name?.toLowerCase() ?? "";
    const propertyTitle = conversation.property?.title?.toLowerCase() ?? "";
    const preview = conversation.last_message_text?.toLowerCase() ?? "";

    return (
      otherName.includes(normalized) ||
      propertyTitle.includes(normalized) ||
      preview.includes(normalized)
    );
  });
}

export function getDateKey(dateString: string | null | undefined): string {
  if (!dateString) return "unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "unknown";
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function formatDateSeparatorLabel(
  dateString: string | null | undefined,
  locale: Locale,
  labels: { today: string; yesterday: string }
): string {
  if (!dateString) return labels.today;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return labels.today;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);

  if (diffDays === 0) return labels.today;
  if (diffDays === 1) return labels.yesterday;

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function groupMessagesByDate(
  messages: ChatMessage[] | null | undefined,
  locale: Locale,
  labels: { today: string; yesterday: string }
): MessageDateGroup[] {
  if (!messages?.length) return [];

  const groups: MessageDateGroup[] = [];

  for (const message of messages) {
    if (!message?.id) continue;

    const key = getDateKey(message.created_at);
    const existing = groups.find((group) => group.key === key);
    if (existing) {
      existing.messages.push(message);
      continue;
    }

    groups.push({
      key,
      label: formatDateSeparatorLabel(message.created_at, locale, labels),
      messages: [message],
    });
  }

  return groups;
}

export function findFirstUnreadIndex(
  messages: ChatMessage[] | null | undefined,
  lastReadAt: string | null,
  currentUserId: string
): number {
  if (!lastReadAt || !messages?.length || !currentUserId) return -1;

  const readTime = new Date(lastReadAt).getTime();
  if (Number.isNaN(readTime)) return -1;

  return messages.findIndex((message) => {
    if (!message?.created_at || message.sender_id === currentUserId) return false;
    const createdAt = new Date(message.created_at).getTime();
    return !Number.isNaN(createdAt) && createdAt > readTime;
  });
}

export function extractSharedMedia(messages: ChatMessage[] | null | undefined): string[] {
  if (!messages?.length) return [];

  return messages
    .filter(
      (message) =>
        message?.attachment_type === "image" &&
        message.attachment_url &&
        !isVoiceAttachment(message)
    )
    .map((message) => message.attachment_url as string)
    .slice(-12)
    .reverse();
}

const VOICE_NAME_PREFIX = /^voice_(\d+)_/;

export function isVoiceAttachment(message: ChatMessage | null | undefined): boolean {
  if (!message?.attachment_url || message.attachment_type !== "file") return false;

  const name = message.attachment_name ?? "";
  if (VOICE_NAME_PREFIX.test(name)) return true;

  return /\.(webm|ogg|mp4|m4a|wav|mp3|aac)(\?|$)/i.test(message.attachment_url);
}

export function parseVoiceDuration(message: ChatMessage | null | undefined): number | null {
  const name = message?.attachment_name ?? "";
  const match = name.match(VOICE_NAME_PREFIX);
  if (!match) return null;
  const seconds = Number.parseInt(match[1], 10);
  return Number.isNaN(seconds) ? null : seconds;
}

export function buildVoiceAttachmentName(durationSeconds: number): string {
  const seconds = Math.max(1, Math.round(durationSeconds));
  return `voice_${seconds}_voice-message.webm`;
}

export function formatVoiceDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatMemberSince(
  dateString: string | null | undefined,
  locale: Locale
): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export { FALLBACK_PARTICIPANT };
