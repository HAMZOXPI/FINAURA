"use client";

import { useState } from "react";
import {
  Copy,
  ExternalLink,
  RefreshCw,
  Trash2,
  UserRound,
} from "lucide-react";
import type { AdminNotificationRow } from "@/services/admin-notification.service";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface NotificationQuickActionsProps {
  notification: AdminNotificationRow;
}

export function NotificationQuickActions({ notification }: NotificationQuickActionsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const recipient = notification.recipient;
  const userHref = recipient
    ? `/admin/users?q=${encodeURIComponent(recipient.email ?? recipient.id)}`
    : null;

  const handleCopyLink = async () => {
    if (!notification.action_url) return;
    try {
      await navigator.clipboard.writeText(
        notification.action_url.startsWith("http")
          ? notification.action_url
          : `${window.location.origin}${notification.action_url}`
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const actions = [
    {
      key: "openUser",
      label: t.admin.notifications.drawer.actions.openUser,
      icon: UserRound,
      href: userHref,
      disabled: !userHref,
      comingSoon: false,
    },
    {
      key: "openRelated",
      label: t.admin.notifications.drawer.actions.openRelated,
      icon: ExternalLink,
      href: notification.action_url,
      disabled: !notification.action_url,
      comingSoon: false,
      external: true,
    },
    {
      key: "copyLink",
      label: copied
        ? t.admin.notifications.drawer.actions.copied
        : t.admin.notifications.drawer.actions.copyLink,
      icon: Copy,
      onClick: handleCopyLink,
      disabled: !notification.action_url,
      comingSoon: false,
    },
    {
      key: "resend",
      label: t.admin.notifications.drawer.actions.resend,
      icon: RefreshCw,
      disabled: true,
      comingSoon: true,
    },
    {
      key: "delete",
      label: t.admin.notifications.drawer.actions.delete,
      icon: Trash2,
      disabled: true,
      comingSoon: true,
      danger: true,
    },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        const content = (
          <>
            <Icon className="h-4 w-4" />
            <span>{action.label}</span>
            {action.comingSoon && (
              <span className="rounded-full bg-surface-100 px-1.5 py-0.5 text-[10px] font-semibold text-surface-400">
                {t.admin.notifications.comingSoon}
              </span>
            )}
          </>
        );

        const className = cn(
          "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition-colors",
          action.comingSoon || action.disabled
            ? "cursor-not-allowed border border-surface-200 bg-surface-50 text-surface-400"
            : "danger" in action && action.danger
              ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
              : "border border-surface-200 bg-white text-surface-700 hover:bg-surface-50"
        );

        if ("href" in action && action.href && !action.disabled) {
          return (
            <a
              key={action.key}
              href={action.href}
              target={"external" in action && action.external ? "_blank" : undefined}
              rel={"external" in action && action.external ? "noopener noreferrer" : undefined}
              className={className}
            >
              {content}
            </a>
          );
        }

        if ("onClick" in action && action.onClick) {
          return (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={className}
            >
              {content}
            </button>
          );
        }

        return (
          <button key={action.key} type="button" disabled className={className}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
