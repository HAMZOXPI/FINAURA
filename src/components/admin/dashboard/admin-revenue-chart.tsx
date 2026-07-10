"use client";

import { motion } from "framer-motion";
import { LineChart } from "lucide-react";
import type { RevenueChartPoint } from "@/lib/admin/revenue-analytics";
import { useTranslation } from "@/i18n/locale-provider";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 240;
const PADDING = { top: 16, right: 12, bottom: 32, left: 12 };

function buildPath(points: RevenueChartPoint[]): string {
  if (points.length === 0) return "";

  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  const coordinates = points.map((point, index) => {
    const x =
      PADDING.left +
      (points.length === 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
    const y = PADDING.top + innerHeight - (point.value / maxValue) * innerHeight;
    return { x, y };
  });

  return coordinates
    .map((coord, index) => `${index === 0 ? "M" : "L"} ${coord.x} ${coord.y}`)
    .join(" ");
}

function buildAreaPath(points: RevenueChartPoint[]): string {
  const linePath = buildPath(points);
  if (!linePath) return "";

  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const baseline = PADDING.top + innerHeight;

  const lastX =
    points.length === 1
      ? PADDING.left + innerWidth / 2
      : PADDING.left + innerWidth;

  return `${linePath} L ${lastX} ${baseline} L ${PADDING.left} ${baseline} Z`;
}

interface AdminRevenueChartProps {
  points: RevenueChartPoint[];
}

export function AdminRevenueChart({ points }: AdminRevenueChartProps) {
  const { t } = useTranslation();

  if (points.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-surface-200 bg-surface-50/50 px-6 py-12 text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-full bg-blue-100/50 blur-2xl" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-surface-200/80">
            <LineChart className="h-7 w-7 text-blue-500" strokeWidth={1.75} />
          </div>
        </div>
        <p className="mt-6 text-base font-semibold text-surface-900">
          {t.admin.revenue.emptyTitle}
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-surface-500">
          {t.admin.revenue.emptySubtitle}
        </p>
      </motion.div>
    );
  }

  const linePath = buildPath(points);
  const areaPath = buildAreaPath(points);
  const maxLabels = 6;
  const labelStep = Math.max(1, Math.ceil(points.length / maxLabels));
  const visibleLabels = points.filter((_, index) => index % labelStep === 0 || index === points.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="h-full min-h-[280px] w-full"
    >
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="h-full w-full"
        role="img"
        aria-label={t.admin.revenue.chartAriaLabel}
      >
        <defs>
          <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59 130 246 / 0.22)" />
            <stop offset="100%" stopColor="rgb(59 130 246 / 0.02)" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((ratio) => {
          const y = PADDING.top + (CHART_HEIGHT - PADDING.top - PADDING.bottom) * ratio;
          return (
            <line
              key={ratio}
              x1={PADDING.left}
              x2={CHART_WIDTH - PADDING.right}
              y1={y}
              y2={y}
              stroke="rgb(226 232 240 / 0.9)"
              strokeDasharray="4 6"
            />
          );
        })}

        <motion.path
          d={areaPath}
          fill="url(#revenueAreaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        />

        <motion.path
          d={linePath}
          fill="none"
          stroke="rgb(59 130 246)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.6 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />

        {points.map((point, index) => {
          const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
          const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
          const maxValue = Math.max(...points.map((item) => item.value), 1);
          const x =
            PADDING.left +
            (points.length === 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
          const y = PADDING.top + innerHeight - (point.value / maxValue) * innerHeight;

          return (
            <motion.circle
              key={point.dateKey}
              cx={x}
              cy={y}
              r="4"
              fill="white"
              stroke="rgb(59 130 246)"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + index * 0.04, duration: 0.25 }}
            />
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
        {visibleLabels.map((point) => (
          <span key={point.dateKey} className="text-[11px] font-medium text-surface-400">
            {point.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
