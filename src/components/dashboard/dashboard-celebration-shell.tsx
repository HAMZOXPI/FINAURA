"use client";

import { GiftStatusBanner } from "@/components/gifts/gift-status-banner";

export function DashboardCelebrationShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GiftStatusBanner />
      {children}
    </>
  );
}
