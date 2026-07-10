"use client";

import { useEffect, useState } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const CHANNEL_NAME = "online-users";

type OnlineListener = (onlineIds: Set<string>) => void;

let sharedChannel: RealtimeChannel | null = null;
let sharedSupabase: SupabaseClient | null = null;
let sharedUserId: string | null = null;
let subscriberCount = 0;
const listeners = new Set<OnlineListener>();

function syncPresenceState(channel: RealtimeChannel) {
  const state = channel.presenceState<{ user_id: string }>();
  const next = new Set<string>();
  Object.values(state).forEach((entries) => {
    entries.forEach((entry) => {
      if (entry.user_id) next.add(entry.user_id);
    });
  });
  listeners.forEach((listener) => listener(next));
}

function teardownPresenceChannel() {
  if (!sharedChannel || !sharedSupabase) return;

  void sharedChannel.untrack();
  void sharedChannel.unsubscribe();
  void sharedSupabase.removeChannel(sharedChannel);
  sharedChannel = null;
  sharedSupabase = null;
  sharedUserId = null;
}

function ensurePresenceChannel(supabase: SupabaseClient, currentUserId: string) {
  if (sharedChannel && sharedUserId !== currentUserId) {
    teardownPresenceChannel();
  }

  if (sharedChannel) return sharedChannel;

  const channel = supabase.channel(CHANNEL_NAME, {
    config: { presence: { key: currentUserId } },
  });

  channel.on("presence", { event: "sync" }, () => {
    syncPresenceState(channel);
  });

  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.track({ user_id: currentUserId });
    }
  });

  sharedChannel = channel;
  sharedSupabase = supabase;
  sharedUserId = currentUserId;
  return channel;
}

export function useMessagingPresence(
  currentUserId: string,
  watchUserIds: string[] = []
) {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();
    const listener: OnlineListener = (ids) => setOnlineIds(new Set(ids));
    listeners.add(listener);
    subscriberCount++;

    ensurePresenceChannel(supabase, currentUserId);
    if (sharedChannel) {
      syncPresenceState(sharedChannel);
    }

    return () => {
      listeners.delete(listener);
      subscriberCount = Math.max(0, subscriberCount - 1);
      if (subscriberCount === 0) {
        teardownPresenceChannel();
      }
    };
  }, [currentUserId]);

  const watchedOnline = watchUserIds.some((id) => onlineIds.has(id));

  return { onlineIds, isOnline: (userId: string) => onlineIds.has(userId), watchedOnline };
}
