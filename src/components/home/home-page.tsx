"use client";

import type { Property } from "@/types/database";
import { useTranslation } from "@/i18n/locale-provider";
import { HeroSection } from "@/components/home/hero-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { LatestListingsSection } from "@/components/home/latest-listings-section";
import { PropertiesGridSection } from "@/components/home/properties-grid-section";
import { WhySection } from "@/components/home/why-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { ZeroCommissionSection } from "@/components/home/zero-commission-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CtaSection } from "@/components/home/cta-section";

interface HomePageProps {
  featured: Property[];
  latest: Property[];
}

export function HomePage({ featured, latest }: HomePageProps) {
  const { t } = useTranslation();

  const featuredList =
    featured.length > 0 ? featured : latest.slice(0, 6);

  return (
    <>
      <HeroSection />

      <div className="pt-16 lg:pt-20">
        <CategoriesSection />

        <PropertiesGridSection
          title={t.home.featuredTitle}
          subtitle={t.home.featuredSubtitle}
          properties={featuredList}
          emptyMessage={t.home.emptyFeatured}
          viewAllLabel={t.home.exploreAll}
          variant="light"
          premiumIdentity
        />

        <LatestListingsSection properties={latest} />

        <WhySection />
        <HowItWorksSection />
        <ZeroCommissionSection />
        <TestimonialsSection />
        <CtaSection />
      </div>
    </>
  );
}
