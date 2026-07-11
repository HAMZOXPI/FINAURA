"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Home,
  Landmark,
  Map,
  Sparkles,
  Store,
  Trees,
} from "lucide-react";
import type { PropertyType } from "@/types/database";
import { useTranslation } from "@/i18n/locale-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import { PROPERTY_TYPE_VALUES } from "@/lib/constants";
import { cn, getPropertyTypeLabel } from "@/lib/utils";
import { MotionSection, MotionItem } from "@/components/home/motion-section";

const CATEGORY_ICONS: Record<PropertyType, typeof Building2> = {
  appartement: Building2,
  villa: Landmark,
  maison: Home,
  terrain: Map,
  local_commercial: Store,
  bureau: Briefcase,
  ferme: Trees,
  riad: Sparkles,
};

const CATEGORY_STYLES = [
  {
    gradient: "from-amber-400/20 via-amber-100/40 to-orange-50/60",
    icon: "text-amber-700",
    glow: "group-hover/card:shadow-[0_0_20px_rgba(245,158,11,0.25)]",
  },
  {
    gradient: "from-brand-400/20 via-brand-100/40 to-sky-50/60",
    icon: "text-brand-700",
    glow: "group-hover/card:shadow-[0_0_20px_rgba(0,105,198,0.22)]",
  },
  {
    gradient: "from-emerald-400/20 via-emerald-100/40 to-teal-50/60",
    icon: "text-emerald-700",
    glow: "group-hover/card:shadow-[0_0_20px_rgba(16,185,129,0.22)]",
  },
  {
    gradient: "from-violet-400/20 via-violet-100/40 to-purple-50/60",
    icon: "text-violet-700",
    glow: "group-hover/card:shadow-[0_0_20px_rgba(139,92,246,0.22)]",
  },
  {
    gradient: "from-rose-400/20 via-rose-100/40 to-pink-50/60",
    icon: "text-rose-700",
    glow: "group-hover/card:shadow-[0_0_20px_rgba(244,63,94,0.22)]",
  },
  {
    gradient: "from-sky-400/20 via-sky-100/40 to-blue-50/60",
    icon: "text-sky-700",
    glow: "group-hover/card:shadow-[0_0_20px_rgba(14,165,233,0.22)]",
  },
  {
    gradient: "from-lime-400/20 via-lime-100/40 to-green-50/60",
    icon: "text-lime-700",
    glow: "group-hover/card:shadow-[0_0_20px_rgba(132,204,22,0.22)]",
  },
  {
    gradient: "from-fuchsia-400/20 via-fuchsia-100/40 to-purple-50/60",
    icon: "text-fuchsia-700",
    glow: "group-hover/card:shadow-[0_0_20px_rgba(217,70,239,0.22)]",
  },
] as const;

const SCROLL_HINT_STORAGE_KEY = "finaura:categories-scroll-hint-done";
const SCROLL_HINT_OFFSET_PX = 26;
const SCROLL_HINT_HOLD_MS = 600;

/**
 * Mobile-only horizontal scroller with a one-time peek animation that hints
 * more cards exist off-screen. Disabled after manual interaction or completion.
 */
