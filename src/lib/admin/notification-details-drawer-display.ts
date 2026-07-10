import type { AdminNotificationRow } from "@/services/admin-notification.service";
import type { NotificationAnalyticsCategory } from "@/lib/admin/notifications-display";
import type { NotificationType } from "@/types/database";

export type RelatedEntityKind =
  | "boost"
  | "verification"
  | "message"
  | "promotion"
  | "listing"
  | "gift"
  | null;

export interface RelatedEntityField {
  labelKey: string;
  value: string;
}

export interface RelatedEntityInfo {
  kind: RelatedEntityKind;
  fields: RelatedEntityField[];
  href: string | null;
}

export interface NotificationTimelineEvent {
  key: "created" | "delivered" | "read" | "clicked";
  timestamp: string | null;
  available: boolean;
}

export interface NotificationDeliveryMetric {
  key: "delivered" | "read" | "clicked" | "opened" | "failed";
  available: boolean;
  value: boolean | null;
}

const TYPE_CATEGORY: Partial<Record<NotificationType, NotificationAnalyticsCategory>> = {
  new_message: "messages",
  verification_approved: "verification",
  verification_rejected: "verification",
  boost_outbid: "boost",
  boost_expired: "boost",
  premium_activated: "promotion",
  premium_expired: "promotion",
  premium_expiring: "promotion",
  payment_confirmed: "promotion",
  subscription_changed: "promotion",
  subscription_renewed: "promotion",
  subscription_expired: "promotion",
  property_approved: "promotion",
  property_rejected: "promotion",
  property_hidden: "promotion",
  system: "system",
  admin_broadcast: "system",
  report_listing: "system",
  gift_granted: "gift",
  gift_expired: "gift",
};

export function getNotificationCategory(
  type: NotificationType
): NotificationAnalyticsCategory | null {
  return TYPE_CATEGORY[type] ?? null;
}

function metadataString(metadata: Record<string, unknown>, key: string): string | null {
  const value = metadata[key];
  if (value === null || value === undefined) return null;
  return String(value);
}

export function buildRelatedEntityInfo(notification: AdminNotificationRow): RelatedEntityInfo | null {
  const { notification_type: type, metadata, action_url } = notification;
  const meta = metadata ?? {};

  if (type === "boost_outbid" || type === "boost_expired") {
    const listingId = metadataString(meta, "listingId");
    return {
      kind: "boost",
      href: listingId ? `/properties/${listingId}` : action_url,
      fields: [
        ...(listingId ? [{ labelKey: "listingId", value: listingId }] : []),
        ...(metadataString(meta, "position")
          ? [{ labelKey: "position", value: metadataString(meta, "position")! }]
          : []),
        ...(metadataString(meta, "winningAmount")
          ? [{ labelKey: "winningAmount", value: metadataString(meta, "winningAmount")! }]
          : []),
      ],
    };
  }

  if (type === "verification_approved" || type === "verification_rejected") {
    return {
      kind: "verification",
      href: "/admin/verifications",
      fields: [
        ...(metadataString(meta, "reason")
          ? [{ labelKey: "reason", value: metadataString(meta, "reason")! }]
          : []),
      ],
    };
  }

  if (type === "new_message") {
    return {
      kind: "message",
      href: action_url,
      fields: [
        ...(metadataString(meta, "senderName")
          ? [{ labelKey: "senderName", value: metadataString(meta, "senderName")! }]
          : []),
      ],
    };
  }

  if (
    type.startsWith("premium_") ||
    type.startsWith("subscription_") ||
    type === "payment_confirmed"
  ) {
    return {
      kind: "promotion",
      href: action_url ?? "/admin/promotions",
      fields: [
        ...(metadataString(meta, "planName")
          ? [{ labelKey: "planName", value: metadataString(meta, "planName")! }]
          : []),
        ...(metadataString(meta, "daysLeft")
          ? [{ labelKey: "daysLeft", value: metadataString(meta, "daysLeft")! }]
          : []),
      ],
    };
  }

  if (type === "gift_granted" || type === "gift_expired") {
    return {
      kind: "gift",
      href: action_url ?? "/admin/promotions",
      fields: [
        ...(metadataString(meta, "giftLabel")
          ? [{ labelKey: "giftLabel", value: metadataString(meta, "giftLabel")! }]
          : []),
      ],
    };
  }

  if (type === "property_approved" || type === "property_rejected" || type === "property_hidden") {
    const propertyId = metadataString(meta, "propertyId");
    return {
      kind: "listing",
      href: propertyId ? `/admin/properties/${propertyId}/edit` : action_url,
      fields: [
        ...(metadataString(meta, "title")
          ? [{ labelKey: "title", value: metadataString(meta, "title")! }]
          : []),
        ...(propertyId ? [{ labelKey: "propertyId", value: propertyId }] : []),
        ...(metadataString(meta, "reason")
          ? [{ labelKey: "reason", value: metadataString(meta, "reason")! }]
          : []),
      ],
    };
  }

  return null;
}

export function buildNotificationTimeline(
  notification: AdminNotificationRow
): NotificationTimelineEvent[] {
  return [
    { key: "created", timestamp: notification.created_at, available: true },
    { key: "delivered", timestamp: notification.created_at, available: true },
    {
      key: "read",
      timestamp: notification.read_at,
      available: Boolean(notification.read_at),
    },
    { key: "clicked", timestamp: null, available: false },
  ];
}

export function buildDeliveryMetrics(
  notification: AdminNotificationRow
): NotificationDeliveryMetric[] {
  return [
    { key: "delivered", available: true, value: true },
    { key: "read", available: true, value: notification.is_read },
    { key: "clicked", available: false, value: null },
    { key: "opened", available: false, value: null },
    { key: "failed", available: false, value: null },
  ];
}
