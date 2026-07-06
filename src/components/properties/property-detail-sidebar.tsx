"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import type { SellerPublicProfile } from "@/types/database";
import { ContactSellerForm } from "@/components/properties/contact-seller-form";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { PropertyCardShareButton } from "@/components/properties/property-card-share-button";
import { SellerCard } from "@/components/seller/seller-card";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyDetailSidebarProps {
  propertyId: string;
  propertyTitle: string;
  seller: SellerPublicProfile | null;
  favorited: boolean;
  defaultName?: string;
  defaultEmail?: string;
}

export function PropertyDetailSidebar({
  propertyId,
  propertyTitle,
  seller,
  favorited,
  defaultName = "",
  defaultEmail = "",
}: PropertyDetailSidebarProps) {
  const { t } = useTranslation();
  const [showContact, setShowContact] = useState(false);

  const whatsappPhone = seller?.profile.phone?.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    `${t.propertyDetail.whatsappMessage} ${propertyTitle}`
  );
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${whatsappMessage}`
    : null;

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      {seller && (
        <>
          <div>
            <h3 className="mb-4 text-lg font-bold text-surface-900">{t.properties.listedBy}</h3>
            <SellerCard
              seller={seller}
              onContactSeller={() => setShowContact(true)}
            />
          </div>

          <div className="rounded-[20px] border border-surface-200/80 bg-white p-6 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-2 gap-2">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 transition-colors duration-[250ms] hover:bg-emerald-100"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t.propertyDetail.whatsapp}
                </a>
              )}
              <FavoriteButton
                propertyId={propertyId}
                initialFavorited={favorited}
                variant="compact"
                className="w-full"
              />
              <PropertyCardShareButton
                propertyId={propertyId}
                title={propertyTitle}
                className="w-full"
              />
            </div>
          </div>
        </>
      )}

      {(showContact || !seller) && (
        <div
          id="contact-seller"
          className="rounded-[20px] border border-surface-200/80 bg-white p-6 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]"
        >
          <h3 className="text-lg font-bold text-surface-900">{t.properties.contactSeller}</h3>
          <div className="mt-4">
            <ContactSellerForm
              propertyId={propertyId}
              defaultName={defaultName}
              defaultEmail={defaultEmail}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