function CategoryCardsScroller({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hintActiveRef = useRef(false);
  const cancelledRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const clearHintTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const markHintDone = useCallback(() => {
    cancelledRef.current = true;
    hintActiveRef.current = false;
    clearHintTimeouts();
    try {
      sessionStorage.setItem(SCROLL_HINT_STORAGE_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  }, [clearHintTimeouts]);

  const runScrollHint = useCallback(
    (el: HTMLDivElement) => {
      if (cancelledRef.current) return;

      if (el.scrollWidth <= el.clientWidth + 1) {
        markHintDone();
        return;
      }

      const isRtl = document.documentElement.dir === "rtl";
      const peekOffset = isRtl ? -SCROLL_HINT_OFFSET_PX : SCROLL_HINT_OFFSET_PX;

      hintActiveRef.current = true;
      el.scrollTo({ left: peekOffset, behavior: "smooth" });

      const returnTimeout = window.setTimeout(() => {
        if (cancelledRef.current) return;
        el.scrollTo({ left: 0, behavior: "smooth" });

        const doneTimeout = window.setTimeout(() => {
          hintActiveRef.current = false;
          markHintDone();
        }, 450);

        timeoutsRef.current.push(doneTimeout);
      }, SCROLL_HINT_HOLD_MS);

      timeoutsRef.current.push(returnTimeout);
    },
    [markHintDone]
  );

  useEffect(() => {
    if (!isMobile) return;

    let alreadyDone = false;
    try {
      alreadyDone = sessionStorage.getItem(SCROLL_HINT_STORAGE_KEY) === "1";
    } catch {
      /* storage unavailable */
    }

    if (alreadyDone) {
      cancelledRef.current = true;
      return;
    }

    const el = scrollRef.current;
    if (!el) return;

    const onUserIntent = () => {
      markHintDone();
    };

    el.addEventListener("touchstart", onUserIntent, { passive: true });
    el.addEventListener("pointerdown", onUserIntent);
    el.addEventListener("wheel", onUserIntent, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || cancelledRef.current) return;
        observer.disconnect();

        const startTimeout = window.setTimeout(() => {
          if (!cancelledRef.current && scrollRef.current) {
            runScrollHint(scrollRef.current);
          }
        }, 450);

        timeoutsRef.current.push(startTimeout);
      },
      { threshold: 0.35 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      clearHintTimeouts();
      el.removeEventListener("touchstart", onUserIntent);
      el.removeEventListener("pointerdown", onUserIntent);
      el.removeEventListener("wheel", onUserIntent);
    };
  }, [isMobile, clearHintTimeouts, markHintDone, runScrollHint]);

  return (
    <motion.div
      ref={scrollRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function CategoriesSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-app">
        <MotionSection className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
            {t.home.categoriesEyebrow}
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
            {t.home.categoriesTitle}
          </h2>
          <p className="mt-4 text-lg text-surface-500">{t.home.categoriesSubtitle}</p>
        </MotionSection>

        <CategoryCardsScroller
          className={cn(
            "mt-16 gap-4",
            "flex snap-x snap-mandatory overflow-x-auto pb-3",
            "-mx-4 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            "md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 lg:gap-5"
          )}
        >
          {PROPERTY_TYPE_VALUES.map((type, index) => {
            const Icon = CATEGORY_ICONS[type];
            const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];

            return (
              <MotionItem
                key={type}
                className="w-[150px] shrink-0 snap-start md:w-auto md:shrink"
              >
                <Link
                  href={`/properties?property_type=${type}`}
                  className={cn(
                    "group/card relative flex h-[155px] w-full flex-col justify-between",
                    "rounded-[20px] border border-surface-200/80 bg-white p-4",
                    "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.05)]",
                    "transition-all duration-[250ms] ease-out",
                    "hover:-translate-y-1.5 hover:scale-[1.02] hover:border-brand-300/80",
                    "hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,105,198,0.12)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2",
                    "focus-visible:-translate-y-1.5 focus-visible:scale-[1.02] focus-visible:border-brand-300/80",
                    "focus-visible:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,105,198,0.12)]"
                  )}
                >
                  <div>
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full",
                        "bg-gradient-to-br backdrop-blur-sm",
                        "ring-1 ring-white/70",
                        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]",
                        "transition-all duration-[250ms] ease-out",
                        style.gradient,
                        style.glow,
                        "group-hover/card:scale-105 group-focus-visible/card:scale-105",
                        "group-hover/card:ring-brand-200/50 group-focus-visible/card:ring-brand-200/50"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-8 w-8 transition-transform duration-[250ms] ease-out sm:h-9 sm:w-9",
                          "group-hover/card:rotate-[4deg] group-focus-visible/card:rotate-[4deg]",
                          style.icon
                        )}
                        strokeWidth={1.75}
                      />
                    </div>

                    <span className="mt-3 block text-base font-semibold leading-snug text-surface-900 transition-colors duration-[250ms] group-hover/card:text-brand-800 group-focus-visible/card:text-brand-800">
                      {getPropertyTypeLabel(type, t)}
                    </span>
                    <span className="mt-1 block text-sm font-medium text-surface-400 transition-colors duration-[250ms] group-hover/card:text-brand-600 group-focus-visible/card:text-brand-600">
                      {t.home.categoriesExplore}
                    </span>
                  </div>

                  <ArrowUpRight
                    className={cn(
                      "absolute bottom-3.5 end-3.5 h-4 w-4 text-brand-500/0",
                      "transition-all duration-[250ms] ease-out",
                      "group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 group-hover/card:text-brand-600/90",
                      "group-focus-visible/card:translate-x-0.5 group-focus-visible/card:-translate-y-0.5 group-focus-visible/card:text-brand-600/90",
                      "opacity-0 group-hover/card:opacity-100 group-focus-visible/card:opacity-100"
                    )}
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </Link>
              </MotionItem>
            );
          })}
        </CategoryCardsScroller>
      </div>
    </section>
  );
}
