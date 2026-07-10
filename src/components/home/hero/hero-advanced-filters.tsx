"use client";



import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

import { AnimatePresence, motion } from "framer-motion";

import { Check, Minus, Plus, Settings2, X } from "lucide-react";

import type { PropertyType } from "@/types/database";

import {

  getHeroAdvancedFiltersDraft,

  HERO_ADVANCED_FILTER_PROPERTY_TYPES,

  HERO_ADVANCED_FILTERS_UI_DEFAULTS,

  type HeroAdvancedAmenityKey,

  type HeroAdvancedFiltersState,

} from "@/lib/home/hero-search-display";

import { cn, getPropertyTypeLabel } from "@/lib/utils";

import { useTranslation } from "@/i18n/locale-provider";



const AMENITY_KEYS: HeroAdvancedAmenityKey[] = ["parking", "pool", "garden", "furnished"];



const AMENITY_LABELS: Record<HeroAdvancedAmenityKey, "advancedFilterParking" | "advancedFilterPool" | "advancedFilterGarden" | "advancedFilterFurnished"> = {

  parking: "advancedFilterParking",

  pool: "advancedFilterPool",

  garden: "advancedFilterGarden",

  furnished: "advancedFilterFurnished",

};



interface HeroAdvancedFiltersPanelProps {

  open: boolean;

  onClose: () => void;

  anchorRef: React.RefObject<HTMLButtonElement | null>;

  value: HeroAdvancedFiltersState;

  onApply: (value: HeroAdvancedFiltersState) => void;

  onReset: () => void;

}



interface PanelPosition {

  top: number;

  left: number;

  width: number;

}



function useIsMobileSheet() {

  const [isMobile, setIsMobile] = useState(false);



  useEffect(() => {

    const media = window.matchMedia("(max-width: 767px)");

    const update = () => setIsMobile(media.matches);

    update();

    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);

  }, []);



  return isMobile;

}



function FilterDivider() {

  return <div className="my-4 h-px bg-surface-200/90" aria-hidden />;

}



function FilterCheckbox({

  checked,

  label,

  onChange,

}: {

  checked: boolean;

  label: string;

  onChange: (checked: boolean) => void;

}) {

  return (

    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-surface-50/80">

      <span

        className={cn(

          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",

          checked

            ? "border-brand-500 bg-brand-500 text-white shadow-sm"

            : "border-surface-300 bg-white text-transparent"

        )}

      >

        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />

      </span>

      <input

        type="checkbox"

        checked={checked}

        onChange={(event) => onChange(event.target.checked)}

        className="sr-only"

      />

      <span className="text-sm font-medium text-surface-800">{label}</span>

    </label>

  );

}



function FilterStepper({

  label,

  value,

  min,

  max,

  onChange,

}: {

  label: string;

  value: number;

  min: number;

  max: number;

  onChange: (value: number) => void;

}) {

  return (

    <div className="flex items-center justify-between gap-4">

      <span className="text-sm font-semibold text-surface-800">{label}</span>

      <div className="inline-flex items-center gap-1 rounded-full border border-surface-200 bg-surface-50/80 p-1">

        <button

          type="button"

          onClick={() => onChange(Math.max(min, value - 1))}

          disabled={value <= min}

          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-surface-600 transition-colors hover:bg-white hover:text-surface-900 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70"

          aria-label={`${label} -`}

        >

          <Minus className="h-4 w-4" aria-hidden />

        </button>

        <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-surface-900">

          {value}

        </span>

        <button

          type="button"

          onClick={() => onChange(Math.min(max, value + 1))}

          disabled={value >= max}

          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-surface-600 transition-colors hover:bg-white hover:text-surface-900 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70"

          aria-label={`${label} +`}

        >

          <Plus className="h-4 w-4" aria-hidden />

        </button>

      </div>

    </div>

  );

}



