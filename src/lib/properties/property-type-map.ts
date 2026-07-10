import type { PropertyType } from "@/types/database";

/**
 * The `properties.property_type` column's CHECK constraint
 * (`properties_property_type_check`) only accepts these exact values.
 * This must stay in sync with the live Supabase constraint — if it ever
 * changes, update this list instead of touching the database.
 */
export type DbPropertyType = "house" | "apartment" | "condo" | "townhouse" | "land";

export const DB_PROPERTY_TYPE_VALUES: DbPropertyType[] = [
  "house",
  "apartment",
  "condo",
  "townhouse",
  "land",
];

/**
 * Maps every UI-facing (Moroccan) property type option to the value
 * accepted by the database constraint.
 *
 * `null` means there is no equivalent database category for that UI
 * option yet — submissions with this type must be rejected with a
 * validation error before the insert/update instead of being written
 * with an incorrect, guessed category.
 */
const PROPERTY_TYPE_TO_DB: Record<PropertyType, DbPropertyType | null> = {
  appartement: "apartment",
  maison: "house",
  villa: "house", // standalone/detached house
  riad: "house", // traditional multi-story Moroccan house
  terrain: "land",
  ferme: "land", // agricultural / rural land
  local_commercial: null, // no commercial category exists in the DB constraint
  bureau: null, // no office category exists in the DB constraint
};

/**
 * Converts a UI property type value into the exact string accepted by
 * `properties_property_type_check`. Returns `null` if the UI type has no
 * supported database equivalent — callers must reject the submission
 * with a validation error in that case rather than sending it to Supabase.
 */
export function mapPropertyTypeToDb(type: string | null | undefined): DbPropertyType | null {
  if (!type) return null;
  return PROPERTY_TYPE_TO_DB[type as PropertyType] ?? null;
}
