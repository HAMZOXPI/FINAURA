"use client";

import {
  Building2,
  MessageSquare,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import type { AdminActivityItem } from "@/services/admin.service";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const TYPE_CONFIG = {
  user: { icon: UserPlus, color: "text-brand-600 bg-brand-50" },
  property: { icon: Building2, color: "text-violet-600 bg-violet-50" },
  verification: { icon: ShieldCheck, color: "text-amber-600 bg-amber-50" },
  message: { icon: MessageSquare, color: "text-sky-600 bg-sky-50" },
};

interface AdminRecentActivityProps {
  items: AdminActivityItem[];
}

export function AdminRecentActivity({ items }: AdminRecentActivityProps) {
  const { t, locale } = useTranslation();

  return (
    <section className="rounded-2xl border border-surface-200/80 bg-white shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)]">
      <div className="border-b border-surface-100 px-6 py-5">
        <h2 className="text-lg font-bold text-surface-900">{t.admin.recentActivity}</h2>
        <p className="mt-1 text-sm text-surface-500">{t.admin.recentActivitySubtitle}</p>
      </div>

      {items.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-surface-500">
          {t.admin.noRecentActivity}
        </p>
      ) : (
        <ul className="divide-y divide-surface-100">
          {items.map((item) => {
            const config = TYPE_CONFIG[item.type];
            const Icon = config.icon;

            return (
              <li key={item.id} className="flex items-start gap-4 px-6 py-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-surface-900">{item.title}</p>
                  <p className="mt-0.5 truncate text-sm text-surface-500">{item.subtitle}</p>
                </div>
                <time className="shrink-0 text-xs text-surface-400">
                  {formatDate(item.createdAt, locale)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
