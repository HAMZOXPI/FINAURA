import type {
  AdminGift,
  AdminGiftPaymentSource,
  AdminGiftStatus,
  AdminGiftType,
} from "@/types/database";

/** Gift types shown in the admin promotions UI (legacy types remain in DB). */
export const PROMOTION_UI_GIFT_TYPES: AdminGiftType[] = [
  "extra_listing_credits",
  "unlimited_listings",
  "premium_subscription",
  "premium_extension",
  "featured_listing_credits",
  "boost_credits",
  "custom_gift",
];

export const ADMIN_GIFT_TYPES: AdminGiftType[] = [
  ...PROMOTION_UI_GIFT_TYPES,
  "discount_coupon",
];

export const PAYMENT_SOURCES: AdminGiftPaymentSource[] = [
  "gift",
  "cash",
  "bank_transfer",
  "admin_compensation",
  "promotion",
  "support",
  "other",
];

export const GIFT_TYPE_CONFIG: Record<
  AdminGiftType,
  {
    needsQuantity: boolean;
    needsDuration: boolean;
    quantityLabel?: "credits" | "percent" | "days";
    defaultQuantity?: number;
    optionalDuration?: boolean;
  }
> = {
  unlimited_listings: { needsQuantity: false, needsDuration: true },
  extra_listing_credits: {
    needsQuantity: true,
    needsDuration: true,
    quantityLabel: "credits",
    defaultQuantity: 1,
  },
  premium_subscription: { needsQuantity: false, needsDuration: true },
  premium_extension: {
    needsQuantity: false,
    needsDuration: true,
    quantityLabel: "days",
  },
  featured_listing_credits: {
    needsQuantity: true,
    needsDuration: true,
    quantityLabel: "credits",
    defaultQuantity: 1,
  },
  boost_credits: {
    needsQuantity: true,
    needsDuration: true,
    quantityLabel: "credits",
    defaultQuantity: 1,
  },
  custom_gift: { needsQuantity: false, needsDuration: false, optionalDuration: true },
  discount_coupon: {
    needsQuantity: true,
    needsDuration: true,
    quantityLabel: "percent",
    defaultQuantity: 10,
  },
};

export function resolveAdminGiftPaymentSource(
  gift: Pick<AdminGift, "payment_source" | "metadata"> | {
    payment_source?: AdminGiftPaymentSource | null;
    metadata?: Record<string, unknown>;
  }
): AdminGiftPaymentSource {
  const fromMetadata = gift.metadata?.payment_source;
  if (typeof fromMetadata === "string") {
    return fromMetadata as AdminGiftPaymentSource;
  }
  return gift.payment_source ?? "gift";
}

export function resolveEffectiveGiftStatus(
  status: AdminGiftStatus,
  expiresAt: string | null
): AdminGiftStatus {
  if (status !== "active") return status;
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) return "expired";
  return "active";
}

export function isPremiumGiftType(giftType: AdminGiftType): boolean {
  return giftType === "premium_subscription" || giftType === "premium_extension";
}

export function generateCouponCode(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FINAURA-${suffix}`;
}
