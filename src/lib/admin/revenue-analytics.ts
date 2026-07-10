import type { AdminBoostHistoryRow } from "@/services/admin-boost.service";

export type RevenueTimeRange = "today" | "week" | "month" | "year";

export interface RevenueChartPoint {
  label: string;
  value: number;
  dateKey: string;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

function getRangeStart(range: RevenueTimeRange, now = new Date()): Date {
  switch (range) {
    case "today":
      return startOfDay(now);
    case "week": {
      const start = startOfDay(now);
      start.setDate(start.getDate() - 6);
      return start;
    }
    case "month":
      return startOfMonth(now);
    case "year":
      return startOfYear(now);
  }
}

function filterRevenueRows(
  history: AdminBoostHistoryRow[],
  range: RevenueTimeRange,
  now = new Date()
): AdminBoostHistoryRow[] {
  const rangeStart = getRangeStart(range, now);

  return history.filter((row) => {
    if (row.amount <= 0) return false;
    const createdAt = new Date(row.createdAt);
    return createdAt >= rangeStart && createdAt <= now;
  });
}

function formatHourLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDayLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatMonthLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    month: "short",
  }).format(date);
}

export function buildRevenueChartPoints(
  history: AdminBoostHistoryRow[],
  range: RevenueTimeRange,
  locale = "fr"
): RevenueChartPoint[] {
  const rows = filterRevenueRows(history, range);
  if (rows.length === 0) return [];

  const buckets = new Map<string, { value: number; sortKey: number; label: string }>();

  for (const row of rows) {
    const createdAt = new Date(row.createdAt);
    let dateKey: string;
    let sortKey: number;
    let label: string;

    if (range === "today") {
      dateKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}-${createdAt.getDate()}-${createdAt.getHours()}`;
      sortKey = createdAt.getTime();
      label = formatHourLabel(createdAt, locale);
    } else if (range === "year") {
      dateKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      sortKey = new Date(createdAt.getFullYear(), createdAt.getMonth(), 1).getTime();
      label = formatMonthLabel(createdAt, locale);
    } else {
      dateKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}-${createdAt.getDate()}`;
      sortKey = startOfDay(createdAt).getTime();
      label = formatDayLabel(createdAt, locale);
    }

    const existing = buckets.get(dateKey);
    if (existing) {
      existing.value += row.amount;
    } else {
      buckets.set(dateKey, { value: row.amount, sortKey, label });
    }
  }

  return [...buckets.entries()]
    .map(([dateKey, bucket]) => ({
      dateKey,
      label: bucket.label,
      value: bucket.value,
    }))
    .sort((a, b) => {
      const aSort = buckets.get(a.dateKey)?.sortKey ?? 0;
      const bSort = buckets.get(b.dateKey)?.sortKey ?? 0;
      return aSort - bSort;
    });
}

export function getAverageTransaction(history: AdminBoostHistoryRow[]): number | null {
  const amounts = history.filter((row) => row.amount > 0).map((row) => row.amount);
  if (amounts.length === 0) return null;
  return amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
}

export function getFilteredRevenueTotal(
  history: AdminBoostHistoryRow[],
  range: RevenueTimeRange
): number {
  return filterRevenueRows(history, range).reduce((sum, row) => sum + row.amount, 0);
}

export function getBoostRevenueShare(boostRevenue: number, totalKnownRevenue: number): number | null {
  if (totalKnownRevenue <= 0 || boostRevenue <= 0) return null;
  return Math.round((boostRevenue / totalKnownRevenue) * 100);
}
