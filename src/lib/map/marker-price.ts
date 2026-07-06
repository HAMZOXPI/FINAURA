import type { PropertyStatus } from "@/types/database";
import type { Locale } from "@/i18n/config";

export function formatMarkerPrice(
  price: number,
  status: PropertyStatus,
  locale: Locale
): string {
  let compact: string;

  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    compact =
      millions % 1 === 0
        ? `${millions}M`
        : `${millions.toFixed(1).replace(/\.0$/, "")}M`;
  } else if (price >= 1_000) {
    const thousands = price / 1_000;
    compact =
      thousands % 1 === 0 ? `${thousands}K` : `${Math.round(thousands)}K`;
  } else {
    compact = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
      maximumFractionDigits: 0,
    }).format(price);
  }

  const base = `${compact} DH`;
  if (status === "for_rent") {
    const rentSuffix = locale === "ar" ? "/ش" : "/m";
    return `${base}${rentSuffix}`;
  }

  return base;
}

export function escapeMarkerHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
