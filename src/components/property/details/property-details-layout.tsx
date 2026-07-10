"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Property, SellerPublicProfile } from "@/types/database";
import { BoostListingTrigger } from "@/components/boost/boost-listing-trigger";
import { SellerReviewsSection } from "@/components/seller/seller-reviews-section";
import { ContactSellerForm } from "@/components/properties/contact-seller-form";
import { PropertyActionBar } from "@/components/property/details/property-action-bar";
import { PropertyDescription } from "@/components/property/details/property-description";
import { PropertyFeatures } from "@/components/property/details/property-features";
import { PropertyGallery } from "@/components/property/details/property-gallery";
import { PropertyHero } from "@/components/property/details/property-hero";
import { PropertyHighlights } from "@/components/property/details/property-highlights";
import { PropertyMapSection } from "@/components/property/details/property-map-section";
import {
  PropertyMobileBottomBar,
  useMobileContactScroll,
} from "@/components/property/details/property-mobile-bottom-bar";
import { PropertyMortgageCard } from "@/components/property/details/property-mortgage-card";
import { PropertySellerCard } from "@/components/property/details/property-seller-card";
import { PropertySimilarListings } from "@/components/property/details/property-similar-listings";
import { PropertyStickySidebar } from "@/components/property/details/property-sticky-sidebar";
import { PropertyTrustSection } from "@/components/property/details/property-trust-section";
import { isPremiumProperty } from "@/lib/property/details-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyDetailsLayoutProps {
  property: Property;
  favorited: boolean;
  seller: SellerPublicProfile | null;
  similarProperties: Property[];
  statusLabel: string;
  typeLabel: string;
  featuredPosition?: number;
  defaultName?: string;
  defaultEmail?: string;
  isOwner: boolean;
}

export function PropertyDetailsLayout({
  property,
  favorited,
  seller,
  similarProperties,
  statusLabel,
  typeLabel,
  featuredPosition,
  defaultName = "",
  defaultEmail = "",
  isOwner,
}: PropertyDetailsLayoutProps) {
  const { t } = useTranslation();
  const premium = isPremiumProperty(property);
  const { scrollToContact } = useMobileContactScroll();
  const [showMobileContact, setShowMobileContact] = useState(false);
  const [showMobileSellerContact, setShowMobileSellerContact] = useState(false);

  const handleMobileContact = () => {
    setShowMobileContact(true);
    scrollToContact();
    const el = document.getElementById("contact-seller-mobile");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div
        className={cn(
          "container-app py-8 pb-28 lg:py-10 lg:pb-10",
          premium && "relative"
        )}
      >
        {premium && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(251,191,36,0.08),transparent_70%)]"
            aria-hidden
          />
        )}

        <Link
          href="/properties"
          className="relative mb-6 inline-flex items-center gap-2 text-sm font-medium text-surface-500 transition-colors duration-[250ms] hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.properties.backToList}
        </Link>

        {isOwner && (
          <div className="relative mb-6 flex flex-wrap items-center justify-end gap-2">
            <BoostListingTrigger
              listingId={property.id}
              listingTitle={property.title}
              size="md"
              className="w-full md:w-auto md:max-w-[min(100%,260px)] lg:max-w-[280px]"
            />
            <Link
              href={`/dashboard/${property.id}/edit`}
              className="inline-flex h-11 items-center rounded-xl border border-surface-200 bg-white px-4 text-sm font-semibold text-surface-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2"
            >
              {t.dashboard.edit}
            </Link>
          </div>
        )}

        <div className="relative">
          <PropertyGallery
            images={property.images}
            title={property.title}
            isPremium={premium}
          />
        </div>

        <div className="relative mt-8 grid gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="min-w-0 space-y-10 lg:col-span-2">
            <PropertyHero
              property={property}
              statusLabel={statusLabel}
              featuredPosition={featuredPosition}
            />

            <PropertyActionBar
              propertyId={property.id}
              propertyTitle={property.title}
              favorited={favorited}
            />

            <PropertyHighlights property={property} typeLabel={typeLabel} />

            <PropertyDescription description={property.description} />

            <PropertyFeatures property={property} />

            <PropertySimilarListings properties={similarProperties} />

            <PropertyMapSection property={property} />

            <PropertyTrustSection property={property} seller={seller} />

            {seller && (
              <div className="lg:hidden">
                <h3 className="mb-4 text-lg font-bold text-surface-900">{t.properties.listedBy}</h3>
                <PropertySellerCard
                  seller={seller}
                  onContactSeller={() => setShowMobileSellerContact(true)}
                  isPremiumListing={premium}
                />
              </div>
            )}

            <div className="lg:hidden">
              <PropertyMortgageCard property={property} />
            </div>

            {(showMobileContact || showMobileSellerContact || !seller) && (
              <div
                id="contact-seller-mobile"
                className="rounded-[24px] border border-surface-200/80 bg-white p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] lg:hidden"
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

            {seller && (
              <SellerReviewsSection seller={seller} propertyId={property.id} />
            )}
          </div>

          <PropertyStickySidebar
            property={property}
            propertyTitle={property.title}
            statusLabel={statusLabel}
            seller={seller}
            favorited={favorited}
            defaultName={defaultName}
            defaultEmail={defaultEmail}
          />
        </div>
      </div>

      <PropertyMobileBottomBar
        property={property}
        propertyTitle={property.title}
        favorited={favorited}
        onContact={handleMobileContact}
      />
    </>
  );
}
