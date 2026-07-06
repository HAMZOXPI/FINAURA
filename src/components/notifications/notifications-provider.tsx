"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CELEBRATION_EVENT,
  isCelebrationNotification,
} from "@/lib/gifts/celebration-config";
import {
  diffNewNotifications,
  dispatchNotificationInsert,
  dispatchNotificationsSync,
  fetchRecentNotificationsClient,
} from "@/lib/notifications/client-sync";
import type { Notification } from "@/types/database";

const POLL_INTERVAL_MS = 8000;

interface NotificationsContextValue {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  decrementUnread: (amount?: number) => void;
  bellRing: number;
  triggerBellRing: () => void;
  notificationsRevision: number;
  recentNotifications: Notification[];
  syncNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function countUnread(rows: Notification[]): number {
  return rows.filter((row) => !row.is_read).length;
}

export function NotificationsProvider({
  userId,
  initialCount,
  children,
}: {
  userId: string | null;
  initialCount: number;
  children: ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [bellRing, setBellRing] = useState(0);
  const [notificationsRevision, setNotificationsRevision] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);

  const knownIdsRef = useRef<Set<string>>(new Set());
  const syncingRef = useRef(false);
  const isFirstSyncRef = useRef(true);

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    const supabase = createClient();
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (!error) setUnreadCount(count ?? 0);
  }, [userId]);

  const processInserted = useCallback((inserted: Notification[]) => {
    if (inserted.length === 0) return;

    setBellRing((n) => n + 1);
    setNotificationsRevision((n) => n + 1);

    for (const notification of inserted) {
      dispatchNotificationInsert(notification);

      if (isCelebrationNotification(notification)) {
        window.dispatchEvent(new CustomEvent(CELEBRATION_EVENT, { detail: notification }));
      }
    }
  }, []);

  const syncNotifications = useCallback(async () => {
    if (!userId || syncingRef.current) return;
    syncingRef.current = true;

    try {
      const rows = await fetchRecentNotificationsClient(userId);
      const inserted = isFirstSyncRef.current
        ? []
        : diffNewNotifications(knownIdsRef.current, rows);

      for (const row of rows) {
        knownIdsRef.current.add(row.id);
      }

      if (isFirstSyncRef.current) {
        isFirstSyncRef.current = false;
      }

      setRecentNotifications(rows);
      setUnreadCount(countUnread(rows));
      await refreshUnreadCount();

      if (inserted.length > 0) {
        processInserted(inserted);
      }

      dispatchNotificationsSync(rows, inserted);
      setNotificationsRevision((n) => n + 1);
    } finally {
      syncingRef.current = false;
    }
  }, [userId, processInserted, refreshUnreadCount]);

  const handleRealtimeInsert = useCallback(() => {
    void syncNotifications();
  }, [syncNotifications]);

  const decrementUnread = useCallback((amount = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - amount));
  }, []);

  const triggerBellRing = useCallback(() => {
    setBellRing((n) => n + 1);
  }, []);

  useEffect(() => {
    setUnreadCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    if (!userId) {
      knownIdsRef.current = new Set();
      isFirstSyncRef.current = true;
      setRecentNotifications([]);
      return;
    }

    knownIdsRef.current = new Set();
    isFirstSyncRef.current = true;

    void syncNotifications();
  }, [userId, syncNotifications]);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void handleRealtimeInsert();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void syncNotifications();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, handleRealtimeInsert, syncNotifications]);

  useEffect(() => {
    if (!userId) return;

    const poll = () => {
      if (document.visibilityState === "visible") {
        void syncNotifications();
      }
    };

    const interval = window.setInterval(poll, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncNotifications();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, syncNotifications]);

  const value = useMemo(
    () => ({
      unreadCount,
      refreshUnreadCount,
      decrementUnread,
      bellRing,
      triggerBellRing,
      notificationsRevision,
      recentNotifications,
      syncNotifications,
    }),
    [
      unreadCount,
      refreshUnreadCount,
      decrementUnread,
      bellRing,
      triggerBellRing,
      notificationsRevision,
      recentNotifications,
      syncNotifications,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    return {
      unreadCount: 0,
      refreshUnreadCount: async () => {},
      decrementUnread: () => {},
      bellRing: 0,
      triggerBellRing: () => {},
      notificationsRevision: 0,
      recentNotifications: [] as Notification[],
      syncNotifications: async () => {},
    };
  }
  return ctx;
}
