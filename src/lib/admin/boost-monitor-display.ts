import type { AdminFeaturedListingRow } from "@/services/admin-boost.service";
import type { LucideIcon } from "lucide-react";
import { Crown } from "lucide-react";

export interface AdminBoostMonitorSlot {
  position: number;
  listing: AdminFeaturedListingRow | null;
}

export interface AdminPositionLightTheme {
  medal: string;
  gradient: string;
  border: string;
  ring: string;
  glow: string;
  hoverGlow: string;
  badgeBg: string;
  badgeText: string;
  accent: string;
  Icon?: LucideIcon;
}

export const ADMIN_MONITOR_THEMES: Record<number, AdminPositionLightTheme> = {
  1: {
    medal: "👑",
    gradient: "from-amber-50/90 via-white to-yellow-50/60",
    border: "border-amber-300/55",
    ring: "ring-amber-200/50",
    glow: "shadow-[0_4px_24px_rgba(251,191,36,0.14)]",
    hoverGlow: "hover:shadow-[0_8px_32px_rgba(251,191,36,0.22)]",
    badgeBg: "bg-gradient-to-r from-amber-500 to-yellow-500",
    badgeText: "text-amber-950",
    accent: "text-amber-700",
    Icon: Crown,
  },
  2: {
    medal: "🥈",
    gradient: "from-slate-50/90 via-white to-slate-100/40",
    border: "border-slate-300/60",
    ring: "ring-slate-200/60",
    glow: "shadow-[0_4px_20px_rgba(148,163,184,0.12)]",
    hoverGlow: "hover:shadow-[0_8px_28px_rgba(148,163,184,0.18)]",
    badgeBg: "bg-gradient-to-r from-slate-400 to-slate-500",
    badgeText: "text-white",
    accent: "text-slate-700",
  },
  3: {
    medal: "🥉",
    gradient: "from-orange-50/80 via-white to-amber-50/40",
    border: "border-orange-300/50",
    ring: "ring-orange-200/50",
    glow: "shadow-[0_4px_20px_rgba(251,146,60,0.12)]",
    hoverGlow: "hover:shadow-[0_8px_28px_rgba(251,146,60,0.18)]",
    badgeBg: "bg-gradient-to-r from-orange-500 to-amber-600",
    badgeText: "text-white",
    accent: "text-orange-700",
  },
  4: {
    medal: "",
    gradient: "from-sky-50/80 via-white to-blue-50/40",
    border: "border-sky-300/45",
    ring: "ring-sky-200/50",
    glow: "shadow-[0_4px_20px_rgba(56,189,248,0.1)]",
    hoverGlow: "hover:shadow-[0_8px_28px_rgba(56,189,248,0.16)]",
    badgeBg: "bg-gradient-to-r from-sky-500 to-blue-600",
    badgeText: "text-white",
    accent: "text-sky-700",
  },
  5: {
    medal: "",
    gradient: "from-violet-50/80 via-white to-purple-50/40",
    border: "border-violet-300/45",
    ring: "ring-violet-200/50",
    glow: "shadow-[0_4px_20px_rgba(139,92,246,0.1)]",
    hoverGlow: "hover:shadow-[0_8px_28px_rgba(139,92,246,0.16)]",
    badgeBg: "bg-gradient-to-r from-violet-500 to-purple-600",
    badgeText: "text-white",
    accent: "text-violet-700",
  },
};

export function getAdminMonitorTheme(position: number): AdminPositionLightTheme {
  return ADMIN_MONITOR_THEMES[position] ?? ADMIN_MONITOR_THEMES[5];
}

export function buildBoostMonitorSlots(
  listings: AdminFeaturedListingRow[],
  totalPositions: number
): AdminBoostMonitorSlot[] {
  const byPosition = new Map<number, AdminFeaturedListingRow>();

  for (const listing of listings) {
    if (listing.position >= 1 && listing.position <= totalPositions) {
      byPosition.set(listing.position, listing);
    }
  }

  return Array.from({ length: totalPositions }, (_, index) => ({
    position: index + 1,
    listing: byPosition.get(index + 1) ?? null,
  }));
}

export function getNextExpiration(
  listings: AdminFeaturedListingRow[]
): string | null {
  const timestamps = listings
    .map((row) => row.expiresAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((value) => value > Date.now());

  if (timestamps.length === 0) return null;

  return new Date(Math.min(...timestamps)).toISOString();
}

export function countAvailablePositions(
  slots: AdminBoostMonitorSlot[]
): number {
  return slots.filter((slot) => slot.listing === null).length;
}
