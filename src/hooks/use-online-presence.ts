"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CHANNEL_NAME = "online-users";

export function useMessagingPresence(
  currentUserId: string,
  watchUserIds: string[] = []
) {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();
    const channel = supabase.channel(CHANNEL_NAME, {
      config: { presence: { key: currentUserId } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<{ user_id: string }>();
      const next = new Set<string>();
      Object.values(state).forEach((entries) => {
        entries.forEach((entry) => {
          if (entry.user_id) next.add(entry.user_id);
        });
      });
      setOnlineIds(next);
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ user_id: currentUserId });
      }
    });

    return () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const watchedOnline = watchUserIds.some((id) => onlineIds.has(id));

  return { onlineIds, isOnline: (userId: string) => onlineIds.has(userId), watchedOnline };
}
