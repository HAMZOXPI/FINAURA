import type { LucideIcon } from "lucide-react";
import {
  Gem,
  Gift,
  Infinity,
  ListPlus,
  Rocket,
  Sparkles,
  Star,
} from "lucide-react";
import type { Notification, NotificationType } from "@/types/database";

export const CELEBRATION_SEEN_KEY = "finaura-gift-celebrations-seen";
export const CELEBRATION_BANNER_KEY = "finaura-gift-banner";
export const CELEBRATION_EVENT = "finaura-celebration";

export const CELEBRATION_NOTIFICATION_TYPES: NotificationType[] = [
  "gift_granted",
  "premium_activated",
  "subscription_changed",
  "subscription_renewed",
];

export type CelebrationKind =
  | "premium"
  | "unlimited"
  | "credits"
  | "featured"
  | "boost"
  | "custom"
  | "generic"
  | "subscription";

export interface GiftCelebrationConfig {
  kind: CelebrationKind;
  giftName: string;
  duration: string | null;
  expirationDate: string | null;
  Icon: LucideIcon;
  gradient: string;
  iconColor: string;
  glowClass: string;
  cardGradient: string;
  ctaHref: string;
  ctaKey: "startUsing" | "viewDashboard";
  bannerKey: "premiumActive" | "unlimitedActive" | null;
}

const GIFT_LABEL_MAP: Record<string, Partial<GiftCelebrationConfig>> = {
  unlimited_listings: {
    kind: "unlimited",
    Icon: Infinity,
    gradient: "from-violet-400/30 to-indigo-500/20",
    iconColor: "text-violet-300",
    glowClass: "shadow-[0_0_60px_rgba(139,92,246,0.5)]",
    cardGradient: "from-violet-600/20 via-indigo-600/10 to-surface-900",
    ctaHref: "/dashboard/new",
    ctaKey: "startUsing",
    bannerKey: "unlimitedActive",
  },
  extra_listing_credits: {
    kind: "credits",
    Icon: ListPlus,
    gradient: "from-sky-400/30 to-blue-500/20",
    iconColor: "text-sky-300",
    glowClass: "shadow-[0_0_60px_rgba(59,130,246,0.45)]",
    cardGradient: "from-sky-600/20 via-blue-600/10 to-surface-900",
    ctaHref: "/dashboard/new",
    ctaKey: "startUsing",
    bannerKey: null,
  },
  premium_subscription: {
    kind: "premium",
    Icon: Star,
    gradient: "from-amber-400/30 to-orange-500/20",
    iconColor: "text-amber-300",
    glowClass: "shadow-[0_0_60px_rgba(245,158,11,0.5)]",
    cardGradient: "from-amber-600/25 via-orange-600/10 to-surface-900",
    ctaHref: "/dashboard/settings",
    ctaKey: "startUsing",
    bannerKey: "premiumActive",
  },
  premium_extension: {
    kind: "premium",
    Icon: Star,
    gradient: "from-amber-400/30 to-yellow-500/20",
    iconColor: "text-amber-300",
    glowClass: "shadow-[0_0_60px_rgba(245,158,11,0.5)]",
    cardGradient: "from-amber-600/25 via-yellow-600/10 to-surface-900",
    ctaHref: "/dashboard/settings",
    ctaKey: "startUsing",
    bannerKey: "premiumActive",
  },
  featured_listing_credits: {
    kind: "featured",
    Icon: Sparkles,
    gradient: "from-fuchsia-400/30 to-pink-500/20",
    iconColor: "text-fuchsia-300",
    glowClass: "shadow-[0_0_60px_rgba(217,70,239,0.45)]",
    cardGradient: "from-fuchsia-600/20 via-pink-600/10 to-surface-900",
    ctaHref: "/dashboard/properties",
    ctaKey: "startUsing",
    bannerKey: null,
  },
  boost_credits: {
    kind: "boost",
    Icon: Rocket,
    gradient: "from-orange-400/30 to-red-500/20",
    iconColor: "text-orange-300",
    glowClass: "shadow-[0_0_60px_rgba(249,115,22,0.45)]",
    cardGradient: "from-orange-600/20 via-red-600/10 to-surface-900",
    ctaHref: "/dashboard/properties",
    ctaKey: "startUsing",
    bannerKey: null,
  },
  custom_gift: {
    kind: "custom",
    Icon: Gem,
    gradient: "from-emerald-400/30 to-teal-500/20",
    iconColor: "text-emerald-300",
    glowClass: "shadow-[0_0_60px_rgba(16,185,129,0.45)]",
    cardGradient: "from-emerald-600/20 via-teal-600/10 to-surface-900",
    ctaHref: "/dashboard/settings",
    ctaKey: "startUsing",
    bannerKey: null,
  },
};

const PREMIUM_DEFAULT: Omit<GiftCelebrationConfig, "giftName" | "duration" | "expirationDate"> = {
  kind: "premium",
  Icon: Star,
  gradient: "from-amber-400/30 to-orange-500/20",
  iconColor: "text-amber-300",
  glowClass: "shadow-[0_0_60px_rgba(245,158,11,0.5)]",
  cardGradient: "from-amber-600/25 via-orange-600/10 to-surface-900",
  ctaHref: "/dashboard/settings",
  ctaKey: "startUsing",
  bannerKey: "premiumActive",
};

