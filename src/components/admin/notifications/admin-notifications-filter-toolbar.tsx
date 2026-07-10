"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import type {
  NotificationPriorityFilter,
  NotificationReadFilter,
  NotificationSort,
  NotificationUiFilters,
} from "@/lib/admin/notifications-display";
import { NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "@/lib/notifications/constants";
import { Input } from "@/components/ui/input";
import type { NotificationType } from "@/types/database";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminNotificationsFilterToolbarProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  typeFilter: NotificationType | "all";
  onTypeChange: (type: NotificationType | "all") => void;
  readFilter: NotificationReadFilter;
  onReadChange: (read: NotificationReadFilter) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  uiFilters: NotificationUiFilters;
  onUiFiltersChange: (filters: NotificationUiFilters) => void;
  onReset: () => void;
  isPending?: boolean;
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex min-w-[8.5rem] flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-medium text-surface-800 shadow-sm outline-none transition-colors focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterFields({
  typeFilter,
  onTypeChange,
  readFilter,
  onReadChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  uiFilters,
  onUiFiltersChange,
  labels,
}: {
  typeFilter: NotificationType | "all";
  onTypeChange: (type: NotificationType | "all") => void;
  readFilter: NotificationReadFilter;
  onReadChange: (read: NotificationReadFilter) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  uiFilters: NotificationUiFilters;
  onUiFiltersChange: (filters: NotificationUiFilters) => void;
  labels: {
    type: string;
    priority: string;
    status: string;
    date: string;
    sort: string;
    typeOptions: { value: string; label: string }[];
    priorityOptions: { value: string; label: string }[];
    statusOptions: { value: string; label: string }[];
    sortOptions: { value: string; label: string }[];
    dateFrom: string;
    dateTo: string;
  };
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <FilterSelect
        label={labels.type}
        value={typeFilter}
        onChange={(value) => onTypeChange(value as NotificationType | "all")}
        options={labels.typeOptions}
      />
      <FilterSelect
        label={labels.priority}
        value={uiFilters.priority}
        onChange={(value) =>
          onUiFiltersChange({ ...uiFilters, priority: value as NotificationPriorityFilter })
        }
        options={labels.priorityOptions}
      />
      <FilterSelect
        label={labels.status}
        value={readFilter}
        onChange={(value) => onReadChange(value as NotificationReadFilter)}
        options={labels.statusOptions}
      />
      <div className="flex min-w-[8.5rem] flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-400">
          {labels.date}
        </span>
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)}
            aria-label={labels.dateFrom}
            className="h-9 min-w-0 flex-1 text-xs"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
            aria-label={labels.dateTo}
            className="h-9 min-w-0 flex-1 text-xs"
          />
        </div>
      </div>
      <FilterSelect
        label={labels.sort}
        value={uiFilters.sort}
        onChange={(value) =>
          onUiFiltersChange({ ...uiFilters, sort: value as NotificationSort })
        }
        options={labels.sortOptions}
      />
    </div>
  );
}

export function AdminNotificationsFilterToolbar({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  typeFilter,
  onTypeChange,
  readFilter,
  onReadChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  uiFilters,
  onUiFiltersChange,
  onReset,
  isPending,
}: AdminNotificationsFilterToolbarProps) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const typeLabel = (type: NotificationType) => {
    const labels = t.admin.notifications.types as Record<string, string>;
    return labels[type] ?? type;
  };

  const priorityLabel = (priority: string) => {
    const labels = t.admin.notifications.priorities as Record<string, string>;
    return labels[priority] ?? priority;
  };

  const labels = {
    type: t.admin.notifications.filters.type,
    priority: t.admin.notifications.filters.priority,
    status: t.admin.notifications.filters.status,
    date: t.admin.notifications.filters.date,
    sort: t.admin.notifications.filters.sort,
    reset: t.admin.notifications.filters.reset,
    openFilters: t.admin.notifications.filters.openFilters,
    apply: t.admin.notifications.filters.apply,
    search: t.admin.notifications.searchButton,
    dateFrom: t.admin.notifications.filters.dateFrom,
    dateTo: t.admin.notifications.filters.dateTo,
    typeOptions: [
      { value: "all", label: t.admin.notifications.filterAllTypes },
      ...NOTIFICATION_TYPES.map((type) => ({ value: type, label: typeLabel(type) })),
    ],
    priorityOptions: [
      { value: "all", label: t.admin.notifications.filters.all },
      ...NOTIFICATION_PRIORITIES.map((priority) => ({
        value: priority,
        label: priorityLabel(priority),
      })),
    ],
    statusOptions: [
      { value: "all", label: t.admin.notifications.filterAllRead },
      { value: "unread", label: t.admin.notifications.filterUnread },
      { value: "read", label: t.admin.notifications.filterRead },
    ],
    sortOptions: [
      { value: "newest", label: t.admin.notifications.filters.sortNewest },
      { value: "oldest", label: t.admin.notifications.filters.sortOldest },
    ],
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="space-y-4 rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400"
              aria-hidden
            />
            <Input
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSearchSubmit();
              }}
              placeholder={t.admin.notifications.searchPlaceholder}
              className="h-11 rounded-xl border-surface-200 bg-surface-50/50 ps-12 text-sm shadow-inner"
            />
            {isPending && (
              <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-surface-400">
                …
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onSearchSubmit}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {labels.search}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white px-4 text-sm font-semibold text-surface-700 transition-colors hover:bg-surface-50"
          >
            <RotateCcw className="h-4 w-4" />
            {labels.reset}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white px-4 text-sm font-semibold text-surface-700 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {labels.openFilters}
          </button>
        </div>

        <div className="hidden lg:block">
          <FilterFields
            typeFilter={typeFilter}
            onTypeChange={onTypeChange}
            readFilter={readFilter}
            onReadChange={onReadChange}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
            uiFilters={uiFilters}
            onUiFiltersChange={onUiFiltersChange}
            labels={labels}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label={t.admin.notifications.filters.close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed inset-x-0 bottom-0 z-[60] max-h-[85vh] overflow-y-auto rounded-t-3xl border border-surface-200 bg-white p-5 shadow-2xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-surface-900">{labels.openFilters}</h3>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterFields
                typeFilter={typeFilter}
                onTypeChange={onTypeChange}
                readFilter={readFilter}
                onReadChange={onReadChange}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={onDateFromChange}
                onDateToChange={onDateToChange}
                uiFilters={uiFilters}
                onUiFiltersChange={onUiFiltersChange}
                labels={labels}
              />
              <button
                type="button"
                onClick={() => {
                  onSearchSubmit();
                  setMobileOpen(false);
                }}
                className="mt-5 w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white"
              >
                {labels.apply}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
