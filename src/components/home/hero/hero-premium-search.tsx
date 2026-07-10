"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { PropertyType } from "@/types/database";
import { HeroAdvancedFiltersPanel } from "@/components/home/hero/hero-advanced-filters";
import { HeroPopularSearches } from "@/components/home/hero/hero-popular-searches";
import { HeroQuickFilters } from "@/components/home/hero/hero-quick-filters";
import { HeroRecentSearches } from "@/components/home/hero/hero-recent-searches";
import { HeroSearchDivider, HeroSearchField } from "@/components/home/hero/hero-search-field";
import { HeroStickySearch } from "@/components/home/hero/hero-sticky-search";
import { MOROCCAN_CITIES, PROPERTY_TYPE_VALUES } from "@/lib/constants";
import {
  EMPTY_HERO_ADVANCED_FILTERS,
  getRecentSearches,
  saveRecentSearch,
  type HeroAdvancedFiltersState,
  type HeroRecentSearch,
  type QuickFilterId,
} from "@/lib/home/hero-search-display";
import { cn, getPropertyTypeLabel } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const SELECT_CLASS =
  "h-7 w-full cursor-pointer appearance-none bg-transparent text-sm font-semibold text-surface-900 outline-none";

export function HeroPremiumSearch() {
  const { t, locale } = useTranslation();
  const isRtl = locale === "ar";
  const formRef = useRef<HTMLFormElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const filtersButtonRef = useRef<HTMLButtonElement>(null);

  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [destinationFocused, setDestinationFocused] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterId | null>(null);
  const [recentSearches, setRecentSearches] = useState<HeroRecentSearch[]>([]);
  const [showSticky, setShowSticky] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<HeroAdvancedFiltersState>(
    EMPTY_HERO_ADVANCED_FILTERS
  );

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setDestinationFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const typeLabel = propertyType
    ? getPropertyTypeLabel(propertyType as PropertyType, t)
    : t.home.allTypes;

  const handleSubmit = () => {
    setIsSearching(true);
    const label = [city, typeLabel !== t.home.allTypes ? typeLabel : ""]
      .filter(Boolean)
      .join(" · ");
    saveRecentSearch({
      city,
      propertyType,
      label: label || t.home.search,
    });
    setRecentSearches(getRecentSearches());
  };

  const applyRecent = useCallback((item: HeroRecentSearch) => {
    setCity(item.city);
    setPropertyType(item.propertyType);
    setDestinationFocused(false);
  }, []);

  const handleQuickFilter = (filterId: QuickFilterId, type?: PropertyType) => {
    setActiveQuickFilter(filterId);
    if (type) setPropertyType(type);
  };

  const handleAdvancedApply = (next: HeroAdvancedFiltersState) => {
    setAdvancedFilters(next);
    if (next.propertyTypes.length === 1) {
      setPropertyType(next.propertyTypes[0]!);
    } else if (next.propertyTypes.length === 0) {
      setPropertyType("");
    }
  };

  const handleAdvancedReset = () => {
    setAdvancedFilters(EMPTY_HERO_ADVANCED_FILTERS);
  };

  const advancedFilterFields = (
    <>
      {advancedFilters.bedrooms > 0 && (
        <input type="hidden" name="min_bedrooms" value={String(advancedFilters.bedrooms)} />
      )}
      {advancedFilters.bathrooms > 0 && (
        <input type="hidden" name="min_bathrooms" value={String(advancedFilters.bathrooms)} />
      )}
      {advancedFilters.area > 0 && (
        <input type="hidden" name="min_area" value={String(advancedFilters.area)} />
      )}
    </>
  );

  const searchButton = (
    <motion.button
      type="submit"
      disabled={isSearching}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex h-14 w-full shrink-0 items-center justify-center gap-2.5 overflow-hidden rounded-full",
        "bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 bg-[length:200%_100%]",
        "px-8 text-sm font-bold text-white",
        "shadow-[0_8px_28px_-6px_rgba(0,105,198,0.55)]",
        "transition-all duration-[250ms] hover:bg-[position:100%_0]",
        "hover:shadow-[0_12px_36px_-6px_rgba(0,105,198,0.65)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2",
        "disabled:opacity-90 md:h-[3.75rem] md:min-w-[10.5rem] md:w-auto"
      )}
      aria-label={t.home.search}
    >
      {isSearching ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      ) : (
        <Search className="h-5 w-5" aria-hidden />
      )}
      {t.home.search}
    </motion.button>
  );

  const destinationField = (
    <div ref={destinationRef} className="relative min-w-0 flex-1">
      <HeroSearchField
        icon={MapPin}
        label={t.home.searchCity}
        displayValue={city || t.home.searchCityPlaceholder}
        isFocused={destinationFocused}
        fieldId="hero-search-city"
      >
        <select
          id="hero-search-city"
          name="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          onFocus={() => setDestinationFocused(true)}
          className={SELECT_CLASS}
          aria-label={t.home.searchCity}
        >
          <option value="">{t.home.searchCityPlaceholder}</option>
          {MOROCCAN_CITIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </HeroSearchField>
      <AnimatePresence>
        {destinationFocused && (
          <HeroRecentSearches
            open
            recentSearches={recentSearches}
            onSelect={applyRecent}
          />
        )}
      </AnimatePresence>
    </div>
  );

  const typeField = (
    <HeroSearchField
      icon={Search}
      label={t.home.searchType}
      displayValue={typeLabel}
      fieldId="hero-search-type"
      className="min-w-0 flex-1"
    >
      <select
        id="hero-search-type"
        name="property_type"
        value={propertyType}
        onChange={(event) => setPropertyType(event.target.value)}
        className={SELECT_CLASS}
        aria-label={t.home.searchType}
      >
        <option value="">{t.home.allTypes}</option>
        {PROPERTY_TYPE_VALUES.map((type) => (
          <option key={type} value={type}>
            {getPropertyTypeLabel(type, t)}
          </option>
        ))}
      </select>
    </HeroSearchField>
  );

  const budgetField = (
    <HeroSearchField
      icon={Banknote}
      label={t.home.searchBudget}
      displayValue={t.home.searchBudgetComingSoon}
      isComingSoon
      className="min-w-0 flex-1"
    >
      <span className="sr-only">{t.home.searchBudgetComingSoon}</span>
    </HeroSearchField>
  );

  const advancedButton = (
    <div className="relative flex shrink-0 items-center px-2 md:px-3">
      <button
        ref={filtersButtonRef}
        type="button"
        onClick={() => setAdvancedOpen((open) => !open)}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full border border-surface-200/80 bg-white/80 px-4 text-sm font-semibold text-surface-700",
          "shadow-sm backdrop-blur-sm transition-all duration-[250ms]",
          "hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70",
          advancedOpen && "border-brand-200 bg-brand-50 text-brand-700"
        )}
        aria-expanded={advancedOpen}
        aria-haspopup="dialog"
        aria-controls="hero-advanced-filters-panel"
        aria-label={t.home.searchAdvancedFilters}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{t.home.searchAdvancedFilters}</span>
      </button>
    </div>
  );

  const searchForm = (layout: "desktop" | "mobile") => (
    <div
      className={cn(
        "overflow-visible rounded-[2rem] border border-white/40 bg-white/[0.97] p-2",
        "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12),0_24px_64px_-16px_rgba(0,105,198,0.18)]",
        "backdrop-blur-2xl transition-shadow duration-[250ms]",
        "md:rounded-full md:p-1.5",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.14),0_28px_72px_-18px_rgba(0,105,198,0.22)]"
      )}
    >
      {layout === "desktop" ? (
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-stretch">
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-0 md:grid-cols-2 lg:flex lg:flex-row">
              {destinationField}
              <HeroSearchDivider className="hidden lg:block" />
              {typeField}
            </div>
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-0 md:grid-cols-2 lg:flex lg:flex-row lg:items-center">
              <HeroSearchDivider className="hidden lg:block" />
              {budgetField}
              <HeroSearchDivider className="hidden lg:block" />
              {advancedButton}
            </div>
          </div>
          <div className="shrink-0 px-1 pb-1 pt-1 lg:pe-1.5">{searchButton}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {destinationField}
          <div className="h-px bg-surface-200/80" aria-hidden />
          {typeField}
          <div className="h-px bg-surface-200/80" aria-hidden />
          {budgetField}
          <div className="h-px bg-surface-200/80" aria-hidden />
          <div className="flex justify-center py-1">{advancedButton}</div>
          <div className="px-1 pb-1">{searchButton}</div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 mb-[-2.5rem] w-full shrink-0 pb-6 lg:mb-[-2.5rem] lg:pb-8"
      >
        <div className="md:hidden">
          {!mobileExpanded ? (
            <button
              type="button"
              onClick={() => setMobileExpanded(true)}
              className="mx-auto flex w-full max-w-lg items-center justify-between gap-3 rounded-full border border-white/30 bg-white/95 px-5 py-4 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70"
              aria-expanded={false}
              aria-label={t.home.searchExpand}
            >
              <div className="flex min-w-0 items-center gap-3 text-start">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Search className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-surface-500">
                    {t.home.search}
                  </p>
                  <p className="truncate text-sm font-semibold text-surface-900">
                    {city || propertyType
                      ? `${city || t.home.searchCityPlaceholder} · ${typeLabel}`
                      : t.home.searchCityPlaceholder}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 shrink-0 text-surface-400" aria-hidden />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMobileExpanded(false)}
                className="mb-3 flex w-full items-center justify-center gap-1 text-xs font-semibold text-white/80"
                aria-label={t.home.searchCollapse}
              >
                <ChevronUp className="h-4 w-4" aria-hidden />
                {t.home.searchCollapse}
              </button>
              <form
                ref={formRef}
                action="/properties"
                method="GET"
                dir={isRtl ? "rtl" : "ltr"}
                onSubmit={handleSubmit}
                className="mx-auto w-full max-w-5xl"
              >
                {advancedFilterFields}
                {searchForm("mobile")}
              </form>
            </>
          )}
        </div>

        <form
          ref={formRef}
          action="/properties"
          method="GET"
          dir={isRtl ? "rtl" : "ltr"}
          onSubmit={handleSubmit}
          className="mx-auto hidden w-full max-w-5xl md:block"
        >
          {advancedFilterFields}
          {searchForm("desktop")}
        </form>

        <HeroPopularSearches
          onCitySelect={(value) => {
            setCity(value);
            setMobileExpanded(true);
          }}
          onTypeSelect={(type) => {
            setPropertyType(type);
            setActiveQuickFilter(
              type === "maison"
                ? "maison"
                : type === "appartement"
                  ? "appartement"
                  : type === "villa"
                    ? "villa"
                    : null
            );
            setMobileExpanded(true);
          }}
        />

        <HeroQuickFilters
          activeFilter={activeQuickFilter}
          activePropertyType={propertyType}
          onFilterSelect={(filterId, type) => {
            handleQuickFilter(filterId, type);
            if (type) setMobileExpanded(true);
          }}
        />
      </motion.div>

      <HeroStickySearch
        visible={showSticky}
        city={city}
        propertyType={propertyType}
        onExpand={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setMobileExpanded(true);
        }}
      />

      <HeroAdvancedFiltersPanel
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        anchorRef={filtersButtonRef}
        value={advancedFilters}
        onApply={handleAdvancedApply}
        onReset={handleAdvancedReset}
      />
    </>
  );
}
