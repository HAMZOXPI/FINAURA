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
import { Building2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Property } from "@/types/database";
import { PropertyCard } from "@/components/properties/property-card";
import { cn } from "@/lib/utils";
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

interface PropertySimilarListingsProps {
  properties: Property[];
}

function SimilarEmptyState() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-surface-200/80 bg-white/80 px-8 py-14 text-center shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]">
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[20px] bg-gradient-to-br from-brand-50 to-surface-100 ring-1 ring-surface-200/80">
        <Building2 className="h-9 w-9 text-brand-600" strokeWidth={1.5} aria-hidden />
        <Sparkles className="absolute -end-1 -top-1 h-5 w-5 text-amber-500" aria-hidden />
      </div>
      <h3 className="mt-6 text-xl font-bold text-surface-900">{t.propertyDetail.similarEmptyTitle}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-surface-500">
        {t.propertyDetail.similarEmptySubtitle}
      </p>
    </div>
  );
}

export function PropertySimilarListings({ properties }: PropertySimilarListingsProps) {
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
  }, [properties.length, updateScrollState]);

  const scrollByDirection = useCallback((direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const firstSlide = el.querySelector<HTMLElement>("[data-similar-slide]");
    const slideWidth = firstSlide?.offsetWidth ?? el.clientWidth * 0.85;
    el.scrollBy({ left: direction * (slideWidth + CARD_GAP_PX), behavior: "smooth" });
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

  const showArrows = properties.length > 0 && (canScrollLeft || canScrollRight);

  return (
    <section aria-labelledby="similar-listings-heading" className="scroll-mt-24">
      <h2 id="similar-listings-heading" className="text-xl font-bold text-surface-900 sm:text-2xl">
        {t.propertyDetail.similarTitle}
      </h2>
      <p className="mt-2 text-surface-500">{t.propertyDetail.similarSubtitle}</p>

      {properties.length === 0 ? (
        <div className="mt-8">
          <SimilarEmptyState />
        </div>
      ) : (
        <div className="relative mt-8">
          <button
            type="button"
            onClick={() => scrollByDirection(-1)}
            disabled={!canScrollLeft}
            aria-label={t.propertyDetail.similarCarouselPrev}
            className={cn(
              "absolute start-0 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:flex",
              "h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/80 text-surface-700 shadow-lg backdrop-blur-md",
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
            aria-label={t.propertyDetail.similarCarouselNext}
            className={cn(
              "absolute end-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 lg:flex",
              "h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/80 text-surface-700 shadow-lg backdrop-blur-md",
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
            aria-label={t.propertyDetail.similarCarouselLabel}
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
            {properties.map((property) => (
              <motion.div
                key={property.id}
                data-similar-slide
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