function FiltersPanelContent({

  draft,

  onDraftChange,

  onClose,

  onApply,

  onReset,

}: {

  draft: HeroAdvancedFiltersState;

  onDraftChange: (next: HeroAdvancedFiltersState) => void;

  onClose: () => void;

  onApply: () => void;

  onReset: () => void;

}) {

  const { t } = useTranslation();



  const togglePropertyType = (type: PropertyType) => {

    const selected = draft.propertyTypes.includes(type);

    onDraftChange({

      ...draft,

      propertyTypes: selected

        ? draft.propertyTypes.filter((item) => item !== type)

        : [...draft.propertyTypes, type],

    });

  };



  const toggleAmenity = (key: HeroAdvancedAmenityKey) => {

    onDraftChange({

      ...draft,

      amenities: {

        ...draft.amenities,

        [key]: !draft.amenities[key],

      },

    });

  };



  return (

    <>

      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-2.5">

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">

            <Settings2 className="h-4 w-4" aria-hidden />

          </span>

          <p className="text-sm font-bold text-surface-900">{t.home.searchAdvancedTitle}</p>

        </div>

        <button

          type="button"

          onClick={onClose}

          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 md:hidden"

          aria-label={t.home.searchCollapse}

        >

          <X className="h-4 w-4" aria-hidden />

        </button>

      </div>



      <div className="mt-4 grid grid-cols-1 gap-0.5 sm:grid-cols-2">

        {HERO_ADVANCED_FILTER_PROPERTY_TYPES.map((type) => (

          <FilterCheckbox

            key={type}

            checked={draft.propertyTypes.includes(type)}

            label={getPropertyTypeLabel(type, t)}

            onChange={() => togglePropertyType(type)}

          />

        ))}

      </div>



      <FilterDivider />



      <div className="space-y-3.5">

        <FilterStepper

          label={t.home.advancedFilterBedrooms}

          value={draft.bedrooms}

          min={0}

          max={10}

          onChange={(bedrooms) => onDraftChange({ ...draft, bedrooms })}

        />

        <FilterStepper

          label={t.home.advancedFilterBathrooms}

          value={draft.bathrooms}

          min={0}

          max={8}

          onChange={(bathrooms) => onDraftChange({ ...draft, bathrooms })}

        />

        <div className="flex items-center justify-between gap-4">

          <span className="text-sm font-semibold text-surface-800">{t.home.advancedFilterArea}</span>

          <div className="relative w-[7.5rem]">

            <input

              type="number"

              min={0}

              max={100000}

              value={draft.area || ""}

              onChange={(event) => {

                const parsed = Number(event.target.value);

                onDraftChange({

                  ...draft,

                  area: Number.isFinite(parsed) && parsed >= 0 ? parsed : 0,

                });

              }}

              className="h-10 w-full rounded-xl border border-surface-200 bg-surface-50/80 pe-10 ps-3 text-sm font-semibold tabular-nums text-surface-900 outline-none transition-colors focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-500/20"

              aria-label={t.home.advancedFilterArea}

            />

            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-surface-400">

              m²

            </span>

          </div>

        </div>

      </div>



      <FilterDivider />



      <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">

        {AMENITY_KEYS.map((key) => (

          <FilterCheckbox

            key={key}

            checked={draft.amenities[key]}

            label={t.home[AMENITY_LABELS[key]]}

            onChange={() => toggleAmenity(key)}

          />

        ))}

      </div>



      <FilterDivider />



      <div className="flex items-center justify-end gap-2.5">

        <button

          type="button"

          onClick={onReset}

          className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70"

        >

          {t.home.advancedFilterReset}

        </button>

        <button

          type="button"

          onClick={onApply}

          className="inline-flex h-10 items-center justify-center rounded-full bg-brand-600 px-6 text-sm font-bold text-white shadow-[0_6px_20px_-6px_rgba(0,105,198,0.55)] transition-all hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2"

        >

          {t.home.advancedFilterApply}

        </button>

      </div>

    </>

  );

}



