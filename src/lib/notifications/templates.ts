import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import {
  TEMPLATE_DEFAULTS,
  type NotificationTemplateKey,
} from "@/lib/notifications/constants";
import type { NotificationPriority, NotificationType } from "@/types/database";

export interface BuiltNotificationContent {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  actionUrl?: string | null;
  templateKey: NotificationTemplateKey;
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

export function buildNotificationFromTemplate(
  templateKey: NotificationTemplateKey,
  locale: Locale,
  vars: Record<string, string> = {}
): BuiltNotificationContent {
  const dict = getDictionary(locale);
  const templates = dict.notifications.templates as Record<
    string,
    { title: string; body: string; actionUrl?: string }
  >;
  const template = templates[templateKey];
  const defaults = TEMPLATE_DEFAULTS[templateKey];

  return {
    type: defaults.type,
    priority: defaults.priority,
    title: interpolate(template?.title ?? templateKey, vars),
    body: interpolate(template?.body ?? "", vars),
    actionUrl: template?.actionUrl ? interpolate(template.actionUrl, vars) : null,
    templateKey,
  };
}
