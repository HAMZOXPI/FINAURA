"use client";

import { useState } from "react";
import { PricingBillingToggle } from "@/components/pricing/pricing-billing-toggle";
import { PricingBottomCta } from "@/components/pricing/pricing-bottom-cta";
import { PricingComparisonTable } from "@/components/pricing/pricing-comparison-table";
import { PricingCurrentPlanBanner } from "@/components/pricing/pricing-current-plan-banner";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { PricingPlanCards } from "@/components/pricing/pricing-plan-cards";
import { PricingTestimonials } from "@/components/pricing/pricing-testimonials";
import { PricingTrustSection } from "@/components/pricing/pricing-trust-section";
import { PricingUpgradeRecommendation } from "@/components/pricing/pricing-upgrade-recommendation";
import { PricingWhyUpgrade } from "@/components/pricing/pricing-why-upgrade";
import type { BillingInterval } from "@/lib/pricing/pricing-display";
import type { SubscriptionPlan } from "@/types/database";

interface PricingExperienceProps {
  plans: SubscriptionPlan[];
  currentPlanSlug: string | null;
}

export function PricingExperience({ plans, currentPlanSlug }: PricingExperienceProps) {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");

  return (
    <div className="overflow-x-hidden">
      <PricingHero />

      <section className="container-app pb-14 sm:pb-20 lg:pb-24">
        <div className="mb-8 flex justify-center sm:mb-10">
          <PricingBillingToggle interval={billingInterval} onChange={setBillingInterval} />
        </div>

        <PricingCurrentPlanBanner plans={plans} currentPlanSlug={currentPlanSlug} />

        <PricingUpgradeRecommendation
          plans={plans}
          currentPlanSlug={currentPlanSlug}
        />

        <PricingPlanCards
          plans={plans}
          currentPlanSlug={currentPlanSlug}
          billingInterval={billingInterval}
        />
      </section>

      <PricingComparisonTable plans={plans} currentPlanSlug={currentPlanSlug} />
      <PricingWhyUpgrade />
      <PricingTestimonials />
      <PricingTrustSection />
      <PricingFaq />
      <PricingBottomCta />
    </div>
  );
}
