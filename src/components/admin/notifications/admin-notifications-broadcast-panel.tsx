"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Send } from "lucide-react";
import type { AdminBroadcastListResult } from "@/services/admin-notification.service";
import type { NotificationAudience, NotificationPriority, NotificationType } from "@/types/database";
import {
  validateBroadcastForm,
  type BroadcastDeliveryMode,
  type BroadcastTemplate,
} from "@/lib/admin/broadcast-display";
import { BroadcastAudienceBuilder } from "@/components/admin/notifications/broadcast-audience-builder";
import { BroadcastComposer } from "@/components/admin/notifications/broadcast-composer";
import { BroadcastDeliveryOptions } from "@/components/admin/notifications/broadcast-delivery-options";
import { BroadcastPreview } from "@/components/admin/notifications/broadcast-preview";
import { BroadcastRecentList } from "@/components/admin/notifications/broadcast-recent-list";
import { BroadcastTemplateGallery } from "@/components/admin/notifications/broadcast-template-gallery";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminNotificationsBroadcastPanelProps {
  cities: string[];
  broadcasts: AdminBroadcastListResult;
  broadcastTitle: string;
  broadcastBody: string;
  broadcastAudience: NotificationAudience;
  broadcastPriority: NotificationPriority;
  broadcastActionUrl: string;
  userQuery: string;
  userResults: { id: string; full_name: string | null; email: string }[];
  selectedUserId: string | null;
  targetCity: string;
  isPending: boolean;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onAudienceChange: (value: NotificationAudience) => void;
  onPriorityChange: (value: NotificationPriority) => void;
  onActionUrlChange: (value: string) => void;
  onUserQueryChange: (value: string) => void;
  onUserResultsChange: (users: { id: string; full_name: string | null; email: string }[]) => void;
  onSelectedUserIdChange: (id: string | null) => void;
  onTargetCityChange: (value: string) => void;
  onSend: () => void;
}

export function AdminNotificationsBroadcastPanel({
  cities,
  broadcasts,
  broadcastTitle,
  broadcastBody,
  broadcastAudience,
  broadcastPriority,
  broadcastActionUrl,
  userQuery,
  userResults,
  selectedUserId,
  targetCity,
  isPending,
  onTitleChange,
  onBodyChange,
  onAudienceChange,
  onPriorityChange,
  onActionUrlChange,
  onUserQueryChange,
  onUserResultsChange,
  onSelectedUserIdChange,
  onTargetCityChange,
  onSend,
}: AdminNotificationsBroadcastPanelProps) {
  const { t } = useTranslation();
  const bc = t.admin.notifications.broadcastCenter;

  const [notificationType, setNotificationType] = useState<NotificationType>("admin_broadcast");
  const [deliveryMode, setDeliveryMode] = useState<BroadcastDeliveryMode>("send_now");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const validation = useMemo(
    () =>
      validateBroadcastForm({
        title: broadcastTitle,
        body: broadcastBody,
        audience: broadcastAudience,
        selectedUserId,
        targetCity,
        actionUrl: broadcastActionUrl,
      }),
    [
      broadcastTitle,
      broadcastBody,
      broadcastAudience,
      selectedUserId,
      targetCity,
      broadcastActionUrl,
    ]
  );

  const handleTemplateSelect = (template: BroadcastTemplate) => {
    setSelectedTemplateId(template.id);
    onTitleChange(template.title);
    onBodyChange(template.body);
    onPriorityChange(template.priority);
    setNotificationType(template.notificationType);
    onActionUrlChange(template.actionUrl);
    setShowValidation(false);
  };

  const handleSend = () => {
    setShowValidation(true);
    if (!validation.valid || deliveryMode !== "send_now") return;
    onSend();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-24 lg:pb-0"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-surface-900">
            <Megaphone className="h-6 w-6 text-brand-600" />
            {bc.centerTitle}
          </h2>
          <p className="mt-1 text-sm text-surface-500">{bc.centerSubtitle}</p>
        </div>
      </div>

      <BroadcastTemplateGallery
        selectedTemplateId={selectedTemplateId}
        onSelect={handleTemplateSelect}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="space-y-6">
          <BroadcastComposer
            title={broadcastTitle}
            body={broadcastBody}
            priority={broadcastPriority}
            notificationType={notificationType}
            actionUrl={broadcastActionUrl}
            validation={showValidation ? validation : { valid: true, errors: {} }}
            onTitleChange={onTitleChange}
            onBodyChange={onBodyChange}
            onPriorityChange={onPriorityChange}
            onNotificationTypeChange={setNotificationType}
            onActionUrlChange={onActionUrlChange}
          />

          <BroadcastAudienceBuilder
            audience={broadcastAudience}
            cities={cities}
            targetCity={targetCity}
            userQuery={userQuery}
            userResults={userResults}
            selectedUserId={selectedUserId}
            broadcasts={broadcasts}
            validation={showValidation ? validation : { valid: true, errors: {} }}
            onAudienceChange={onAudienceChange}
            onTargetCityChange={onTargetCityChange}
            onUserQueryChange={onUserQueryChange}
            onUserResultsChange={onUserResultsChange}
            onSelectedUserIdChange={onSelectedUserIdChange}
          />

          <BroadcastDeliveryOptions mode={deliveryMode} onModeChange={setDeliveryMode} />

          <div className="hidden lg:block">
            <Button
              type="button"
              size="lg"
              isLoading={isPending}
              disabled={!validation.valid && showValidation}
              onClick={handleSend}
              className="w-full gap-2 sm:w-auto"
            >
              <Send className="h-4 w-4" />
              {t.admin.notifications.sendBroadcast}
            </Button>
          </div>
        </div>

        <BroadcastPreview
          title={broadcastTitle}
          body={broadcastBody}
          priority={broadcastPriority}
          notificationType={notificationType}
        />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-surface-900">
            {t.admin.notifications.recentBroadcasts}
          </h2>
          <p className="mt-1 text-sm text-surface-500">{bc.recentSubtitle}</p>
        </div>
        <BroadcastRecentList broadcasts={broadcasts} loading={isPending} />
      </section>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-surface-200 bg-white/95 p-4 backdrop-blur-md lg:hidden",
          "shadow-[0_-8px_30px_rgba(0,0,0,0.06)]"
        )}
      >
        <Button
          type="button"
          size="lg"
          isLoading={isPending}
          onClick={handleSend}
          className="w-full gap-2"
        >
          <Send className="h-4 w-4" />
          {t.admin.notifications.sendBroadcast}
        </Button>
      </div>
    </motion.div>
  );
}
