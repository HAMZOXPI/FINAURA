import type { AdminBoostHistoryRow } from "@/services/admin-boost.service";
import type { AdminActivityItem } from "@/services/admin.service";
import type { BoostHistoryAction } from "@/types/database";
import type { Locale } from "@/i18n/config";

export type ActivityCenterTab =
  | "all"
  | "payments"
  | "boosts"
  | "listings"
  | "reports"
  | "messages";

export type ActivityStatusTone = "success" | "warning" | "info" | "danger" | "neutral";

export type ActivityFeedKind =
  | "payment"
  | "boost"
  | "listing"
  | "message"
  | "user"
  | "verification";

export interface ActivityFeedItem {
  id: string;
  kind: ActivityFeedKind;
  createdAt: string;
  title: string;
  description: string;
  statusTone: ActivityStatusTone;
  statusKey: string;
  emoji: string;
}

const PAYMENT_ACTIONS: BoostHistoryAction[] = ["created", "activated", "extended", "outbid"];

function getBoostStatusTone(action: BoostHistoryAction): ActivityStatusTone {
  switch (action) {
    case "activated":
    case "created":
    case "extended":
      return "success";
    case "outbid":
    case "position_changed":
      return "warning";
    case "expired":
    case "cancelled":
    case "removed":
    case "disabled":
      return "neutral";
    default:
      return "info";
  }
}

function getBoostStatusKey(action: BoostHistoryAction): string {
  return `boost_${action}`;
}

function getVerificationTone(status: string): ActivityStatusTone {
  if (status === "pending") return "warning";
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "info";
}

export function buildActivityFeed(
  activity: AdminActivityItem[],
  boostHistory: AdminBoostHistoryRow[],
  labels: {
    userTitle: string;
    userDescription: string;
    listingTitle: string;
    listingDescription: (title: string) => string;
    verificationTitle: (name: string) => string;
    verificationDescription: (status: string) => string;
    messageTitle: (name: string) => string;
    messageDescription: string;
    paymentTitle: string;
    paymentDescription: (amount: string) => string;
    boostTitle: (action: string) => string;
    boostDescription: (listing: string) => string;
    boostActionLabels: Record<string, string>;
    formatAmount: (amount: number) => string;
  }
): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [];

  for (const row of activity) {
    switch (row.type) {
      case "user":
        items.push({
          id: row.id,
          kind: "user",
          createdAt: row.createdAt,
          title: labels.userTitle,
          description: row.title || labels.userDescription,
          statusTone: "info",
          statusKey: "new_user",
          emoji: "👤",
        });
        break;
      case "property":
        items.push({
          id: row.id,
          kind: "listing",
          createdAt: row.createdAt,
          title: labels.listingTitle,
          description: labels.listingDescription(row.title),
          statusTone: "success",
          statusKey: "published",
          emoji: "🏠",
        });
        break;
      case "verification": {
        const status = row.subtitle.split("·").pop()?.trim() ?? "pending";
        items.push({
          id: row.id,
          kind: "verification",
          createdAt: row.createdAt,
          title: labels.verificationTitle(row.title),
          description: labels.verificationDescription(status),
          statusTone: getVerificationTone(status),
          statusKey: `verification_${status}`,
          emoji: "🛡️",
        });
        break;
      }
      case "message":
        items.push({
          id: row.id,
          kind: "message",
          createdAt: row.createdAt,
          title: labels.messageTitle(row.title),
          description: row.subtitle || labels.messageDescription,
          statusTone: "info",
          statusKey: "new_message",
          emoji: "💬",
        });
        break;
    }
  }

  for (const row of boostHistory) {
    const actionLabel = labels.boostActionLabels[row.action] ?? row.action;

    if (row.amount > 0 && PAYMENT_ACTIONS.includes(row.action)) {
      items.push({
        id: `payment-${row.id}`,
        kind: "payment",
        createdAt: row.createdAt,
        title: labels.paymentTitle,
        description: labels.paymentDescription(labels.formatAmount(row.amount)),
        statusTone: "success",
        statusKey: "payment_received",
        emoji: "💳",
      });
    }

    items.push({
      id: `boost-${row.id}`,
      kind: "boost",
      createdAt: row.createdAt,
      title: labels.boostTitle(actionLabel),
      description: labels.boostDescription(row.listingTitle),
      statusTone: getBoostStatusTone(row.action),
      statusKey: getBoostStatusKey(row.action),
      emoji: "🚀",
    });
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function filterActivityFeed(
  items: ActivityFeedItem[],
  tab: ActivityCenterTab
): ActivityFeedItem[] {
  switch (tab) {
    case "all":
      return items;
    case "payments":
      return items.filter((item) => item.kind === "payment");
    case "boosts":
      return items.filter((item) => item.kind === "boost");
    case "listings":
      return items.filter((item) => item.kind === "listing");
    case "reports":
      return [];
    case "messages":
      return items.filter((item) => item.kind === "message");
  }
}

export function formatActivityRelativeTime(
  dateString: string,
  locale: Locale,
  labels: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    yesterday: string;
    daysAgo: string;
  }
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return labels.justNow;
  if (diffMins < 60) return labels.minutesAgo.replace("{count}", String(diffMins));
  if (diffHours < 24) return labels.hoursAgo.replace("{count}", String(diffHours));
  if (diffDays === 1) return labels.yesterday;

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfYesterday && date < startOfToday) return labels.yesterday;
  if (diffDays < 7) return labels.daysAgo.replace("{count}", String(diffDays));

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    month: "short",
    day: "numeric",
  }).format(date);
}
