"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Home,
  Sparkles,
  Star,
} from "lucide-react";
import type { Property } from "@/types/database";
import { PropertyCard } from "@/components/properties/property-card";
import { MotionSection } from "@/components/home/motion-section";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const CARD_GAP_PX = 24;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const CARD_SLIDE_CLASS = cn(
  "h-full shrink-0 snap-start",
  "w-[calc(83.333%-6px)]",
  "md:w-[calc(50%-12px)]",
  "lg:w-[calc(25%-18px)]",
  "xl:w-[calc(20%-19.2px)]"
);

interface LatestListingsSectionProps {
  properties: Property[];
}

function ShowcaseListingCard({ property }: { property: Property }) {
  const isPremium = Boolean(property.is_featured);

  return (
    <div
      className={cn(
        "group/showcase relative h-full",
        "transition-transform duration-[250ms] ease-out",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-2",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02]"
      )}
    >
      {isPremium && (
        <>
          <div
            className="pointer-events-none absolute -inset-3 rounded-[26px] bg-amber-400/15 blur-2xl opacity-50 transition-opacity duration-[250ms] group-hover/showcase:opacity-90"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -inset-px z-20 overflow-hidden rounded-[21px]"
            aria-hidden
          >
            <div className="absolute inset-0 animate-[premium-shimmer-border_3.5s_ease-in-out_infinite] bg-gradient-to-r from-amber-200/0 via-amber-400/70 to-amber-200/0 bg-[length:200%_100%]" />
          </div>
        </>
      )}

      <div
        className={cn(
          "relative h-full transition-shadow duration-[250ms] ease-out",
          "[@media(hover:hover)_and_(pointer:fine)]:group-hover/showcase:shadow-[0_24px_56px_-12px_rgba(0,0,0,0.2)]",
          isPremium &&
            "[@media(hover:hover)_and_(pointer:fine)]:group-hover/showcase:ring-2 [@media(hover:hover)_and_(pointer:fine)]:group-hover/showcase:ring-amber-300/70",
          "[&_img]:transition-transform [&_img]:duration-[250ms] [&_img]:ease-out",
          "[@media(hover:hover)_and_(pointer:fine)]:group-hover/showcase:[&_img]:scale-110",
          "[&_.absolute.end-3_button]:transition-transform [&_.absolute.end-3_button]:duration-[250ms]",
          "[@media(hover:hover)_and_(pointer:fine)]:group-hover/showcase:[&_.absolute.end-3_button]:scale-110",
          isPremium &&
            "[&_article_.rounded-full]:relative [&_article_.rounded-full]:overflow-hidden",
          isPremium &&
            "[&_article_.rounded-full]:after:pointer-events-none [&_article_.rounded-full]:after:absolute [&_article_.rounded-full]:after:inset-0 [&_article_.rounded-full]:after:bg-gradient-to-r [&_article_.rounded-full]:after:from-transparent [&_article_.rounded-full]:after:via-white/45 [&_article_.rounded-full]:after:to-transparent [&_article_.rounded-full]:after:animate-[ribbon-shine_4s_ease-in-out_infinite]"
        )}
      >
        <PropertyCard property={property} />
      </div>
    </div>
  );
}

