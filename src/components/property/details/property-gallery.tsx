"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Grid2x2, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { isPremiumProperty } from "@/lib/property/details-display";
import { propertyPhotoLayoutId, SHARED_ELEMENT_DURATION } from "@/lib/properties/shared-transition";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyGalleryProps {
  images: string[];
  title: string;
  isPremium?: boolean;
  /** Property id — enables the card-to-hero shared-element photo transition. */
  propertyId?: string;
}

export function PropertyGallery({ images, title, isPremium, propertyId }: PropertyGalleryProps) {
  const { t } = useTranslation();
  const displayImages = images.length > 0 ? images : [PLACEHOLDER_IMAGE];
  const premium = isPremium ?? false;
  const photoLayoutId = propertyId ? propertyPhotoLayoutId(propertyId) : undefined;

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + displayImages.length) % displayImages.length);
      setZoomed(false);
    },
    [displayImages.length]
  );

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setZoomed(false);
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") goTo(activeIndex - 1);
      if (event.key === "ArrowRight") goTo(activeIndex + 1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, activeIndex, goTo]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent, inLightbox: boolean) => {
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) goTo(activeIndex - 1);
    else goTo(activeIndex + 1);
    if (inLightbox) event.preventDefault();
  };

  return (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-[24px]",
          premium &&
            "ring-1 ring-amber-300/50 shadow-[0_8px_40px_-12px_rgba(251,191,36,0.25)]"
        )}
      >
        {premium && (
          <>
            <div
              className="pointer-events-none absolute -inset-px z-10 rounded-[24px] bg-gradient-to-r from-amber-200/0 via-amber-400/30 to-amber-200/0 opacity-60 animate-[premium-shimmer-border_4s_ease-in-out_infinite] bg-[length:200%_100%]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -inset-4 rounded-[28px] bg-amber-400/10 blur-2xl"
              aria-hidden
            />
          </>
        )}

        <motion.button
          type="button"
          layoutId={photoLayoutId}
          transition={{ duration: SHARED_ELEMENT_DURATION, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => openLightbox(activeIndex)}
          className="group relative aspect-[4/3] w-full overflow-hidden bg-surface-100 sm:aspect-[21/9]"
          aria-label={t.propertyDetail.viewPhotos}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
              onTouchStart={handleTouchStart}
              onTouchEnd={(event) => handleTouchEnd(event, false)}
            >
              <Image
                src={displayImages[activeIndex]}
                alt={`${title} - ${activeIndex + 1}`}
                fill
                priority={activeIndex === 0}
                loading={activeIndex === 0 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-[250ms] group-hover:scale-[1.02]"
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100" />

          <span className="absolute bottom-4 start-4 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            {t.propertyDetail.galleryCounter
              .replace("{current}", String(activeIndex + 1))
              .replace("{total}", String(displayImages.length))}
          </span>

          <span className="absolute bottom-4 end-4 inline-flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm font-medium text-surface-800 shadow-md backdrop-blur-sm transition-transform duration-[250ms] group-hover:scale-105">
            <ZoomIn className="h-4 w-4" aria-hidden />
            {t.propertyDetail.viewPhotos}
          </span>

          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(activeIndex - 1);
                }}
                className="absolute start-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/80 text-surface-700 shadow-lg backdrop-blur-md transition-all duration-[250ms] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70"
                aria-label={t.propertyDetail.previousPhoto}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(activeIndex + 1);
                }}
                className="absolute end-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/80 text-surface-700 shadow-lg backdrop-blur-md transition-all duration-[250ms] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70"
                aria-label={t.propertyDetail.nextPhoto}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </motion.button>

        {displayImages.length > 1 && (
          <div
            className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label={t.propertyDetail.thumbnailStrip}
          >
            {displayImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`${title} - ${index + 1}`}
                onClick={() => goTo(index)}
                className={cn(
                  "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-[250ms] sm:h-20 sm:w-28",
                  index === activeIndex
                    ? "border-brand-500 shadow-[0_4px_16px_-4px_rgba(0,105,198,0.35)]"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="112px"
                />
              </button>
            ))}
          </div>
        )}

        {displayImages.length > 1 && (
          <button
            type="button"
            onClick={() => openLightbox(activeIndex)}
            className="absolute end-4 top-4 z-10 inline-flex items-center gap-2 rounded-xl border border-white/50 bg-white/90 px-3 py-2 text-sm font-semibold text-surface-800 shadow-md backdrop-blur-md transition-all duration-[250ms] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70"
          >
            <Grid2x2 className="h-4 w-4" aria-hidden />
            {t.propertyDetail.showAllPhotos} ({displayImages.length})
          </button>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute end-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label={t.propertyDetail.closeGallery}
            >
              <X className="h-5 w-5" />
            </button>

            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  className="absolute start-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label={t.propertyDetail.previousPhoto}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  className="absolute end-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:end-16"
                  aria-label={t.propertyDetail.nextPhoto}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: zoomed ? 1.5 : 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative h-[70vh] w-full max-w-6xl cursor-zoom-in touch-pan-y"
              onClick={() => setZoomed((value) => !value)}
              onTouchStart={handleTouchStart}
              onTouchEnd={(event) => handleTouchEnd(event, true)}
            >
              <Image
                src={displayImages[activeIndex]}
                alt={`${title} - ${activeIndex + 1}`}
                fill
                className={cn(
                  "object-contain transition-transform duration-[250ms]",
                  zoomed && "cursor-zoom-out"
                )}
                sizes="100vw"
                priority
              />
            </motion.div>

            <p className="absolute bottom-6 start-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              {t.propertyDetail.galleryCounter
                .replace("{current}", String(activeIndex + 1))
                .replace("{total}", String(displayImages.length))}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function PropertyGallerySkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px]">
      <div className="aspect-[4/3] animate-pulse bg-surface-200 sm:aspect-[21/9]" />
      <div className="mt-3 flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-16 w-24 shrink-0 animate-pulse rounded-xl bg-surface-200 sm:h-20 sm:w-28" />
        ))}
      </div>
    </div>
  );
}

/** @deprecated Use PropertyGallery — kept for dynamic import compatibility during migration. */
export function PropertyDetailGallery(props: { images: string[]; title: string; property?: { is_featured?: boolean } }) {
  return (
    <PropertyGallery
      images={props.images}
      title={props.title}
      isPremium={props.property ? isPremiumProperty(props.property as import("@/types/database").Property) : undefined}
    />
  );
}

export { PropertyGallerySkeleton as PropertyDetailGallerySkeleton };
