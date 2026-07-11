/**
 * Shared `layoutId` builders used to morph a property card into the
 * property details page (and back) via Framer Motion's shared-element
 * layout animations. Keeping these in one place guarantees the card and
 * the details page always agree on the exact same id for a given property.
 */
export function propertyPhotoLayoutId(propertyId: string): string {
  return `property-photo-${propertyId}`;
}

export function propertyTitleLayoutId(propertyId: string): string {
  return `property-title-${propertyId}`;
}

/**
 * Shared duration for every layoutId-driven shared-element animation (card
 * <-> details page). Framer Motion's default `layout` transition is a
 * spring, which can feel bouncy for a "morph into the same object" effect —
 * a fixed duration with a premium ease curve reads as more deliberate and
 * native, and keeps every shared element (image, title, ...) in perfect
 * sync. Pass this alongside an inline `ease: [0.22, 1, 0.36, 1]` at each
 * usage site so TypeScript can correctly narrow the easing tuple.
 */
export const SHARED_ELEMENT_DURATION = 0.32;
