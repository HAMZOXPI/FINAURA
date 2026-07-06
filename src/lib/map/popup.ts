import type { Property, PropertyStatus } from "@/types/database";
import type { Locale } from "@/i18n/config";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

function formatPopupPrice(price: number, status: PropertyStatus, locale: Locale): string {
  const num = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace(/\u00a0/g, " ");

  const base = `${num} DH`;
  const rentSuffix = locale === "ar" ? "/شهر" : "/mois";
  return status === "for_rent" ? `${base}${rentSuffix}` : base;
}

export function buildPropertyMapPopupHtml(
  property: Property,
  locale: Locale,
  labels: { viewProperty: string }
): string {
  const image = property.images[0] || PLACEHOLDER_IMAGE;
  const price = formatPopupPrice(property.price, property.status, locale);
  const href = `/properties/${property.id}`;

  return `
    <div class="finaura-map-popup">
      <img src="${image}" alt="${escapeHtml(property.title)}" class="finaura-map-popup__image" />
      <div class="finaura-map-popup__body">
        <p class="finaura-map-popup__price">${escapeHtml(price)}</p>
        <h3 class="finaura-map-popup__title">${escapeHtml(property.title)}</h3>
        <p class="finaura-map-popup__city">${escapeHtml(property.city)}</p>
        <a href="${href}" class="finaura-map-popup__button">${escapeHtml(labels.viewProperty)}</a>
      </div>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
