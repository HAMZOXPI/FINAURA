"use client";

import { MessageCircle } from "lucide-react";
import type { Property, SellerPublicProfile } from "@/types/database";
import { SellerAboutCard } from "@/components/seller/profile/seller-about-card";
import { SellerAchievements } from "@/components/seller/profile/seller-achievements";
import { SellerCompletenessCard } from "@/components/seller/profile/seller-completeness-card";
import { SellerContactCard } from "@/components/seller/profile/seller-contact-card";
import { SellerListingsCarousel } from "@/components/seller/profile/seller-listings-carousel";
import { SellerPerformanceCard } from "@/components/seller/profile/seller-performance-card";
import { SellerProfileActions } from "@/components/seller/profile/seller-profile-actions";
import { SellerProfileHero } from "@/components/seller/profile/seller-profile-hero";
import { SellerProfileReviews } from "@/components/seller/profile/seller-profile-reviews";
import { SellerProfileStats } from "@/components/seller/profile/seller-profile-stats";
import { SellerSimilarSellers } from "@/components/seller/profile/seller-similar-sellers";
import { SellerTimeline } from "@/components/seller/profile/seller-timeline";
import { SellerTrustScore } from "@/components/seller/profile/seller-trust-score";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerProfileLayoutProps {
  seller: SellerPublicProfile;
  listings: Property[];
}

export function SellerProfileLayout({ seller, listings }: SellerProfileLayoutProps) {
  const { t } = useTranslation();

  const scrollToListings = () => {
    const el = document.getElementById("active-listings-heading");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToContact = () => {
    scrollToListings();
  };

  return (
    <>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,105,198,0.07),transparent_65%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute start-[10%] top-[20%] h-72 w-72 rounded-full bg-brand-300/10 blur-[90px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute end-[5%] top-[40%] h-64 w-64 rounded-full bg-amber-200/12 blur-[80px]"
          aria-hidden
        />

        <div className="container-app relative py-8 pb-28 lg:py-12 lg:pb-12">
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
            <div className="min-w-0 space-y-10 lg:col-span-2">
              <SellerProfileHero seller={seller} listings={listings} />
              <SellerProfileActions
                sellerId={seller.profile.id}
                initialFavorited={seller.isFavorite}
                onContact={scrollToContact}
              />
              <SellerProfileStats seller={seller} />
              <SellerTrustScore seller={seller} listings={listings} />
              <SellerAchievements seller={seller} listings={listings} />
              <SellerAboutCard seller={seller} />
              <SellerListingsCarousel listings={listings} />
              <SellerPerformanceCard seller={seller} listings={listings} />
              <SellerTimeline seller={seller} listings={listings} />
              <SellerProfileReviews seller={seller} />
              <SellerSimilarSellers />
            </div>

            <div className="hidden space-y-6 lg:block">
              <SellerContactCard
                seller={seller}
                listings={listings}
                onContact={scrollToContact}
              />
              <SellerCompletenessCard seller={seller} />
            </div>
          </div>

          <div className="mt-10 space-y-6 lg:hidden">
            <SellerCompletenessCard seller={seller} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToContact}
        className="fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_8px_32px_-6px_rgba(0,105,198,0.55)] transition-all duration-[250ms] hover:scale-105 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2 lg:hidden"
        aria-label={t.seller.contactSeller}
      >
        <MessageCircle className="h-6 w-6" aria-hidden />
      </button>
    </>
  );
}
