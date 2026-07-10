"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import type { Property, SellerPublicProfile } from "@/types/database";
import { ContactSellerForm } from "@/components/properties/contact-seller-form";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { PropertyCardShareButton } from "@/components/properties/property-card-share-button";
import { PropertyMortgageCard } from "@/components/property/details/property-mortgage-card";
import { PropertyPriceCard } from "@/components/property/details/property-price-card";
import { PropertySellerCard } from "@/components/property/details/property-seller-card";
import { isPremiumProperty } from "@/lib/property/details-display";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyStickySidebarProps {
  property: Property;
  propertyTitle: string;
  statusLabel: string;
  seller: SellerPublicProfile | null;
  favorited: boolean;
  defaultName?: string;
  defaultEmail?: string;
}

export function PropertyStickySidebar({
  property,
  propertyTitle,
  statusLabel,
  seller,
  favorited,
  defaultName = "",
  defaultEmail = "",
}: PropertyStickySidebarProps) {
  const { t } = useTranslation();
  const [showContact, setShowContact] = useState(false);
  const premium = isPremiumProperty(property);

  const whatsappPhone = seller?.profile.phone?.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    `${t.propertyDetail.whatsappMessage} ${propertyTitle}`
  );
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${whatsappMessage}`
    : null;

  return (
    <aside className="hidden space-y-6 lg:block lg:sticky lg:top-24 lg:self-start">
      <PropertyPriceCard property={property} statusLabel={statusLabel} />

      {seller && (
        <>
          <PropertySellerCard
            seller={seller}
            onContactSeller={() => setShowContact(true)}
            isPremiumListing={premium}
          />

          <div className="rounded-[24px] border border-surface-200/80 bg-white p-5 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-surface-500">
              {t.propertyDetail.quickActions}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 transition-colors duration-[250ms] hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  {t.propertyDetail.whatsapp}
                </a>
              )}
              <FavoriteButton
                propertyId={property.id}
                initialFavorited={favorited}
                variant="compact"
                className="w-full"
              />
              <PropertyCardShareButton
                propertyId={property.id}
                title={propertyTitle}
                className="w-full"
              />
            </div>
          </div>
        </>
      )}

      <PropertyMortgageCard property={property} />

      {(showContact || !seller) && (
        <div
          id="contact-seller"
          className="rounded-[24px] border border-surface-200/80 bg-white p-6 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.1)]"
        >
          <h3 className="text-lg font-bold text-surface-900">{t.properties.contactSeller}</h3>
          <div className="mt-4">
            <ContactSellerForm
              propertyId={property.id}
              defaultName={defaultName}
              defaultEmail={defaultEmail}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
