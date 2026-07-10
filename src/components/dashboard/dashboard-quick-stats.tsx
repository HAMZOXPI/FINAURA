"use client";

import { Heart, Home, MessageSquare, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useUnreadMessages } from "@/components/messaging/unread-messages-provider";
import { useNotifications } from "@/components/notifications/notifications-provider";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardQuickStatsProps {
  activeListingsCount: number | null;
  favoritesCount: number | null;
}

function StatCard({
  icon: Icon,
  value,
  label,
  index,
}: {
  icon: typeof Home;
  value: number | null;
  label: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{ scale: 1.02 }}
      className="flex flex-col gap-1.5 rounded-xl border border-surface-200/80 bg-white px-2.5 py-2.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <Icon className="h-3.5 w-3.5 text-brand-600" />
      <p className="text-base font-bold leading-none text-surface-900">
        {value != null ? value : "--"}
      </p>
      <p className="truncate text-[10px] font-medium leading-none text-surface-500">{label}</p>
    </motion.div>
  );
}

export function DashboardQuickStats({
  activeListingsCount,
  favoritesCount,
}: DashboardQuickStatsProps) {
  const { t } = useTranslation();
  const { unreadCount: unreadMessages } = useUnreadMessages();
  const { unreadCount: unreadNotifications } = useNotifications();

  return (
    <div className="mt-4 grid grid-cols-4 gap-1.5">
      <StatCard icon={Home} value={activeListingsCount} label={t.dashboard.activeListings} index={0} />
      <StatCard icon={Heart} value={favoritesCount} label={t.dashboard.favorites} index={1} />
      <StatCard icon={MessageSquare} value={unreadMessages} label={t.dashboard.messages} index={2} />
      <StatCard icon={Bell} value={unreadNotifications} label={t.notifications.title} index={3} />
    </div>
  );
}
