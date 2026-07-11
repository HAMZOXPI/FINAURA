"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { MOROCCAN_CITIES, PROPERTY_TYPE_VALUES } from "@/lib/constants";
import {
  buildPropertySearchParams,
  hasActivePropertyFilters,
  searchParamsToFormValues,
  type PropertySearchFormValues,
} from "@/lib/property-search";
import { getPropertyTypeLabel, interpolate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface PropertyFiltersSidebarProps {
  cities?: string[];
  className?: string;
  onApplied?: () => void;
  /** Hides the internal "Filtrer les annonces" header row (used when a parent, e.g. a BottomSheet, already renders its own title). */
  hideHeader?: boolean;
  /** Overrides the submit button label without touching the default (desktop) label. */
  submitLabel?: string;
  /** Overrides the clear button label without touching the default (desktop) label. */
  clearLabel?: string;
}

const EMPTY_FORM: PropertySearchFormValues = {
  search: "",
  city: "",
  region: "",
  property_type: "",
  status: "",
  min_bedrooms: "",
  min_bathrooms: "",
  min_area: "",
  min_price: "",
  max_price: "",
  sort: "newest",
  page: "",
  view: "",
};

function FilterFields({
  form,
  updateField,
  cityOptions,
  t,
}: {
  form: PropertySearchFormValues;
  updateField: <K extends keyof PropertySearchFormValues>(
    key: K,
    value: PropertySearchFormValues[K]
  ) => void;
  cityOptions: string[];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          name="search"
          value={form.search}
          placeholder={t.filters.searchPlaceholder}
          onChange={(event) => updateField("search", event.target.value)}
          className="flex h-11 w-full rounded-xl border border-surface-300 bg-white ps-10 pe-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <Select
        label={t.filters.allCities}
        value={form.city}
        onChange={(event) => updateField("city", event.target.value)}
        options={[
          { value: "", label: t.filters.allCities },
          ...cityOptions.map((city) => ({ value: city, label: city })),
        ]}
      />

      <Input
        name="region"
        label={t.filters.regionPlaceholder}
        value={form.region}
        placeholder={t.filters.regionPlaceholder}
        onChange={(event) => updateField("region", event.target.value)}
      />

      <Select
        label={t.form.propertyType}
        value={form.property_type}
        onChange={(event) => updateField("property_type", event.target.value)}
        options={[
          { value: "", label: t.filters.allTypes },
          ...PROPERTY_TYPE_VALUES.map((type) => ({
            value: type,
            label: getPropertyTypeLabel(type, t),
          })),
        ]}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          name="min_price"
          min={0}
          label={t.filters.minPrice}
          value={form.min_price}
          placeholder={t.filters.minPrice}
          onChange={(event) => updateField("min_price", event.target.value)}
        />
        <Input
          type="number"
          name="max_price"
          min={0}
          label={t.filters.maxPrice}
          value={form.max_price}
          placeholder={t.filters.maxPrice}
          onChange={(event) => updateField("max_price", event.target.value)}
        />
      </div>

      <Select
        label={t.form.bedrooms}
        value={form.min_bedrooms}
        onChange={(event) => updateField("min_bedrooms", event.target.value)}
        options={[
          { value: "", label: t.filters.anyBeds },
          ...[1, 2, 3, 4, 5].map((n) => ({
            value: String(n),
            label: interpolate(t.filters.bedsPlus, { n }),
          })),
        ]}
      />

      <Select
        label={t.form.bathrooms}
        value={form.min_bathrooms}
        onChange={(event) => updateField("min_bathrooms", event.target.value)}
        options={[
          { value: "", label: t.filters.anyBaths },
          ...[1, 2, 3, 4].map((n) => ({
            value: String(n),
            label: interpolate(t.filters.bathsPlus, { n }),
          })),
        ]}
      />

      <Input
        type="number"
        name="min_area"
        min={0}
        label={t.filters.minArea}
        value={form.min_area}
        placeholder={t.filters.minArea}
        onChange={(event) => updateField("min_area", event.target.value)}
      />

      <Select
        label={t.filters.saleRent}
        value={form.status}
        onChange={(event) => updateField("status", event.target.value)}
        options={[
          { value: "", label: t.filters.saleRent },
          { value: "for_sale", label: t.propertyStatus.for_sale },
          { value: "for_rent", label: t.propertyStatus.for_rent },
        ]}
      />
    </div>
  );
}

export function PropertyFiltersSidebar({
  cities = [],
  className,
  onApplied,
  hideHeader = false,
  submitLabel,
  clearLabel,
}: PropertyFiltersSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();

  const paramsObject = Object.fromEntries(searchParams.entries());
  const [form, setForm] = useState<PropertySearchFormValues>(() =>
    searchParamsToFormValues(paramsObject)
  );

  useEffect(() => {
    setForm(searchParamsToFormValues(Object.fromEntries(searchParams.entries())));
  }, [searchParams]);

  const cityOptions = [...new Set([...MOROCCAN_CITIES, ...cities])].sort();
  const hasFilters = hasActivePropertyFilters(paramsObject);

  const updateField = <K extends keyof PropertySearchFormValues>(
    key: K,
    value: PropertySearchFormValues[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = () => {
    const current = searchParamsToFormValues(paramsObject);
    const params = buildPropertySearchParams({
      ...form,
      sort: current.sort,
      view: current.view,
      page: "",
    });
    params.delete("page");
    const query = params.toString();

    startTransition(() => {
      router.push(query ? `/properties?${query}` : "/properties");
      onApplied?.();
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters();
  };

  const clearFilters = () => {
    setForm({ ...EMPTY_FORM, view: form.view ?? "" });
    startTransition(() => {
      router.push(form.view ? `/properties?view=${form.view}` : "/properties");
      onApplied?.();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-[20px] border border-surface-200/80 bg-white p-5 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {!hideHeader && (
        <div className="mb-5 flex items-center gap-2 border-b border-surface-100 pb-4">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-surface-900">
            {t.filters.title}
          </h2>
        </div>
      )}

      <FilterFields form={form} updateField={updateField} cityOptions={cityOptions} t={t} />

      <div className="mt-6 space-y-2">
        <Button type="submit" className="w-full" isLoading={isPending}>
          <Search className="h-4 w-4" />
          {submitLabel ?? t.filters.searchButton}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={clearFilters}
          disabled={isPending || !hasFilters}
        >
          {clearLabel ?? t.filters.clear}
        </Button>
      </div>
    </form>
  );
}

export function PropertyFiltersMobileDrawer({ cities = [] }: { cities?: string[] }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const hasFilters = hasActivePropertyFilters(Object.fromEntries(searchParams.entries()));

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t.properties.showFilters}
        {hasFilters && (
          <span className="ms-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
            !
          </span>
        )}
      </Button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t.filters.title}
        height="large"
        closeLabel={t.notifications.close}
        zIndex={220}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pb-2">
          <PropertyFiltersSidebar
            cities={cities}
            onApplied={() => setOpen(false)}
            className="border-none p-0 shadow-none"
            hideHeader
            submitLabel={t.filters.applyMobile}
            clearLabel={t.filters.resetMobile}
          />
        </div>
      </BottomSheet>
    </>
  );
}

/** @deprecated Use PropertyFiltersSidebar in browse layout */
export function PropertyFiltersBar(props: PropertyFiltersSidebarProps) {
  return <PropertyFiltersSidebar {...props} />;
}
