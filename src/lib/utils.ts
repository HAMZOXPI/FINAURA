import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/i18n/config";
import type { PropertyStatus, PropertyType } from "@/types/database";
import type { Dictionary } from "@/i18n/get-dictionary";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number,
  status?: PropertyStatus | string,
  locale: Locale = "fr"
): string {
  const num = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace(/\u00a0/g, " ");

  const currency = locale === "ar" ? "درهم" : "MAD";
  const formatted = `${num} ${currency}`;
  const rentSuffix = locale === "ar" ? "/شهر" : "/mois";
  return status === "for_rent" ? `${formatted}${rentSuffix}` : formatted;
}

export function formatPlanPrice(price: number, locale: Locale = "fr"): string {
  if (price === 0) return locale === "ar" ? "0 درهم" : "0 MAD";
  return formatPrice(price, undefined, locale);
}

export function formatArea(area: number, locale: Locale = "fr"): string {
  const num = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA").format(area);
  return `${num} m²`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(dateString: string, locale: Locale = "fr"): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function formatMessageTime(dateString: string, locale: Locale = "fr"): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function formatRelativeTime(dateString: string, locale: Locale = "fr"): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return locale === "ar" ? "الآن" : "À l'instant";
  if (diffMins < 60) return locale === "ar" ? `${diffMins} د` : `${diffMins} min`;
  if (diffHours < 24) return locale === "ar" ? `${diffHours} س` : `${diffHours} h`;
  if (diffDays < 7) return locale === "ar" ? `${diffDays} ي` : `${diffDays} j`;

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getPropertyTypeLabel(
  type: PropertyType,
  dict: Dictionary
): string {
  return dict.propertyTypes[type] ?? type;
}

export function getPropertyStatusLabel(
  status: PropertyStatus,
  dict: Dictionary
): string {
  return dict.propertyStatus[status] ?? status;
}

export function getListingStatusLabel(
  status: "draft" | "published" | "archived",
  dict: Dictionary
): string {
  return dict.listingStatus[status] ?? status;
}

export function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}
