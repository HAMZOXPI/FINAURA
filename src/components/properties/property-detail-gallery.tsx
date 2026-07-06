"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Grid2x2, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyDetailGalleryProps {
  images: string[];
  title: string;
}

export function PropertyDetailGallery({ images, title }: PropertyDetailGalleryProps) {
  const { t } = useTranslation();
  const displayImages = images.length > 0 ? images : [PLACEHOLDER_IMAGE];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setZoomed(false);
    setLightboxOpen(true);
  };

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + displayImages.length) % displayImages.length);
      setZoomed(false);
    },
    [displayImages.length]
  );

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

  const gridImages = displayImages.slice(1, 5);
  const extraCount = Math.max(displayImages.length - 5, 0);

  return (
    <>
      {displayImages.length === 1 ? (
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="group relative aspect-video w-full overflow-hidden rounded-[20px] bg-surface-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.1)]"
        >
          <Image
            src={displayImages[0]}
            alt={title}
            fill
            priority
            className="object-cover transition-transform duration-[250ms] group-hover:scale-[1.02]"
            sizes="100vw"
          />
          <span className="absolute bottom-4 end-4 inline-flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm font-medium text-surface-800 shadow-md backdrop-blur-sm">
            <ZoomIn className="h-4 w-4" />
            {t.propertyDetail.viewPhotos}
          </span>
        </button>
      ) : (
        <div className="relative">
          <div className="grid h-[280px] grid-cols-1 gap-2 overflow-hidden rounded-[20px] sm:h-[360px] md:grid-cols-4 md:grid-rows-2 lg:h-[480px]">
            <button
              type="button"
              onClick={() => openLightbox(0)}
              className="group relative md:col-span-2 md:row-span-2"
            >
              <Image
                src={displayImages[0]}
                alt={`${title} - 1`}
                fill
                priority
                className="object-cover transition-transform duration-[250ms] group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </button>

            {gridImages.map((image, index) => (
              <button
                key={image + index}
                type="button"
                onClick={() => openLightbox(index + 1)}
                className="group relative hidden md:block"
              >
                <Image
                  src={image}
                  alt={`${title} - ${index + 2}`}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-[250ms] group-hover:scale-[1.05]"
                  sizes="25vw"
                />
                {index === gridImages.length - 1 && extraCount > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-lg font-semibold text-white">
                    +{extraCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 end-4 inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-semibold text-surface-800 shadow-md transition-all duration-[250ms] hover:bg-surface-50 md:bottom-5 md:end-5"
          >
            <Grid2x2 className="h-4 w-4" />
            {t.propertyDetail.showAllPhotos} ({displayImages.length})
          </button>
        </div>
      )}

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
              className="absolute end-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label={t.propertyDetail.closeGallery}
            >
              <X className="h-5 w-5" />
            </button>

            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  className="absolute start-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-label={t.propertyDetail.previousPhoto}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  className="absolute end-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:end-16"
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
              className="relative h-[70vh] w-full max-w-6xl cursor-zoom-in"
              onClick={() => setZoomed((value) => !value)}
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
              {activeIndex + 1} / {displayImages.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function PropertyDetailGallerySkeleton() {
  return (
    <div className="grid h-[280px] animate-pulse grid-cols-1 gap-2 overflow-hidden rounded-[20px] sm:h-[360px] md:grid-cols-4 md:grid-rows-2 lg:h-[480px]">
      <div className="bg-surface-200 md:col-span-2 md:row-span-2" />
      <div className="hidden bg-surface-200 md:block" />
      <div className="hidden bg-surface-200 md:block" />
      <div className="hidden bg-surface-200 md:block" />
      <div className="hidden bg-surface-200 md:block" />
    </div>
  );
}
