"use client";

import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import type { Property } from "@/types/database";
import { PropertyCard } from "@/components/properties/property-card";
import { PROPERTY_GRID_CLASS } from "@/components/properties/property-grid";
import { MotionSection, MotionStagger, MotionItem } from "@/components/home/motion-section";
import { PremiumSectionCrownIcon } from "@/components/home/premium-section-crown-icon";
import { PremiumBoostCtaCard } from "@/components/home/premium-boost-cta-card";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertiesGridSectionProps {
  title: string;
  subtitle: string;
  properties: Property[];
  emptyMessage: string;
  viewAllLabel: string;
  viewAllHref?: string;
  variant?: "light" | "muted";
  premiumIdentity?: boolean;
}

export function PropertiesGridSection({
  title,
  subtitle,
  properties,
  emptyMessage,
  viewAllLabel,
  viewAllHref = "/properties",
  variant = "light",
  premiumIdentity = false,
}: PropertiesGridSectionProps) {
  const { t } = useTranslation();
  const bg = variant === "muted" ? "bg-surface-50/80" : "bg-white";

  return (
    <section
      className={cn(
        "py-20 lg:py-28",
        premiumIdentity
          ? "relative bg-gradient-to-b from-amber-50/50 via-white to-white"
          : bg
      )}
    >
      {premiumIdentity && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
          aria-hidden
        />
      )}

      <div className="container-app">
        <MotionSection className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            {premiumIdentity ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/95 via-yellow-500/95 to-amber-600/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-950 shadow-[0_2px_12px_rgba(251,191,36,0.35)] ring-1 ring-amber-300/45">
                  <Crown className="h-3 w-3 fill-amber-900/25 text-amber-950" strokeWidth={2.25} />
                  {t.home.featuredBadge}
                </span>
                <div className="mt-4 flex items-center gap-5 sm:gap-6">
                  <PremiumSectionCrownIcon className="shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
                      {title}
                    </h2>
                    <p className="mt-4 text-lg text-surface-600">{subtitle}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
                  {title}
                </h2>
                <p className="mt-3 text-lg text-surface-500">{subtitle}</p>
              </>
            )}
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50 hover:shadow-md"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </MotionSection>

        {premiumIdentity && (
          <MotionSection delay={0.05} className="mt-10">
            <PremiumBoostCtaCard />
          </MotionSection>
        )}

        {properties.length === 0 ? (
          <MotionSection delay={0.1} className="mt-12">
            <div className="rounded-3xl border border-dashed border-surface-300 bg-white/60 px-8 py-16 text-center">
              <p className="text-surface-500">{emptyMessage}</p>
              <Link
                href="/properties"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
              >
                {viewAllLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </MotionSection>
        ) : (
          <MotionStagger className={cn(premiumIdentity ? "mt-10" : "mt-12", PROPERTY_GRID_CLASS)}>
            {properties.map((property, index) => (
              <MotionItem key={property.id}>
                <PropertyCard property={property} priority={index < 4} leadImage={index === 0} />
              </MotionItem>
            ))}
          </MotionStagger>
        )}
      </div>
    </section>
  );
}
