import type { Locale } from "@/i18n/config";
import { ar } from "@/i18n/dictionaries/ar";
import { fr } from "@/i18n/dictionaries/fr";

const dictionaries = { fr, ar } as const;

export type Dictionary = typeof fr;

export function getDictionary(locale: Locale): Dictionary {
  return (dictionaries[locale] ?? dictionaries.fr) as Dictionary;
}
