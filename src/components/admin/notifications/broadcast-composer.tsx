"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "@/lib/notifications/constants";
import {
  BROADCAST_BODY_MAX,
  BROADCAST_TITLE_MAX,
  type BroadcastFormValidation,
} from "@/lib/admin/broadcast-display";
import type { NotificationPriority, NotificationType } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface BroadcastComposerProps {
  title: string;
  body: string;
  priority: NotificationPriority;
  notificationType: NotificationType;
  actionUrl: string;
  validation: BroadcastFormValidation;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onPriorityChange: (value: NotificationPriority) => void;
  onNotificationTypeChange: (value: NotificationType) => void;
  onActionUrlChange: (value: string) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  );
}

function CharCounter({ value, max }: { value: number; max: number }) {
  const ratio = value / max;
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        ratio >= 1 ? "font-semibold text-red-600" : ratio >= 0.85 ? "text-amber-600" : "text-surface-400"
      )}
    >
      {value}/{max}
    </span>
  );
}

export function BroadcastComposer({
  title,
  body,
  priority,
  notificationType,
  actionUrl,
  validation,
  onTitleChange,
  onBodyChange,
  onPriorityChange,
  onNotificationTypeChange,
  onActionUrlChange,
}: BroadcastComposerProps) {
  const { t } = useTranslation();
  const bc = t.admin.notifications.broadcastCenter;
  const typeLabels = t.admin.notifications.types as Record<string, string>;
  const priorityLabels = t.admin.notifications.priorities as Record<string, string>;

  const errorMessages: Record<string, string> = {
    minLength: bc.validationMinLength,
    maxLength: bc.validationMaxLength,
    invalidUrl: bc.validationInvalidUrl,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold tracking-tight text-surface-900">{bc.composeTitle}</h2>
        <p className="mt-1 text-sm text-surface-500">{bc.composeSubtitle}</p>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-surface-500">
              {t.admin.notifications.fieldTitle}
            </label>
            <CharCounter value={title.length} max={BROADCAST_TITLE_MAX} />
          </div>
          <Input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder={t.admin.notifications.fieldTitle}
            className={cn(
              validation.errors.title && "border-red-300 focus:border-red-400 focus:ring-red-200"
            )}
          />
          <FieldError
            message={
              validation.errors.title
                ? errorMessages[validation.errors.title]
                : undefined
            }
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-surface-500">
              {t.admin.notifications.fieldBody}
            </label>
            <CharCounter value={body.length} max={BROADCAST_BODY_MAX} />
          </div>
          <Textarea
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            placeholder={t.admin.notifications.fieldBody}
            className={cn(
              "min-h-[140px] resize-y rounded-xl border-surface-200 bg-surface-50/40 text-sm leading-relaxed shadow-inner",
              validation.errors.body && "border-red-300 focus:border-red-400 focus:ring-red-200"
            )}
          />
          <FieldError
            message={
              validation.errors.body ? errorMessages[validation.errors.body] : undefined
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-surface-500">
              {bc.priorityLabel}
            </label>
            <select
              value={priority}
              onChange={(event) => onPriorityChange(event.target.value as NotificationPriority)}
              className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm font-medium shadow-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
            >
              {NOTIFICATION_PRIORITIES.map((item) => (
                <option key={item} value={item}>
                  {priorityLabels[item] ?? item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-surface-500">
              {bc.typeLabel}
            </label>
            <select
              value={notificationType}
              onChange={(event) =>
                onNotificationTypeChange(event.target.value as NotificationType)
              }
              className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm font-medium shadow-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
            >
              {NOTIFICATION_TYPES.map((item) => (
                <option key={item} value={item}>
                  {typeLabels[item] ?? item}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-surface-400">{bc.typePreviewHint}</p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-surface-500">
            {t.admin.notifications.fieldActionUrl}
          </label>
          <Input
            value={actionUrl}
            onChange={(event) => onActionUrlChange(event.target.value)}
            placeholder="/dashboard/settings"
            className={cn(
              validation.errors.actionUrl && "border-red-300 focus:border-red-400 focus:ring-red-200"
            )}
          />
          <FieldError
            message={
              validation.errors.actionUrl
                ? errorMessages[validation.errors.actionUrl]
                : undefined
            }
          />
        </div>
      </div>
    </motion.section>
  );
}
