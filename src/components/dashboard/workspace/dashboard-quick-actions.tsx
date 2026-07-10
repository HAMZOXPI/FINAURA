"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Heart,
  MessageSquare,
  PlusCircle,
  Rocket,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const ACTIONS = [
  { key: "new", href: "/dashboard/new", icon: PlusCircle, accent: "bg-brand-50 text-brand-600", labelKey: "newListing" as const },
  { key: "boost", href: "/dashboard/boost", icon: Rocket, accent: "bg-orange-50 text-orange-600", labelKey: "boostListing" as const },
  { key: "messages", href: "/dashboard/messages", icon: MessageSquare, accent: "bg-violet-50 text-violet-600", labelKey: "messages" as const },
  { key: "favorites", href: "/dashboard/favorites", icon: Heart, accent: "bg-red-50 text-red-500", labelKey: "favorites" as const },
  { key: "notifications", href: "/dashboard/notifications", icon: Bell, accent: "bg-sky-50 text-sky-600", labelKey: "notifications" as const },
  { key: "settings", href: "/dashboard/settings", icon: Settings, accent: "bg-surface-100 text-surface-600", labelKey: "settings" as const },
];

export function DashboardQuickActions() {
  const { t } = useTranslation();
  const actions = t.dashboard.workspace.actions;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-surface-900">
          {t.dashboard.workspace.quickActionsTitle}
        </h2>
        <p className="mt-1 text-sm text-surface-500">{t.dashboard.workspace.quickActionsSubtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {ACTIONS.map((action, index) => {
          const Icon = action.icon;
          const label = actions[action.labelKey];

          return (
            <motion.div
              key={action.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -4 }}
            >
              <Link
                href={action.href}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-surface-200/80 bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-black/[0.04] transition-transform group-hover:scale-105",
                    action.accent
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <span className="text-sm font-semibold text-surface-800">{label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
