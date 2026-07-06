"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Property } from "@/types/database";
import { PropertyCard } from "@/components/properties/property-card";
import { PROPERTY_GRID_CLASS } from "@/components/properties/property-grid";
import { MotionSection, MotionStagger, MotionItem } from "@/components/home/motion-section";
import { cn } from "@/lib/utils";

interface PropertiesGridSectionProps {
  title: string;
  subtitle: string;
  properties: Property[];
  emptyMessage: string;
  viewAllLabel: string;
  viewAllHref?: string;
  variant?: "light" | "muted";
}

export function PropertiesGridSection({
  title,
  subtitle,
  properties,
  emptyMessage,
  viewAllLabel,
  viewAllHref = "/properties",
  variant = "light",
}: PropertiesGridSectionProps) {
  const bg = variant === "muted" ? "bg-surface-50/80" : "bg-white";

  return (
    <section className={`${bg} py-20 lg:py-28`}>
      <div className="container-app">
        <MotionSection className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-lg text-surface-500">{subtitle}</p>
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50 hover:shadow-md"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </MotionSection>

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
          <MotionStagger className={cn("mt-12", PROPERTY_GRID_CLASS)}>
            {properties.map((property) => (
              <MotionItem key={property.id}>
                <PropertyCard property={property} />
              </MotionItem>
            ))}
          </MotionStagger>
        )}
      </div>
    </section>
  );
}
