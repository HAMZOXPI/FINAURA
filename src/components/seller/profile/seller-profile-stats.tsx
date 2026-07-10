"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Clock,
  Eye,
  Heart,
  Home,
  MessageSquare,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { SellerPublicProfile } from "@/types/database";
import { cn, interpolate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

function AnimatedStat({ value, numericValue }: { value: string; numericValue?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || numericValue === undefined) {
      setDisplay(value);
      return;
    }

    const duration = 700;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(String(Math.round(numericValue * eased)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, numericValue, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {numericValue !== undefined && inView && !value.includes("%") && !value.includes("h")
        ? display
        : value}
    </span>
  );
}

interface SellerProfileStatsProps {
  seller: SellerPublicProfile;
}

export function SellerProfileStats({ seller }: SellerProfileStatsProps) {
  const { t } = useTranslation();

  const stats: {
    key: string;
    label: string;
    value: string;
    numericValue?: number;
    icon: LucideIcon;
    comingSoon?: boolean;
  }[] = [
    {
      key: "listings",
      label: t.seller.totalListings,
      value: String(seller.stats.totalListings),
      numericValue: seller.stats.totalListings,
      icon: Home,
    },
    {
      key: "sold",
      label: t.seller.listingsSold,
      value: String(seller.stats.listingsSold),
      numericValue: seller.stats.listingsSold,
      icon: Trophy,
    },
    {
      key: "response",
      label: t.seller.responseRate,
      value: `${Math.round(seller.stats.responseRate)}%`,
      numericValue: Math.round(seller.stats.responseRate),
      icon: TrendingUp,
    },
    {
      key: "time",
      label: t.seller.responseTime,
      value: interpolate(t.seller.withinHours, { hours: seller.stats.avgResponseTimeHours }),
      icon: Clock,
    },
    {
      key: "reviews",
      label: t.seller.totalReviews,
      value: String(seller.stats.totalReviews),
      numericValue: seller.stats.totalReviews,
      icon: MessageSquare,
    },
    {
      key: "views",
      label: t.seller.profileViews,
      value: t.seller.comingSoon,
      icon: Eye,
      comingSoon: true,
    },
    {
      key: "followers",
      label: t.seller.followers,
      value: t.seller.comingSoon,
      icon: Heart,
      comingSoon: true,
    },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      aria-labelledby="seller-stats-heading"
    >
      <h2 id="seller-stats-heading" className="sr-only">
        {t.seller.statsHeading}
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.key}
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="group rounded-[20px] border border-surface-200/80 bg-white p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-[250ms] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_12px_32px_-10px_rgba(0,105,198,0.12)]"
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-[250ms] group-hover:bg-brand-100",
                stat.comingSoon && "bg-surface-100 text-surface-400"
              )}
            >
              <stat.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-surface-500">
              {stat.label}
            </p>
            <p
              className={cn(
                "mt-1 text-xl font-bold text-surface-900",
                stat.comingSoon && "text-sm font-semibold text-surface-400"
              )}
            >
              <AnimatedStat value={stat.value} numericValue={stat.numericValue} />
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
