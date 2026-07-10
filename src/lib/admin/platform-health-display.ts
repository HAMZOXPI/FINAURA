export type PlatformHealthState =
  | "healthy"
  | "operational"
  | "warning"
  | "offline"
  | "unavailable";

export const HEALTH_STATE_STYLES: Record<
  PlatformHealthState,
  { dot: string; badge: string; text: string }
> = {
  healthy: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    text: "text-emerald-700",
  },
  operational: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    text: "text-emerald-700",
  },
  warning: {
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 ring-orange-200/80",
    text: "text-orange-700",
  },
  offline: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 ring-red-200/80",
    text: "text-red-700",
  },
  unavailable: {
    dot: "bg-surface-400",
    badge: "bg-surface-100 text-surface-600 ring-surface-200/80",
    text: "text-surface-500",
  },
};

export function hasPlatformDataLoaded(
  stats: { totalUsers: number } | null | undefined
): boolean {
  return stats !== null && stats !== undefined;
}
