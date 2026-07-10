"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Monitor, Moon, Smartphone } from "lucide-react";
import type { NotificationPriority, NotificationType } from "@/types/database";
import { getNotificationVisuals } from "@/lib/notifications/presentation";
import type { BroadcastPreviewMode } from "@/lib/admin/broadcast-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface BroadcastPreviewProps {
  title: string;
  body: string;
  priority: NotificationPriority;
  notificationType: NotificationType;
}

function PreviewFrame({
  mode,
  title,
  body,
  priority,
  notificationType,
}: BroadcastPreviewProps & { mode: BroadcastPreviewMode }) {
  const visuals = getNotificationVisuals(notificationType, priority);
  const Icon = visuals.Icon;
  const isMobile = mode === "mobile";
  const isDark = mode === "dark";

  return (
    <div
      className={cn(
        "mx-auto transition-all",
        isMobile ? "w-[280px]" : "w-full max-w-md"
      )}
    >
      <div
        className={cn(
          "overflow-hidden rounded-2xl border shadow-lg",
          isDark
            ? "border-surface-700 bg-surface-900"
            : "border-surface-200 bg-white"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 border-b px-4 py-2.5",
            isDark ? "border-surface-700 bg-surface-800" : "border-surface-100 bg-surface-50"
          )}
        >
          <Bell className={cn("h-4 w-4", isDark ? "text-surface-300" : "text-surface-500")} />
          <span
            className={cn(
              "text-xs font-semibold",
              isDark ? "text-surface-200" : "text-surface-600"
            )}
          >
            Finaura
          </span>
        </div>
        <div className={cn("p-4", isDark && "bg-surface-900")}>
          <div className="flex gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                isDark ? "bg-surface-800" : visuals.iconClass
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-bold leading-snug",
                  isDark ? "text-white" : "text-surface-900"
                )}
              >
                {title.trim() || "—"}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs leading-relaxed",
                  isDark ? "text-surface-400" : "text-surface-500"
                )}
              >
                {body.trim() || "—"}
              </p>
              <span
                className={cn(
                  "mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                  isDark ? "bg-surface-800 text-surface-300 ring-surface-700" : visuals.badgeClass
                )}
              >
                {priority}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BroadcastPreview(props: BroadcastPreviewProps) {
  const { t } = useTranslation();
  const bc = t.admin.notifications.broadcastCenter;
  const [mode, setMode] = useState<BroadcastPreviewMode>("desktop");

  const modes: { id: BroadcastPreviewMode; label: string; icon: typeof Monitor }[] = [
    { id: "desktop", label: bc.previewDesktop, icon: Monitor },
    { id: "mobile", label: bc.previewMobile, icon: Smartphone },
    { id: "dark", label: bc.previewDark, icon: Moon },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-4"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight text-surface-900">{bc.previewTitle}</h2>
        <p className="mt-1 text-sm text-surface-500">{bc.previewSubtitle}</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {modes.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                mode === item.id
                  ? "bg-brand-600 text-white"
                  : "border border-surface-200 bg-white text-surface-600 hover:bg-surface-50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "flex min-h-[220px] items-center justify-center rounded-2xl p-4",
          mode === "dark" ? "bg-surface-950" : "bg-surface-50/80"
        )}
      >
        <PreviewFrame {...props} mode={mode} />
      </div>
    </motion.section>
  );
}
