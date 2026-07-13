"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSetMobileChatFullscreen } from "@/components/messaging/mobile-chat-fullscreen-context";
import { cn } from "@/lib/utils";

interface MobileChatFullscreenPortalProps {
  open: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Teleports the mobile chat shell to document.body so it escapes transformed
 * ancestors (PageTransition) and truly covers the viewport.
 */
export function MobileChatFullscreenPortal({
  open,
  children,
  className,
}: MobileChatFullscreenPortalProps) {
  const [mounted, setMounted] = useState(false);
  const setFullscreen = useSetMobileChatFullscreen();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setFullscreen(true);
    return () => setFullscreen(false);
  }, [open, setFullscreen]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[60] flex h-[100dvh] max-h-[100dvh] flex-col bg-white",
        className
      )}
    >
      {children}
    </div>,
    document.body
  );
}
