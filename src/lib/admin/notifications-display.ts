import type { AdminNotificationStats } from "@/services/admin-notification.service";
import type { NotificationPriority, NotificationType } from "@/types/database";

export type NotificationReadFilter = "all" | "read" | "unread";
export type NotificationPriorityFilter = NotificationPriority | "all";
export type NotificationSort = "newest" | "oldest";

export interface NotificationUiFilters {
  priority: NotificationPriorityFilter;
  sort: NotificationSort;
}

export const DEFAULT_NOTIFICATION_UI_FILTERS: NotificationUiFilters = {
  priority: "all",
  sort: "newest",
};

export type NotificationAnalyticsCategory =
  | "messages"
  | "verification"
  | "boost"
  | "promotion"
  | "system"
  | "gift";

const CATEGORY_TYPES: Record<NotificationAnalyticsCategory, NotificationType[]> = {
  messages: ["new_message"],
  verification: ["verification_approved", "verification_rejected"],
  boost: [],
  promotion: [
    "premium_activated",
    "premium_expired",
    "premium_expiring",
    "payment_confirmed",
    "subscription_changed",
    "subscription_renewed",
    "subscription_expired",
    "property_approved",
    "property_rejected",
    "property_hidden",
  ],
  system: ["system", "admin_broadcast", "report_listing"],
  gift: ["gift_granted", "gift_expired"],
};

export interface NotificationCategoryMetric {
  key: NotificationAnalyticsCategory;
  count: number;
  percentage: number;
}

export function buildNotificationCategoryMetrics(
  stats: AdminNotificationStats
): NotificationCategoryMetric[] {
  const total = stats.total || 0;

  return (Object.keys(CATEGORY_TYPES) as NotificationAnalyticsCategory[]).map((key) => {
    const count = CATEGORY_TYPES[key].reduce(
      (sum, type) => sum + (stats.byType[type] ?? 0),
      0
    );
    return {
      key,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

export function applyClientNotificationFilters<T extends { priority: NotificationPriority }>(
  rows: T[],
  ui: NotificationUiFilters
): T[] {
  let list = [...rows];

  if (ui.priority !== "all") {
    list = list.filter((row) => row.priority === ui.priority);
  }

  if (ui.sort === "oldest") {
    list = list.reverse();
  }

  return list;
}

export type NotificationsEmptyVariant = "none" | "empty" | "search" | "filter";

export function getNotificationsEmptyVariant(
  serverRows: number,
  displayRows: number,
  params: {
    query: string;
    type: NotificationType | "all";
    read: NotificationReadFilter;
    dateFrom: string;
    dateTo: string;
  },
  ui: NotificationUiFilters
): NotificationsEmptyVariant {
  if (displayRows > 0) return "none";
  if (
    serverRows === 0 &&
    !params.query &&
    params.type === "all" &&
    params.read === "all" &&
    !params.dateFrom &&
    !params.dateTo &&
    ui.priority === "all"
  ) {
    return "empty";
  }
  if (params.query.trim()) return "search";
  return "filter";
}

export function hasNotificationActiveFilters(
  params: {
    query: string;
    type: NotificationType | "all";
    read: NotificationReadFilter;
    dateFrom: string;
    dateTo: string;
  },
  ui: NotificationUiFilters
): boolean {
  return (
    params.query.trim().length > 0 ||
    params.type !== "all" ||
    params.read !== "all" ||
    Boolean(params.dateFrom) ||
    Boolean(params.dateTo) ||
    ui.priority !== "all" ||
    ui.sort !== "newest"
  );
}

export type ActiveNotificationChip = {
  key: string;
  label: string;
  onRemove: () => void;
};
