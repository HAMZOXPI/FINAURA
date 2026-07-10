import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  CreditCard,
  Gift,
  Home,
  MessageSquare,
  Megaphone,
  Star,
  XCircle,
} from "lucide-react";
import type { NotificationPriority, NotificationType } from "@/types/database";

export interface NotificationVisuals {
  Icon: LucideIcon;
  emoji: string;
  iconClass: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
}

const PRIORITY_BADGE: Record<NotificationPriority, string> = {
  info: "bg-sky-100 text-sky-700 ring-sky-200",
  success: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-100 text-amber-800 ring-amber-200",
  error: "bg-red-100 text-red-700 ring-red-200",
};

const PRIORITY_BORDER: Record<NotificationPriority, string> = {
  info: "border-s-sky-400",
  success: "border-s-emerald-500",
  warning: "border-s-amber-400",
  error: "border-s-red-500",
};

const PRIORITY_BG: Record<NotificationPriority, string> = {
  info: "bg-sky-50/50",
  success: "bg-emerald-50/50",
  warning: "bg-amber-50/50",
  error: "bg-red-50/50",
};

const TYPE_ICON: Record<
  NotificationType,
  { Icon: LucideIcon; emoji: string; iconClass: string }
> = {
  verification_approved: { Icon: BadgeCheck, emoji: "✅", iconClass: "text-emerald-600 bg-emerald-100" },
  verification_rejected: { Icon: XCircle, emoji: "❌", iconClass: "text-red-600 bg-red-100" },
  property_approved: { Icon: Home, emoji: "🏠", iconClass: "text-brand-600 bg-brand-100" },
  property_rejected: { Icon: Home, emoji: "🏠", iconClass: "text-red-600 bg-red-100" },
  property_hidden: { Icon: Home, emoji: "🏠", iconClass: "text-amber-600 bg-amber-100" },
  premium_activated: { Icon: Star, emoji: "⭐", iconClass: "text-amber-500 bg-amber-100" },
  premium_expired: { Icon: Star, emoji: "⭐", iconClass: "text-amber-600 bg-amber-100" },
  premium_expiring: { Icon: AlertTriangle, emoji: "⚠️", iconClass: "text-amber-600 bg-amber-100" },
  gift_granted: { Icon: Gift, emoji: "🎁", iconClass: "text-violet-600 bg-violet-100" },
  gift_expired: { Icon: Gift, emoji: "🎁", iconClass: "text-surface-600 bg-surface-100" },
  payment_confirmed: { Icon: CreditCard, emoji: "💳", iconClass: "text-emerald-600 bg-emerald-100" },
  subscription_changed: { Icon: Star, emoji: "⭐", iconClass: "text-sky-600 bg-sky-100" },
  subscription_renewed: { Icon: Star, emoji: "⭐", iconClass: "text-emerald-600 bg-emerald-100" },
  subscription_expired: { Icon: Star, emoji: "⭐", iconClass: "text-red-600 bg-red-100" },
  new_message: { Icon: MessageSquare, emoji: "💬", iconClass: "text-sky-600 bg-sky-100" },
  report_listing: { Icon: AlertTriangle, emoji: "⚠️", iconClass: "text-amber-600 bg-amber-100" },
  boost_outbid: { Icon: AlertTriangle, emoji: "🔔", iconClass: "text-amber-600 bg-amber-100" },
  boost_expired: { Icon: Star, emoji: "⏱️", iconClass: "text-surface-600 bg-surface-100" },
  admin_broadcast: { Icon: Megaphone, emoji: "📢", iconClass: "text-brand-600 bg-brand-100" },
  system: { Icon: Bell, emoji: "🔔", iconClass: "text-surface-600 bg-surface-100" },
};

export function getNotificationVisuals(
  type: NotificationType,
  priority: NotificationPriority
): NotificationVisuals {
  const typeVisual = TYPE_ICON[type] ?? TYPE_ICON.system;
  return {
    ...typeVisual,
    badgeClass: PRIORITY_BADGE[priority],
    borderClass: PRIORITY_BORDER[priority],
    bgClass: PRIORITY_BG[priority],
  };
}

export function getPriorityLabelKey(priority: NotificationPriority): string {
  return priority;
}
