"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CELEBRATION_EVENT,
  hasSeenCelebration,
  isCelebrationNotification,
  loadSeenCelebrationIds,
  markCelebrationSeen,
  markGiftGrantedCelebration,
  resolveCelebrationConfig,
  saveActiveBanner,
  shouldSkipPremiumCelebration,
  type GiftCelebrationConfig,
} from "@/lib/gifts/celebration-config";
import {
  fetchUnseenCelebrationNotificationsClient,
  NOTIFICATION_INSERT_EVENT,
  NOTIFICATIONS_SYNC_EVENT,
} from "@/lib/notifications/client-sync";
import { useNotifications } from "@/components/notifications/notifications-provider";
import { GiftCelebrationModal } from "@/components/gifts/gift-celebration-modal";
import type { Notification } from "@/types/database";

interface ActiveCelebration {
  notification: Notification;
  config: GiftCelebrationConfig;
}

export function GiftCelebrationProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: React.ReactNode;
}) {
  const { recentNotifications, notificationsRevision, syncNotifications } = useNotifications();
  const [active, setActive] = useState<ActiveCelebration | null>(null);

  const queueRef = useRef<Notification[]>([]);
  const queuedIdsRef = useRef<Set<string>>(new Set());
  const showingRef = useRef(false);
  const bootstrapDoneRef = useRef(false);

  const showNextInQueue = useCallback(() => {
    if (showingRef.current) return;

    const next = queueRef.current.shift();
    if (!next) return;

    showingRef.current = true;
    const config = resolveCelebrationConfig(next);
    setActive({ notification: next, config });

    if (config.bannerKey) {
      saveActiveBanner({
        kind: config.kind,
        bannerKey: config.bannerKey,
        notificationId: next.id,
      });
      window.dispatchEvent(new CustomEvent("finaura-gift-banner-update"));
    }
  }, []);

  const tryEnqueue = useCallback(
    (notification: Notification) => {
      if (!isCelebrationNotification(notification)) return;
      if (hasSeenCelebration(notification.id)) return;
      if (shouldSkipPremiumCelebration(notification)) return;
      if (queuedIdsRef.current.has(notification.id)) return;
      if (active?.notification.id === notification.id) return;

      if (notification.notification_type === "gift_granted") {
        markGiftGrantedCelebration();
      }

      queuedIdsRef.current.add(notification.id);
      queueRef.current.push(notification);
      showNextInQueue();
    },
    [active?.notification.id, showNextInQueue]
  );

  const closeCelebration = useCallback(() => {
    if (active) {
      markCelebrationSeen(active.notification.id);
    }
    setActive(null);
    showingRef.current = false;
    window.setTimeout(() => showNextInQueue(), 450);
  }, [active, showNextInQueue]);

  useEffect(() => {
    const onInsert = (event: Event) => {
      const custom = event as CustomEvent<Notification>;
      if (custom.detail) tryEnqueue(custom.detail);
    };

    const onSync = (event: Event) => {
      const custom = event as CustomEvent<{ inserted?: Notification[] }>;
      custom.detail?.inserted?.forEach((notification) => tryEnqueue(notification));
    };

    window.addEventListener(NOTIFICATION_INSERT_EVENT, onInsert);
    window.addEventListener(NOTIFICATIONS_SYNC_EVENT, onSync);
    window.addEventListener(CELEBRATION_EVENT, onInsert);
    return () => {
      window.removeEventListener(NOTIFICATION_INSERT_EVENT, onInsert);
      window.removeEventListener(NOTIFICATIONS_SYNC_EVENT, onSync);
      window.removeEventListener(CELEBRATION_EVENT, onInsert);
    };
  }, [tryEnqueue]);

  useEffect(() => {
    for (const notification of recentNotifications) {
      tryEnqueue(notification);
    }
  }, [recentNotifications, notificationsRevision, tryEnqueue]);

  useEffect(() => {
    if (!userId) {
      bootstrapDoneRef.current = false;
      queuedIdsRef.current = new Set();
      queueRef.current = [];
      return;
    }

    if (bootstrapDoneRef.current) return;
    bootstrapDoneRef.current = true;

    const bootstrap = async () => {
      await syncNotifications();
      const seenIds = loadSeenCelebrationIds();
      const unseen = await fetchUnseenCelebrationNotificationsClient(userId, seenIds);
      for (const notification of unseen) {
        tryEnqueue(notification);
      }
    };

    const timer = window.setTimeout(() => {
      void bootstrap();
    }, 600);

    return () => window.clearTimeout(timer);
  }, [userId, syncNotifications, tryEnqueue]);

  return (
    <>
      {children}
      <GiftCelebrationModal
        open={!!active}
        notificationId={active?.notification.id ?? null}
        config={active?.config ?? null}
        onClose={closeCelebration}
      />
    </>
  );
}
