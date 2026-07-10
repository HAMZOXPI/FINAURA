"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import type {
  AdminUsersFilterState,
  DateFilter,
  PremiumFilter,
  RoleFilter,
  SortOption,
  StatusFilter,
  VerificationFilter,
} from "@/lib/admin/users-display";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminUsersFilterToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  filters: AdminUsersFilterState;
  onFiltersChange: (filters: AdminUsersFilterState) => void;
  onReset: () => void;
  searchLoading?: boolean;
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
  filters,
  onFiltersChange,
  labels,
}: {
  filters: AdminUsersFilterState;
  onFiltersChange: (filters: AdminUsersFilterState) => void;
  labels: ReturnType<typeof useFilterLabels>;
}) {
  const patch = (partial: Partial<AdminUsersFilterState>) =>
    onFiltersChange({ ...filters, ...partial });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <FilterSelect
        label={labels.role}
        value={filters.role}
        onChange={(value) => patch({ role: value as RoleFilter })}
        options={labels.roleOptions}
      />
      <FilterSelect
        label={labels.verification}
        value={filters.verification}
        onChange={(value) => patch({ verification: value as VerificationFilter })}
        options={labels.verificationOptions}
      />
      <FilterSelect
        label={labels.premium}
        value={filters.premium}
        onChange={(value) => patch({ premium: value as PremiumFilter })}
        options={labels.premiumOptions}
      />
      <FilterSelect
        label={labels.status}
        value={filters.status}
        onChange={(value) => patch({ status: value as StatusFilter })}
        options={labels.statusOptions}
      />
      <FilterSelect
        label={labels.joinDate}
        value={filters.joinDate}
        onChange={(value) => patch({ joinDate: value as DateFilter })}
        options={labels.dateOptions}
      />
      <FilterSelect
        label={labels.sort}
        value={filters.sort}
        onChange={(value) => patch({ sort: value as SortOption })}
        options={labels.sortOptions}
      />
    </div>
  );
}

function useFilterLabels() {
  const { t } = useTranslation();

  return {
    role: t.admin.users.filters.role,
    verification: t.admin.users.filters.verification,
    premium: t.admin.users.filters.premium,
    status: t.admin.users.filters.status,
    joinDate: t.admin.users.filters.joinDate,
    sort: t.admin.users.filters.sort,
    reset: t.admin.users.filters.reset,
    openFilters: t.admin.users.filters.openFilters,
    roleOptions: [
      { value: "all", label: t.admin.users.filters.all },
      { value: "individuals", label: t.admin.users.filterIndividuals },
      { value: "agents", label: t.admin.users.filterAgents },
      { value: "agencies", label: t.admin.users.filterAgencies },
      { value: "admins", label: t.admin.users.filterAdmins },
    ],
    verificationOptions: [
      { value: "all", label: t.admin.users.filters.all },
      { value: "verified", label: t.admin.users.filters.verified },
      { value: "pending", label: t.admin.users.filters.pending },
      { value: "rejected", label: t.admin.users.filters.rejected },
    ],
    premiumOptions: [
      { value: "all", label: t.admin.users.filters.all },
      { value: "premium", label: t.admin.users.filterPremium },
      { value: "standard", label: t.admin.users.filters.standard },
      { value: "enterprise", label: t.admin.users.filters.enterprise },
    ],
    statusOptions: [
      { value: "all", label: t.admin.users.filters.all },
      { value: "active", label: t.admin.users.filters.active },
      { value: "offline", label: t.admin.users.filters.offline },
      { value: "suspended", label: t.admin.users.filterSuspended },
    ],
    dateOptions: [
      { value: "all", label: t.admin.users.filters.all },
      { value: "today", label: t.admin.users.filters.today },
      { value: "7d", label: t.admin.users.filters.last7Days },
      { value: "30d", label: t.admin.users.filters.last30Days },
      { value: "custom", label: t.admin.users.filters.custom },
    ],
    sortOptions: [
      { value: "newest", label: t.admin.users.filters.sortNewest },
      { value: "oldest", label: t.admin.users.filters.sortOldest },
      { value: "name_asc", label: t.admin.users.filters.sortNameAsc },
      { value: "name_desc", label: t.admin.users.filters.sortNameDesc },
      { value: "most_listings", label: t.admin.users.filters.sortMostListings },
      { value: "premium_first", label: t.admin.users.filters.sortPremiumFirst },
    ],
  };
}

export function AdminUsersFilterToolbar({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  onReset,
  searchLoading,
}: AdminUsersFilterToolbarProps) {
  const { t } = useTranslation();
  const labels = useFilterLabels();
  const [mobileOpen, setMobileOpen] = useState(false);

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
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={t.admin.users.searchPlaceholder}
              className="h-11 rounded-xl border-surface-200 bg-surface-50/50 ps-12 text-sm shadow-inner"
            />
            {searchLoading && (
              <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-surface-400">
                …
              </span>
            )}
          </div>

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
          <FilterFields filters={filters} onFiltersChange={onFiltersChange} labels={labels} />
        </div>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label={t.admin.users.drawer.close}
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
              <FilterFields filters={filters} onFiltersChange={onFiltersChange} labels={labels} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="mt-5 w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white"
              >
                {t.admin.users.filters.apply}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
