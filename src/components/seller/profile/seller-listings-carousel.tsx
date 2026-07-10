"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "@/types/database";
import { PropertyCard } from "@/components/properties/property-card";
import { cn, interpolate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const CARD_GAP_PX = 24;
const CARD_SLIDE_CLASS = cn(
  "h-full shrink-0 snap-start",
  "w-[calc(83.333%-6px)]",
  "md:w-[calc(50%-12px)]",
  "lg:w-[calc(25%-18px)]"
);
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

interface SellerListingsCarouselProps {
  listings: Property[];
}

export function SellerListingsCarousel({ listings }: SellerListingsCarouselProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      observer.disconnect();
    };
  }, [listings.length, updateScrollState]);

  const scrollByDirection = useCallback((direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>("[data-listing-slide]");
    const w = slide?.offsetWidth ?? el.clientWidth * 0.85;
    el.scrollBy({ left: direction * (w + CARD_GAP_PX), behavior: "smooth" });
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByDirection(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByDirection(1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || event.button !== 0) return;
    setIsDragging(true);
    dragStartX.current = event.clientX;
    dragScrollLeft.current = el.scrollLeft;
    el.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!isDragging || !el) return;
    el.scrollLeft = dragScrollLeft.current - (event.clientX - dragStartX.current);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(false);
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
  };

  const showArrows = listings.length > 0 && (canScrollLeft || canScrollRight);

  return (
    <section aria-labelledby="active-listings-heading" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="active-listings-heading" className="text-xl font-bold text-surface-900 sm:text-2xl">
            {t.seller.activeListings}
          </h2>
          <p className="mt-2 text-surface-500">
            {interpolate(t.seller.activeListingsCount, { count: listings.length })}
          </p>
        </div>
        {listings.length > 0 && (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700 ring-1 ring-brand-200/60">
            {listings.length}
          </span>
        )}
      </div>

      {listings.length === 0 ? (
        <p className="mt-8 rounded-[24px] border border-dashed border-surface-300 bg-surface-50/80 px-6 py-12 text-center text-sm text-surface-500">
          {t.seller.noActiveListings}
        </p>
      ) : (
        <div className="relative mt-8">
          <button
            type="button"
            onClick={() => scrollByDirection(-1)}
            disabled={!canScrollLeft}
            aria-label={t.seller.listingsCarouselPrev}
            className={cn(
              "absolute start-0 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:flex",
              "h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/80 shadow-lg backdrop-blur-md",
              "transition-all duration-[250ms] hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70",
              "disabled:pointer-events-none disabled:opacity-0",
              showArrows && canScrollLeft && "opacity-100"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDirection(1)}
            disabled={!canScrollRight}
            aria-label={t.seller.listingsCarouselNext}
            className={cn(
              "absolute end-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 lg:flex",
              "h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/80 shadow-lg backdrop-blur-md",
              "transition-all duration-[250ms] hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70",
              "disabled:pointer-events-none disabled:opacity-0",
              showArrows && canScrollRight && "opacity-100"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <motion.div
            ref={scrollRef}
            role="region"
            aria-roledescription="carousel"
            aria-label={t.seller.listingsCarouselLabel}
            tabIndex={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={cn(
              "flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              "scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-4",
              isDragging ? "cursor-grabbing select-none" : "cursor-grab lg:cursor-default"
            )}
          >
            {listings.map((property) => (
              <motion.div
                key={property.id}
                data-listing-slide
                variants={fadeUp}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={CARD_SLIDE_CLASS}
              >
                <div className="h-full transition-transform duration-[250ms] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1">
                  <PropertyCard property={property} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </section>
  );
}
