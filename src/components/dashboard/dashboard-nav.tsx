"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Home,
  Heart,
  MessageSquare,
  Bell,
  Settings,
  Plus,
  Rocket,
} from "lucide-react";
import { UnreadCountBadge } from "@/components/messaging/unread-count-badge";
import { NotificationCountBadge } from "@/components/notifications/notification-count-badge";
import { useUnreadMessages } from "@/components/messaging/unread-messages-provider";
import { useNotifications } from "@/components/notifications/notifications-provider";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
}

export function DashboardNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { unreadCount } = useUnreadMessages();
  const { unreadCount: notificationCount } = useNotifications();

  const navGroups: { label: string; items: NavItem[] }[] = [
    {
      label: t.dashboard.navGroupDashboard,
      items: [
        { href: "/dashboard", label: t.dashboard.navOverview, icon: LayoutDashboard, exact: true },
        { href: "/dashboard/properties", label: t.dashboard.navProperties, icon: Home },
        { href: "/dashboard/boost", label: t.boost.navBoost, icon: Rocket },
      ],
    },
    {
      label: t.dashboard.navGroupCommunication,
      items: [
        { href: "/dashboard/messages", label: t.dashboard.navMessages, icon: MessageSquare },
        { href: "/dashboard/notifications", label: t.notifications.title, icon: Bell },
      ],
    },
    {
      label: t.dashboard.navGroupAccount,
      items: [
        { href: "/dashboard/favorites", label: t.dashboard.navFavorites, icon: Heart },
        { href: "/dashboard/settings", label: t.dashboard.navSettings, icon: Settings },
      ],
    },
  ];

  return (
    <nav className="flex flex-col gap-5">
      <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}>
        <Link
          href="/dashboard/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,105,198,0.55)] transition-shadow hover:shadow-[0_10px_24px_-8px_rgba(0,105,198,0.65)]"
        >
          <Plus className="h-5 w-5" />
          {t.dashboard.publishListing}
        </Link>
      </motion.div>

      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-surface-400">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200",
                    isActive
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="dashboard-nav-active-bar"
                      className="absolute inset-y-1.5 start-0 w-1 rounded-full bg-brand-600"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
                      isActive ? "text-brand-600" : "text-surface-400 group-hover:text-surface-600"
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.href === "/dashboard/messages" && (
                    <UnreadCountBadge count={unreadCount} />
                  )}
                  {item.href === "/dashboard/notifications" && (
                    <NotificationCountBadge count={notificationCount} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
