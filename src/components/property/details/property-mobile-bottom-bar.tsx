"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import type { Property } from "@/types/database";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { PropertyCardShareButton } from "@/components/properties/property-card-share-button";
import { formatDetailPrice } from "@/lib/property/details-display";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyMobileBottomBarProps {
  property: Property;
  propertyTitle: string;
  favorited: boolean;
  onContact: () => void;
}

export function PropertyMobileBottomBar({
  property,
  propertyTitle,
  favorited,
  onContact,
}: PropertyMobileBottomBarProps) {
  const { t, locale } = useTranslation();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-surface-200/80 bg-white/90 px-4 py-3 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.12)] backdrop-blur-lg lg:hidden"
      role="region"
      aria-label={t.propertyDetail.mobileBarLabel}
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-lg font-bold text-surface-900"
            dir={locale === "ar" ? "ltr" : undefined}
          >
            <span className="[unicode-bidi:isolate]">
              {formatDetailPrice(property.price, property.status, locale)}
            </span>
          </p>
        </div>

        <FavoriteButton
          propertyId={property.id}
          initialFavorited={favorited}
          variant="compact"
        />

        <PropertyCardShareButton propertyId={property.id} title={propertyTitle} />

        <button
          type="button"
          onClick={onContact}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(0,105,198,0.45)] transition-all duration-[250ms] hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          <span className="sm:inline">{t.properties.contactSeller}</span>
        </button>
      </div>
    </div>
  );
}

/** Hook helper for mobile contact scroll */
export function useMobileContactScroll() {
  const [contactRequested, setContactRequested] = useState(false);

  const scrollToContact = () => {
    setContactRequested(true);
    const el = document.getElementById("contact-seller");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return { contactRequested, scrollToContact, setContactRequested };
}