export function HeroAdvancedFiltersPanel({

  open,

  onClose,

  anchorRef,

  value,

  onApply,

  onReset,

}: HeroAdvancedFiltersPanelProps) {

  const { t, locale } = useTranslation();

  const isRtl = locale === "ar";

  const isMobile = useIsMobileSheet();

  const [mounted, setMounted] = useState(false);

  const [position, setPosition] = useState<PanelPosition>({ top: 0, left: 0, width: 450 });

  const [draft, setDraft] = useState<HeroAdvancedFiltersState>(() =>

    getHeroAdvancedFiltersDraft(value)

  );

  const panelRef = useRef<HTMLDivElement>(null);



  useEffect(() => {

    setMounted(true);

  }, []);



  useEffect(() => {

    if (open) {

      setDraft(getHeroAdvancedFiltersDraft(value));

    }

  }, [open, value]);



  const updatePosition = useCallback(() => {

    const anchor = anchorRef.current;

    if (!anchor) return;



    const rect = anchor.getBoundingClientRect();

    const width = Math.min(480, Math.max(420, rect.width + 280));

    let left = isRtl ? rect.right - width : rect.left;

    const maxLeft = window.innerWidth - width - 16;

    left = Math.max(16, Math.min(left, maxLeft));



    setPosition({

      top: rect.bottom + 12,

      left,

      width,

    });

  }, [anchorRef, isRtl]);



  useLayoutEffect(() => {

    if (!open || isMobile) return;

    updatePosition();

    window.addEventListener("resize", updatePosition);

    window.addEventListener("scroll", updatePosition, true);

    return () => {

      window.removeEventListener("resize", updatePosition);

      window.removeEventListener("scroll", updatePosition, true);

    };

  }, [open, isMobile, updatePosition]);



  useEffect(() => {

    if (!open) return;



    const onKeyDown = (event: KeyboardEvent) => {

      if (event.key === "Escape") onClose();

    };



    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);

  }, [open, onClose]);



  useEffect(() => {

    if (!open) return;



    const onPointerDown = (event: MouseEvent) => {

      const target = event.target as Node;

      if (anchorRef.current?.contains(target)) return;

      if (panelRef.current?.contains(target)) return;

      onClose();

    };



    document.addEventListener("mousedown", onPointerDown);

    return () => document.removeEventListener("mousedown", onPointerDown);

  }, [open, onClose, anchorRef]);



  useEffect(() => {

    if (!open || !isMobile) return;

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {

      document.body.style.overflow = previous;

    };

  }, [open, isMobile]);



  const handleReset = () => {

    setDraft({

      ...HERO_ADVANCED_FILTERS_UI_DEFAULTS,

      propertyTypes: [],

      amenities: { ...HERO_ADVANCED_FILTERS_UI_DEFAULTS.amenities },

    });

    onReset();

  };



  const handleApply = () => {

    onApply({

      ...draft,

      propertyTypes: [...draft.propertyTypes],

      amenities: { ...draft.amenities },

    });

    onClose();

  };



  if (!mounted) return null;



  const panelContent = (

    <FiltersPanelContent

      draft={draft}

      onDraftChange={setDraft}

      onClose={onClose}

      onApply={handleApply}

      onReset={handleReset}

    />

  );



  return createPortal(

    <AnimatePresence>

      {open && (

        <>

          {isMobile ? (

            <>

              <motion.button

                type="button"

                aria-label={t.home.searchCollapse}

                initial={{ opacity: 0 }}

                animate={{ opacity: 1 }}

                exit={{ opacity: 0 }}

                transition={{ duration: 0.2 }}

                className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px]"

                onClick={onClose}

              />

              <motion.div

                ref={panelRef}

                id="hero-advanced-filters-panel"

                role="dialog"

                aria-modal="true"

                aria-label={t.home.searchAdvancedTitle}

                initial={{ y: "100%" }}

                animate={{ y: 0 }}

                exit={{ y: "100%" }}

                transition={{ type: "spring", stiffness: 380, damping: 34 }}

                className={cn(

                  "fixed inset-x-0 bottom-0 z-[210] max-h-[85dvh] overflow-y-auto",

                  "rounded-t-[20px] border border-white/60 bg-white/95 p-5 pb-8",

                  "shadow-[0_-12px_48px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl"

                )}

              >

                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-300" aria-hidden />

                {panelContent}

              </motion.div>

            </>

          ) : (

            <motion.div

              ref={panelRef}

              id="hero-advanced-filters-panel"

              role="dialog"

              aria-modal="true"

              aria-label={t.home.searchAdvancedTitle}

              initial={{ opacity: 0, y: -8 }}

              animate={{ opacity: 1, y: 0 }}

              exit={{ opacity: 0, y: -8 }}

              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}

              style={{

                position: "fixed",

                top: position.top,

                left: position.left,

                width: position.width,

              }}

              className={cn(

                "z-[200] rounded-[20px] border border-white/70 bg-white/95 p-5",

                "shadow-[0_20px_56px_-16px_rgba(0,0,0,0.22)] backdrop-blur-xl"

              )}

            >

              {panelContent}

            </motion.div>

          )}

        </>

      )}

    </AnimatePresence>,

    document.body

  );

}


