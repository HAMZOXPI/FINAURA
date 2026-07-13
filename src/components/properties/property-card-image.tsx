"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { getSafeImageSrc } from "@/lib/messaging/messaging-display";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";

interface PropertyCardImageProps {
  src: string | undefined | null;
  alt: string;
  priority?: boolean;
  /** First above-the-fold card on mobile — enables fetchPriority high + decoding async. */
  leadImage?: boolean;
  sizes: string;
  className?: string;
}

/**
 * Property card cover image with skeleton, cache-safe onLoad handling,
 * one automatic retry, and placeholder fallback.
 */
export function PropertyCardImage({
  src,
  alt,
  priority = false,
  leadImage = false,
  sizes,
  className,
}: PropertyCardImageProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const resolvedSrc = getSafeImageSrc(src, PLACEHOLDER_IMAGE);
  const [displaySrc, setDisplaySrc] = useState(resolvedSrc);
  const [loaded, setLoaded] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const retriedRef = useRef(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const nextSrc = getSafeImageSrc(src, PLACEHOLDER_IMAGE);
    setDisplaySrc(nextSrc);
    setLoaded(false);
    retriedRef.current = false;
    setRetryKey(0);
  }, [src]);

  const markLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  const syncLoadedFromDom = useCallback(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      markLoaded();
    }
  }, [markLoaded]);

  useEffect(() => {
    const frame = requestAnimationFrame(syncLoadedFromDom);
    return () => cancelAnimationFrame(frame);
  }, [displaySrc, retryKey, syncLoadedFromDom]);

  const handleLoad = useCallback(() => {
    markLoaded();
  }, [markLoaded]);

  const handleError = useCallback(() => {
    if (!retriedRef.current && displaySrc !== PLACEHOLDER_IMAGE) {
      retriedRef.current = true;
      setLoaded(false);
      setRetryKey((key) => key + 1);
      return;
    }

    if (displaySrc !== PLACEHOLDER_IMAGE) {
      setDisplaySrc(PLACEHOLDER_IMAGE);
      setLoaded(false);
      setRetryKey((key) => key + 1);
    }
  }, [displaySrc]);

  const assignImgRef = useCallback(
    (node: HTMLImageElement | null) => {
      imgRef.current = node;
      if (node?.complete && node.naturalWidth > 0) {
        markLoaded();
      }
    },
    [markLoaded]
  );

  const mobileEager = isMobile && priority;
  const desktopPriority = !isMobile && priority;

  return (
    <div className="relative h-full w-full transform-gpu">
      {!loaded && <Skeleton className="absolute inset-0 z-[1] rounded-none" aria-hidden />}
      <Image
        key={`${displaySrc}-${retryKey}`}
        ref={assignImgRef}
        src={displaySrc}
        alt={alt}
        fill
        priority={desktopPriority || mobileEager}
        loading={
          isMobile ? (mobileEager ? "eager" : "lazy") : priority ? undefined : "lazy"
        }
        fetchPriority={isMobile && leadImage ? "high" : undefined}
        decoding={isMobile && leadImage ? "async" : undefined}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "object-cover transition-opacity duration-300 ease-out",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  );
}
