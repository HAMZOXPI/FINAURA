"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";
import { MotionSection, MotionStagger, MotionItem } from "@/components/home/motion-section";
import { cn } from "@/lib/utils";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const AUTO_SCROLL_MS = 4000;
const RESUME_AFTER_MS = 5000;
const SCROLL_ANIMATION_MS = 700;

function TestimonialCard({
  item,
  variant,
  isActive = false,
}: {
  item: Testimonial;
  variant: "mobile" | "desktop";
  isActive?: boolean;
}) {
  const isMobile = variant === "mobile";

  return (
    <figure
      className={cn(
        "flex h-full flex-col border border-surface-200/80 bg-white",
        isMobile && [
          "rounded-[20px] p-4",
          "transition-[transform,opacity,box-shadow] duration-700 ease-out",
          isActive
            ? "scale-100 opacity-100 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.14)] active:scale-[0.98]"
            : "scale-[0.96] opacity-[0.88] shadow-[0_4px_18px_-10px_rgba(0,0,0,0.08)]",
        ],
        !isMobile && [
          "rounded-3xl p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.12)]",
        ]
      )}
    >
      <Quote
        className={cn(
          "text-brand-200",
          isMobile ? "h-6 w-6 opacity-55" : "h-8 w-8 opacity-100"
        )}
      />
      <blockquote
        className={cn(
          "text-surface-600",
          isMobile
            ? "mt-2.5 line-clamp-3 text-sm leading-snug transition-opacity duration-700 ease-out"
            : "mt-4 flex-1 text-base leading-relaxed"
        )}
      >
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <figcaption
        className={cn(
          "border-t border-surface-100",
          isMobile ? "mt-3 pt-3" : "mt-6 pt-6"
        )}
      >
        <p className="text-base font-semibold text-surface-900">{item.name}</p>
        <p
          className={cn(
            "text-surface-500",
            isMobile ? "mt-0.5 text-[13px] font-medium" : "mt-1 text-sm"
          )}
        >
          {item.role}
        </p>
      </figcaption>
    </figure>
  );
}

function TestimonialsMobileCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const pausedRef = useRef(false);
  const isAutoScrollingRef = useRef(false);
  const autoIntervalRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<number | null>(null);
  const scrollEndTimeoutRef = useRef<number | null>(null);

  const clearAutoInterval = useCallback(() => {
    if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    }
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;

    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;

    isAutoScrollingRef.current = true;
    el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });

    if (scrollEndTimeoutRef.current) {
      clearTimeout(scrollEndTimeoutRef.current);
    }
    scrollEndTimeoutRef.current = window.setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, SCROLL_ANIMATION_MS);
  }, []);

  const startAutoScroll = useCallback(() => {
    clearAutoInterval();
    autoIntervalRef.current = window.setInterval(() => {
      if (pausedRef.current) return;
      const next = (activeIndexRef.current + 1) % testimonials.length;
      scrollToIndex(next);
    }, AUTO_SCROLL_MS);
  }, [clearAutoInterval, scrollToIndex, testimonials.length]);

  const pauseAutoScroll = useCallback(() => {
    pausedRef.current = true;
    clearAutoInterval();
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, [clearAutoInterval]);

  const scheduleResume = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = window.setTimeout(() => {
      pausedRef.current = false;
      startAutoScroll();
    }, RESUME_AFTER_MS);
  }, [startAutoScroll]);

  const handleScroll = useCallback(() => {
    if (!isAutoScrollingRef.current) {
      pauseAutoScroll();
      scheduleResume();
    }
  }, [pauseAutoScroll, scheduleResume]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex: number | null = null;
        let bestRatio = 0;

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (Number.isNaN(index)) return;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = index;
          }
        });

        if (bestIndex !== null && bestRatio >= 0.5) {
          setActiveIndex(bestIndex);
          activeIndexRef.current = bestIndex;
        }
      },
      { root: el, threshold: [0.5, 0.65, 0.8, 1] }
    );

    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [testimonials.length]);

  useEffect(() => {
    startAutoScroll();
    return () => {
      clearAutoInterval();
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      if (scrollEndTimeoutRef.current) clearTimeout(scrollEndTimeoutRef.current);
    };
  }, [startAutoScroll, clearAutoInterval]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "mt-14 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      )}
      onTouchStart={pauseAutoScroll}
      onTouchEnd={scheduleResume}
      onTouchCancel={scheduleResume}
      onPointerDown={pauseAutoScroll}
      onPointerUp={scheduleResume}
      onPointerCancel={scheduleResume}
      onScroll={handleScroll}
    >
      {testimonials.map((item, index) => (
        <div
          key={index}
          data-index={index}
          className="w-[calc((100%-0.75rem)/1.1)] shrink-0 snap-start"
        >
          <TestimonialCard item={item} variant="mobile" isActive={activeIndex === index} />
        </div>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const { t } = useTranslation();

  const testimonials: Testimonial[] = [
    {
      quote: t.home.testimonial1Quote,
      name: t.home.testimonial1Name,
      role: t.home.testimonial1Role,
    },
    {
      quote: t.home.testimonial2Quote,
      name: t.home.testimonial2Name,
      role: t.home.testimonial2Role,
    },
    {
      quote: t.home.testimonial3Quote,
      name: t.home.testimonial3Name,
      role: t.home.testimonial3Role,
    },
  ];

  return (
    <section className="bg-gradient-to-b from-surface-50 to-white py-20 lg:py-28">
      <div className="container-app">
        <MotionSection className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
            {t.home.testimonialsTitle}
          </h2>
          <p className="mt-4 text-lg text-surface-500">{t.home.testimonialsSubtitle}</p>
        </MotionSection>

        <div className="md:hidden">
          <TestimonialsMobileCarousel testimonials={testimonials} />
        </div>

        <MotionStagger className="mt-14 hidden gap-6 md:grid lg:grid-cols-3 lg:gap-8">
          {testimonials.map((item, index) => (
            <MotionItem key={index}>
              <TestimonialCard item={item} variant="desktop" />
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
