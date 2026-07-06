"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Heart,
  MessageSquare,
  Bell,
  Settings,
  Plus,
} from "lucide-react";
import { UnreadCountBadge } from "@/components/messaging/unread-count-badge";
import { NotificationCountBadge } from "@/components/notifications/notification-count-badge";
import { useUnreadMessages } from "@/components/messaging/unread-messages-provider";
import { useNotifications } from "@/components/notifications/notifications-provider";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export function DashboardNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { unreadCount } = useUnreadMessages();
  const { unreadCount: notificationCount } = useNotifications();

  const navItems = [
    { href: "/dashboard", label: t.dashboard.navOverview, icon: LayoutDashboard, exact: true },
    { href: "/dashboard/properties", label: t.dashboard.navProperties, icon: Home },
    { href: "/dashboard/favorites", label: t.dashboard.navFavorites, icon: Heart },
    { href: "/dashboard/messages", label: t.dashboard.navMessages, icon: MessageSquare },
    { href: "/dashboard/notifications", label: t.notifications.title, icon: Bell },
    { href: "/dashboard/settings", label: t.dashboard.navSettings, icon: Settings },
  ];

  return (
    <nav className="flex flex-col gap-1">
      <Link
        href="/dashboard/new"
        className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        <Plus className="h-4 w-4" />
        {t.dashboard.navNew}
      </Link>

      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-50 text-brand-700"
                : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
            {item.href === "/dashboard/messages" && (
              <UnreadCountBadge count={unreadCount} />
            )}
            {item.href === "/dashboard/notifications" && (
              <NotificationCountBadge count={notificationCount} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
