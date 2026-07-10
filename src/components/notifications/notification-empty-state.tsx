"use client";

import { Bell } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

export function NotificationEmptyState({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();

  return (
    <div
      className={
        compact
          ? "flex flex-col items-center px-4 py-8 text-center sm:py-10"
          : "flex flex-col items-center rounded-2xl border border-dashed border-surface-200 bg-surface-50/50 px-6 py-16 text-center"
      }
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100 text-surface-400">
        <Bell className="h-7 w-7" />
      </div>
      <p className="mt-4 text-sm font-semibold text-surface-800">{t.notifications.emptyTitle}</p>
      <p className="mt-1 max-w-xs text-sm text-surface-500">{t.notifications.empty}</p>
    </div>
  );
}