const SUBSCRIPTION_DEFAULT: Omit<GiftCelebrationConfig, "giftName" | "duration" | "expirationDate"> = {
  kind: "subscription",
  Icon: Sparkles,
  gradient: "from-brand-400/30 to-violet-500/20",
  iconColor: "text-brand-300",
  glowClass: "shadow-[0_0_60px_rgba(99,102,241,0.45)]",
  cardGradient: "from-brand-600/25 via-violet-600/10 to-surface-900",
  ctaHref: "/dashboard",
  ctaKey: "viewDashboard",
  bannerKey: null,
};

const GENERIC_DEFAULT: Omit<GiftCelebrationConfig, "giftName" | "duration" | "expirationDate"> = {
  kind: "generic",
  Icon: Gift,
  gradient: "from-brand-400/30 to-violet-500/20",
  iconColor: "text-brand-300",
  glowClass: "shadow-[0_0_60px_rgba(99,102,241,0.45)]",
  cardGradient: "from-brand-600/20 via-violet-600/10 to-surface-900",
  ctaHref: "/dashboard",
  ctaKey: "viewDashboard",
  bannerKey: null,
};

function normalizeGiftKey(label: string): string {
  return label.toLowerCase().trim().replace(/\s+/g, "_");
}

function readMetaString(metadata: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function parseDuration(notification: Notification): string | null {
  const meta = notification.metadata ?? {};
  const days =
    readMetaString(meta, ["durationDays", "duration_days", "days"]) ??
    extractFromBody(notification.body, /(\d+)\s*(?:jours?|days?)/i);
  if (days) return `${days}`;
  return null;
}

function parseExpiration(notification: Notification): string | null {
  const meta = notification.metadata ?? {};
  const raw =
    readMetaString(meta, ["expiresAt", "expires_at", "expiration", "premiumExpiresAt"]) ??
    extractFromBody(notification.body, /(\d{4}-\d{2}-\d{2})/);
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function extractFromBody(body: string, pattern: RegExp): string | null {
  const match = body.match(pattern);
  return match?.[1] ?? null;
}

function formatGiftDisplayName(label: string): string {
  const cleaned = label
    .replace(/^vous avez reçu un cadeau\s*:?\s*/i, "")
    .replace(/^.*:\s*/i, "")
    .trim();
  if (!cleaned) return "Gift";
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function isCelebrationNotification(notification: Notification): boolean {
  return CELEBRATION_NOTIFICATION_TYPES.includes(notification.notification_type);
}

export function resolveCelebrationConfig(notification: Notification): GiftCelebrationConfig {
  const duration = parseDuration(notification);
  const expirationDate = parseExpiration(notification);

  if (notification.notification_type === "premium_activated") {
    const planName =
      typeof notification.metadata?.planName === "string"
        ? notification.metadata.planName
        : notification.title.replace(/premium/i, "").trim() || "Premium";
    return {
      ...PREMIUM_DEFAULT,
      giftName: planName || "Premium",
      duration,
      expirationDate,
    };
  }

  if (
    notification.notification_type === "subscription_changed" ||
    notification.notification_type === "subscription_renewed"
  ) {
    const planName =
      typeof notification.metadata?.planName === "string"
        ? notification.metadata.planName
        : notification.title;
    return {
      ...SUBSCRIPTION_DEFAULT,
      giftName: planName,
      duration,
      expirationDate,
    };
  }

  const giftLabel =
    typeof notification.metadata?.giftLabel === "string"
      ? notification.metadata.giftLabel
      : notification.body;

  const key = normalizeGiftKey(giftLabel);
  const mapped = GIFT_LABEL_MAP[key];

  if (mapped) {
    return {
      ...GENERIC_DEFAULT,
      ...mapped,
      giftName: formatGiftDisplayName(giftLabel),
      duration,
      expirationDate,
    } as GiftCelebrationConfig;
  }

  return {
    ...GENERIC_DEFAULT,
    giftName: formatGiftDisplayName(giftLabel) || notification.title,
    duration,
    expirationDate,
  };
}

export function loadSeenCelebrationIds(): string[] {
  try {
    const raw = localStorage.getItem(CELEBRATION_SEEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markCelebrationSeen(notificationId: string) {
  try {
    const seen = loadSeenCelebrationIds();
    if (!seen.includes(notificationId)) {
      localStorage.setItem(
        CELEBRATION_SEEN_KEY,
        JSON.stringify([...seen, notificationId].slice(-200))
      );
    }
  } catch {
    /* ignore */
  }
}

export function hasSeenCelebration(notificationId: string): boolean {
  return loadSeenCelebrationIds().includes(notificationId);
}

export interface ActiveGiftBanner {
  kind: CelebrationKind;
  bannerKey: "premiumActive" | "unlimitedActive";
  notificationId: string;
}

export function saveActiveBanner(banner: ActiveGiftBanner) {
  try {
    sessionStorage.setItem(CELEBRATION_BANNER_KEY, JSON.stringify(banner));
  } catch {
    /* ignore */
  }
}

export function loadActiveBanner(): ActiveGiftBanner | null {
  try {
    const raw = sessionStorage.getItem(CELEBRATION_BANNER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearActiveBanner() {
  try {
    sessionStorage.removeItem(CELEBRATION_BANNER_KEY);
  } catch {
    /* ignore */
  }
}

let lastGiftGrantedAt = 0;

export function shouldSkipPremiumCelebration(notification: Notification): boolean {
  if (notification.notification_type !== "premium_activated") return false;
  return Date.now() - lastGiftGrantedAt < 4000;
}

export function markGiftGrantedCelebration() {
  lastGiftGrantedAt = Date.now();
}
