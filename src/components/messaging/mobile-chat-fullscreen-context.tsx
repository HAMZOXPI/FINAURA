"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface MobileChatFullscreenContextValue {
  active: boolean;
  setActive: (active: boolean) => void;
}

const MobileChatFullscreenContext = createContext<MobileChatFullscreenContextValue | null>(
  null
);

export function MobileChatFullscreenProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const value = useMemo(() => ({ active, setActive }), [active]);

  return (
    <MobileChatFullscreenContext.Provider value={value}>
      {children}
    </MobileChatFullscreenContext.Provider>
  );
}

export function useMobileChatFullscreen(): boolean {
  return useContext(MobileChatFullscreenContext)?.active ?? false;
}

export function useSetMobileChatFullscreen(): (active: boolean) => void {
  const ctx = useContext(MobileChatFullscreenContext);
  return ctx?.setActive ?? (() => {});
}
