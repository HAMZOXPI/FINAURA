/** UI-only metadata for premium property display (not persisted in DB). */
export interface PremiumDisplayMeta {
  /** Homepage boost position (1–5). Position #1 shows an extra badge. */
  homepagePosition?: number;
  /** Future: sponsored, verified, luxury, developer */
  variant?: "premium" | "sponsored" | "verified" | "luxury" | "developer";
}

export type FeaturedProperty = import("@/types/database").Property & {
  featured_position?: number;
};

export function resolvePremiumMeta(
  property: import("@/types/database").Property,
  meta?: PremiumDisplayMeta
): PremiumDisplayMeta | undefined {
  if (!property.is_featured && !meta) return undefined;

  const featured = property as FeaturedProperty;
  const homepagePosition = meta?.homepagePosition ?? featured.featured_position;

  return {
    variant: meta?.variant ?? "premium",
    homepagePosition,
  };
}