function LatestEmptyState() {
  const { t } = useTranslation();

  return (
    <MotionSection delay={0.1} className="mt-14">
      <div className="relative overflow-hidden rounded-[28px] border border-surface-200/80 bg-white/80 px-8 py-16 text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:px-12 sm:py-20">
        <div
          className="pointer-events-none absolute -start-16 -top-16 h-48 w-48 rounded-full bg-brand-200/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -end-12 h-40 w-40 rounded-full bg-amber-200/25 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[24px] bg-gradient-to-br from-brand-50 via-white to-surface-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_32px_-8px_rgba(0,105,198,0.15)] ring-1 ring-surface-200/80">
          <Building2 className="h-10 w-10 text-brand-600" strokeWidth={1.5} aria-hidden />
          <Sparkles
            className="absolute -end-1 -top-1 h-5 w-5 text-amber-500"
            strokeWidth={2}
            aria-hidden
          />
        </div>

        <h3 className="relative mt-8 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
          {t.home.emptyLatestTitle}
        </h3>
        <p className="relative mx-auto mt-3 max-w-md text-base text-surface-500 sm:text-lg">
          {t.home.emptyLatestSubtitle}
        </p>
        <Link
          href="/properties"
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(0,105,198,0.45)] transition-all duration-[250ms] hover:bg-brand-700 hover:shadow-[0_8px_24px_-6px_rgba(0,105,198,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2"
        >
          {t.home.emptyLatestCta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </MotionSection>
  );
}

export function LatestListingsSection({ properties }: LatestListingsSectionProps) {
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

    const onScroll = () => updateScrollState();
    const onResize = () => updateScrollState();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const observer = new ResizeObserver(onResize);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [properties.length, updateScrollState]);

  const scrollByDirection = useCallback((direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;

    const firstSlide = el.querySelector<HTMLElement>("[data-carousel-slide]");
    const slideWidth = firstSlide?.offsetWidth ?? el.clientWidth * 0.85;

    el.scrollBy({
      left: direction * (slideWidth + CARD_GAP_PX),
      behavior: "smooth",
    });
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

    const delta = event.clientX - dragStartX.current;
    el.scrollLeft = dragScrollLeft.current - delta;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;

    setIsDragging(false);
    if (el.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }
  };

  const statChips = [
    { icon: Flame, label: t.home.latestChipNew, tone: "text-orange-600 bg-orange-50 border-orange-200/70" },
    { icon: Star, label: t.home.latestChipPremium, tone: "text-amber-700 bg-amber-50 border-amber-200/70" },
    { icon: Home, label: t.home.latestChipRecent, tone: "text-brand-700 bg-brand-50 border-brand-200/70" },
  ] as const;

  const showArrows = properties.length > 0 && (canScrollLeft || canScrollRight);

  return (
    <section
      className="relative overflow-hidden py-20 lg:py-28"
      aria-labelledby="latest-listings-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,105,198,0.06),transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute start-[8%] top-[18%] h-64 w-64 rounded-full bg-brand-300/10 blur-[80px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute end-[5%] bottom-[12%] h-72 w-72 rounded-full bg-amber-200/15 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute start-1/2 top-1/2 h-48 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface-200/20 blur-[100px]"
        aria-hidden
      />

      <div className="container-app relative">
        <MotionSection>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
                {t.home.latestEyebrow}
              </span>
              <h2
                id="latest-listings-heading"
                className="mt-5 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl"
              >
                {t.home.latestTitle}
              </h2>
              <p className="mt-3 text-lg text-surface-500">{t.home.latestSubtitle}</p>
            </div>

            <Link
              href="/properties"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-surface-200 bg-white/90 px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm backdrop-blur-sm transition-all duration-[250ms] hover:border-brand-200 hover:bg-brand-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2"
            >
              {t.home.viewAll}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </MotionSection>

        {properties.length === 0 ? (
          <LatestEmptyState />
        ) : (
          <>
            <MotionSection delay={0.05} className="mt-10">
              <div className="flex flex-wrap gap-2.5" role="list" aria-label={t.home.latestStatsLabel}>
                {statChips.map(({ icon: Icon, label, tone }) => (
                  <span
                    key={label}
                    role="listitem"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                      tone
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
            </MotionSection>

            <div className="relative mt-10 lg:mt-12">
              <button
                type="button"
                onClick={() => scrollByDirection(-1)}
                disabled={!canScrollLeft}
                aria-label={t.home.latestCarouselPrev}
                className={cn(
                  "absolute start-0 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:flex",
                  "h-11 w-11 items-center justify-center rounded-full",
                  "border border-white/60 bg-white/75 text-surface-700 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] backdrop-blur-md",
                  "transition-all duration-[250ms] hover:bg-white hover:text-brand-700 hover:shadow-[0_12px_40px_-10px_rgba(0,105,198,0.25)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-0",
                  showArrows && canScrollLeft ? "opacity-100" : "opacity-0"
                )}
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>

              <button
                type="button"
                onClick={() => scrollByDirection(1)}
                disabled={!canScrollRight}
                aria-label={t.home.latestCarouselNext}
                className={cn(
                  "absolute end-0 top-1/2 z-20 hidden -translate-y-1/2 translate-x-1/2 lg:flex",
                  "h-11 w-11 items-center justify-center rounded-full",
                  "border border-white/60 bg-white/75 text-surface-700 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] backdrop-blur-md",
                  "transition-all duration-[250ms] hover:bg-white hover:text-brand-700 hover:shadow-[0_12px_40px_-10px_rgba(0,105,198,0.25)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-0",
                  showArrows && canScrollRight ? "opacity-100" : "opacity-0"
                )}
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>

              <motion.div
                ref={scrollRef}
                role="region"
                aria-roledescription="carousel"
                aria-label={t.home.latestCarouselLabel}
                tabIndex={0}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } },
                }}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={cn(
                  "flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2",
                  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                  "scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-4 focus-visible:rounded-2xl",
                  isDragging ? "cursor-grabbing select-none" : "cursor-grab lg:cursor-default"
                )}
              >
                {properties.map((property) => (
                  <motion.div
                    key={property.id}
                    data-carousel-slide
                    variants={fadeUp}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={CARD_SLIDE_CLASS}
                  >
                    <ShowcaseListingCard property={property} />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <MotionSection delay={0.15} className="mt-12 text-center">
              <Link
                href="/properties"
                className="group/link relative inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition-colors duration-[250ms] hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2"
              >
                {t.home.latestViewAllBottom}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-[250ms] group-hover/link:translate-x-0.5"
                  aria-hidden
                />
                <motion.span
                  className="absolute -bottom-1 start-0 h-px w-full origin-start bg-brand-500/70"
                  initial={{ scaleX: 0.35 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden
                />
              </Link>
            </MotionSection>
          </>
        )}
      </div>
    </section>
  );
}
