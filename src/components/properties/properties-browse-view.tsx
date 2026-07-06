"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { motion } from "framer-motion";
import { ChevronDown, LayoutGrid, LayoutList, List, Map, MapPin } from "lucide-react";
import type { Property } from "@/types/database";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertiesMapLayout } from "@/components/properties/properties-map-layout";
import {
  PropertyFiltersMobileDrawer,
  PropertyFiltersSidebar,
} from "@/components/properties/property-filters-sidebar";
import { PropertiesEmptyState } from "@/components/properties/properties-empty-state";
import { Button } from "@/components/ui/button";
import {
  buildLayoutParams,
  buildLoadMoreParams,
  buildSortParams,
  buildViewParams,
  getBrowseLayout,
  searchParamsToFormValues,
} from "@/lib/property-search";
import { interpolate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface PropertiesBrowseViewProps {
  properties: Property[];
  mapProperties: Property[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  cities: string[];
}

export function PropertiesBrowseView({
  properties,
  mapProperties,
  totalCount,
  hasMore,
  currentPage,
  cities,
}: PropertiesBrowseViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();

  const paramsObject = Object.fromEntries(searchParams.entries());
  const formValues = searchParamsToFormValues(paramsObject);
  const layoutMode = getBrowseLayout(paramsObject);
  const viewMode = formValues.view === "list" ? "list" : "grid";
  const currentSort = formValues.sort || "newest";

  const countLabel =
    totalCount === 1
      ? t.properties.foundOne
      : interpolate(t.properties.listingsCount, { count: totalCount });

  const navigate = (query: string) => {
    startTransition(() => {
      router.push(query ? `/properties?${query}` : "/properties");
    });
  };

  const handleSortChange = (sort: string) => {
    navigate(buildSortParams(paramsObject, sort));
  };

  const handleViewChange = (view: "grid" | "list") => {
    navigate(buildViewParams(paramsObject, view));
  };

  const handleLayoutChange = (layout: "browse" | "map") => {
    navigate(buildLayoutParams(paramsObject, layout));
  };

  const handleLoadMore = () => {
    navigate(buildLoadMoreParams(paramsObject, currentPage + 1));
  };

  const handleClearFilters = () => {
    navigate(viewMode === "list" ? "view=list" : "");
  };

  return (
    <div className="bg-surface-50/60">
      <div className="border-b border-surface-200 bg-gradient-to-b from-brand-50/60 via-white to-white">
        <div className="container-app py-10 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
              Finaura
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl lg:text-5xl">
              {t.properties.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-surface-500 sm:text-lg">
              {t.properties.subtitle}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
              <MapPin className="h-4 w-4" />
              {countLabel}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-app py-8 lg:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <aside className="hidden w-full shrink-0 lg:block lg:w-72 xl:w-80">
            <div className="sticky top-24">
              <PropertyFiltersSidebar cities={cities} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-4 rounded-[20px] border border-surface-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <PropertyFiltersMobileDrawer cities={cities} />
                <p className="text-sm text-surface-500">{countLabel}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <select
                    value={currentSort}
                    onChange={(event) => handleSortChange(event.target.value)}
                    disabled={isPending}
                    aria-label={t.properties.sortBy}
                    className="h-10 appearance-none rounded-xl border border-surface-300 bg-white pe-10 ps-4 text-sm font-medium text-surface-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="newest">{t.filters.sortNewest}</option>
                    <option value="price_asc">{t.filters.sortPriceAsc}</option>
                    <option value="price_desc">{t.filters.sortPriceDesc}</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-xl border border-surface-200 p-1">
                  <button
                    type="button"
                    onClick={() => handleLayoutChange("browse")}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                      layoutMode === "browse"
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-surface-600 hover:bg-surface-50"
                    )}
                    aria-label={t.properties.browseView}
                  >
                    <LayoutList className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.properties.browseView}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLayoutChange("map")}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                      layoutMode === "map"
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-surface-600 hover:bg-surface-50"
                    )}
                    aria-label={t.properties.mapView}
                  >
                    <Map className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.properties.mapView}</span>
                  </button>
                </div>

                {layoutMode === "browse" && (
                  <div className="flex rounded-xl border border-surface-200 p-1">
                    <button
                      type="button"
                      onClick={() => handleViewChange("grid")}
                      className={cn(
                        "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                        viewMode === "grid"
                          ? "bg-brand-600 text-white shadow-sm"
                          : "text-surface-600 hover:bg-surface-50"
                      )}
                      aria-label={t.properties.gridView}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      <span className="hidden sm:inline">{t.properties.gridView}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewChange("list")}
                      className={cn(
                        "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                        viewMode === "list"
                          ? "bg-brand-600 text-white shadow-sm"
                          : "text-surface-600 hover:bg-surface-50"
                      )}
                      aria-label={t.properties.listView}
                    >
                      <List className="h-4 w-4" />
                      <span className="hidden sm:inline">{t.properties.listView}</span>
                    </button>
                  </div>
                )}
              </div>
              </div>
            </div>

            {layoutMode === "map" ? (
              <div className={cn("pb-44 lg:pb-0")}>
                <PropertiesMapLayout
                  properties={mapProperties}
                  onClearFilters={handleClearFilters}
                />
              </div>
            ) : properties.length === 0 ? (
              <PropertiesEmptyState onClear={handleClearFilters} />
            ) : (
              <>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.05 } },
                  }}
                  className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
                      : "flex flex-col gap-4"
                  )}
                >
                  {properties.map((property) => (
                    <motion.div
                      key={property.id}
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <PropertyCard property={property} variant={viewMode} />
                    </motion.div>
                  ))}
                </motion.div>

                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      isLoading={isPending}
                      onClick={handleLoadMore}
                      className="min-w-[200px] rounded-xl"
                    >
                      {t.properties.loadMore}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
