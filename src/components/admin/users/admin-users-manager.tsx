"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Shield, UserCheck, UserPlus, Users, UserX } from "lucide-react";
import { searchUsersForGift } from "@/actions/admin-promotion.actions";
import type { AdminActivityItem, AdminDashboardStats } from "@/services/admin.service";
import type { AdminUsersTableRow } from "@/lib/admin/users-display";
import {
  applyAdvancedUserFilters,
  dedupeUsers,
  DEFAULT_USERS_FILTER_STATE,
  filterUsersBySearch,
  getTotalPages,
  hasActiveFilters,
  paginateUsers,
  sortUsers,
  type ActiveFilterChip,
  type AdminUsersFilterState,
} from "@/lib/admin/users-display";
import { useTranslation } from "@/i18n/locale-provider";
import { AdminUserDetailsDrawer } from "@/components/admin/users/admin-user-details-drawer";
import { AdminUsersActiveChips } from "@/components/admin/users/admin-users-active-chips";
import { AdminUsersBulkBar } from "@/components/admin/users/admin-users-bulk-bar";
import { AdminUsersFilterToolbar } from "@/components/admin/users/admin-users-filter-toolbar";
import { AdminUsersPagination } from "@/components/admin/users/admin-users-pagination";
import { AdminUsersStats } from "@/components/admin/users/admin-users-stats";
import { AdminUsersTable } from "@/components/admin/users/admin-users-table";

interface AdminUsersManagerProps {
  stats: AdminDashboardStats;
  initialUsers: AdminUsersTableRow[];
  activity: AdminActivityItem[];
}

export function AdminUsersManager({ stats, initialUsers, activity }: AdminUsersManagerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<AdminUsersFilterState>(DEFAULT_USERS_FILTER_STATE);
  const [users, setUsers] = useState<AdminUsersTableRow[]>(initialUsers);
  const [searchLoading, setSearchLoading] = useState(false);
  const [remoteSearch, setRemoteSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUsersTableRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setRemoteSearch(false);
      setUsers(initialUsers);
      return;
    }

    setSearchLoading(true);
    const timer = window.setTimeout(async () => {
      const result = await searchUsersForGift(trimmed);
      if ("users" in result && result.users) {
        setUsers(
          dedupeUsers(
            result.users.map((user) => ({
              ...user,
              created_at: null,
            }))
          )
        );
        setRemoteSearch(true);
      }
      setSearchLoading(false);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [query, initialUsers]);

  const filteredUsers = useMemo(() => {
    const searched = remoteSearch ? users : filterUsersBySearch(users, query);
    const filtered = applyAdvancedUserFilters(searched, filters);
    return sortUsers(filtered, filters.sort);
  }, [users, query, filters, remoteSearch]);

  const totalPages = getTotalPages(filteredUsers.length, pageSize);
  const currentPage = Math.min(page, totalPages);

  const paginatedUsers = useMemo(
    () => paginateUsers(filteredUsers, currentPage, pageSize),
    [filteredUsers, currentPage, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [query, filters, pageSize, remoteSearch]);

  const emptyVariant = useMemo(() => {
    if (filteredUsers.length > 0) return "none" as const;
    if (initialUsers.length === 0) return "empty" as const;
    if (query.trim().length >= 2 || remoteSearch) return "search" as const;
    if (hasActiveFilters(filters)) return "filter" as const;
    return "empty" as const;
  }, [filteredUsers.length, initialUsers.length, query, remoteSearch, filters]);

  const activeChips = useMemo((): ActiveFilterChip[] => {
    const chips: ActiveFilterChip[] = [];
    const add = (key: string, label: string, reset: Partial<AdminUsersFilterState>) => {
      chips.push({
        key,
        label,
        onRemove: () => setFilters((current) => ({ ...current, ...reset })),
      });
    };

    if (filters.role !== "all") {
      const map: Record<string, string> = {
        individuals: t.admin.users.filterIndividuals,
        agents: t.admin.users.filterAgents,
        agencies: t.admin.users.filterAgencies,
        admins: t.admin.users.filterAdmins,
      };
      add("role", map[filters.role] ?? filters.role, { role: "all" });
    }
    if (filters.verification !== "all") {
      const map: Record<string, string> = {
        verified: t.admin.users.filters.verified,
        pending: t.admin.users.filters.pending,
        rejected: t.admin.users.filters.rejected,
      };
      add("verification", map[filters.verification] ?? filters.verification, {
        verification: "all",
      });
    }
    if (filters.premium !== "all") {
      const map: Record<string, string> = {
        premium: t.admin.users.filterPremium,
        standard: t.admin.users.filters.standard,
        enterprise: t.admin.users.filters.enterprise,
      };
      add("premium", map[filters.premium] ?? filters.premium, { premium: "all" });
    }
    if (filters.status !== "all") {
      const map: Record<string, string> = {
        active: t.admin.users.filters.active,
        offline: t.admin.users.filters.offline,
        suspended: t.admin.users.filterSuspended,
      };
      add("status", map[filters.status] ?? filters.status, { status: "all" });
    }
    if (filters.joinDate !== "all") {
      const map: Record<string, string> = {
        today: t.admin.users.filters.today,
        "7d": t.admin.users.filters.last7Days,
        "30d": t.admin.users.filters.last30Days,
        custom: t.admin.users.filters.custom,
      };
      add("joinDate", map[filters.joinDate] ?? filters.joinDate, { joinDate: "all" });
    }
    if (filters.sort !== "newest") {
      const map: Record<string, string> = {
        oldest: t.admin.users.filters.sortOldest,
        name_asc: t.admin.users.filters.sortNameAsc,
        name_desc: t.admin.users.filters.sortNameDesc,
        most_listings: t.admin.users.filters.sortMostListings,
        premium_first: t.admin.users.filters.sortPremiumFirst,
      };
      add("sort", map[filters.sort] ?? filters.sort, { sort: "newest" });
    }

    return chips;
  }, [filters, t]);

  const allPageSelected =
    paginatedUsers.length > 0 && paginatedUsers.every((user) => selectedIds.has(user.id));
  const somePageSelected = paginatedUsers.some((user) => selectedIds.has(user.id));

  const toggleSelect = useCallback((userId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  const toggleSelectAllPage = useCallback(() => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = paginatedUsers.every((user) => next.has(user.id));
      for (const user of paginatedUsers) {
        if (allSelected) next.delete(user.id);
        else next.add(user.id);
      }
      return next;
    });
  }, [paginatedUsers]);

  const handleReset = useCallback(() => {
    setQuery("");
    setFilters(DEFAULT_USERS_FILTER_STATE);
    setSelectedIds(new Set());
    setPage(1);
  }, []);

  const statCards = useMemo(
    () => [
      {
        label: t.admin.users.statTotal,
        value: stats.totalUsers,
        icon: Users,
        accent: "bg-indigo-50 text-indigo-600",
        delay: 0.04,
      },
      {
        label: t.admin.users.statNew,
        value: null,
        icon: UserPlus,
        accent: "bg-emerald-50 text-emerald-600",
        delay: 0.08,
      },
      {
        label: t.admin.users.statVerified,
        value: null,
        icon: UserCheck,
        accent: "bg-green-50 text-green-600",
        delay: 0.12,
      },
      {
        label: t.admin.users.statPremium,
        value: stats.premiumUsers,
        icon: Shield,
        accent: "bg-amber-50 text-amber-600",
        delay: 0.16,
      },
      {
        label: t.admin.users.statSuspended,
        value: null,
        icon: UserX,
        accent: "bg-red-50 text-red-600",
        delay: 0.2,
      },
      {
        label: t.admin.users.statAdmins,
        value: null,
        icon: Shield,
        accent: "bg-blue-50 text-blue-600",
        delay: 0.24,
      },
    ],
    [stats, t]
  );

  return (
    <div className="space-y-6 pb-24">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
            <span aria-hidden>👥</span>
            {t.admin.users.title}
          </h1>
          <p className="mt-2 text-surface-500">{t.admin.users.subtitle}</p>
        </div>

        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-semibold text-surface-400 opacity-70 shadow-sm"
        >
          <Download className="h-4 w-4" />
          {t.admin.users.export}
        </button>
      </motion.header>

      <AdminUsersStats cards={statCards} />

      <AdminUsersFilterToolbar
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleReset}
        searchLoading={searchLoading}
      />

      <AdminUsersActiveChips chips={activeChips} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.35 }}
        className="overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"
      >
        <AdminUsersTable
          users={paginatedUsers}
          emptyVariant={emptyVariant}
          onSelectUser={setSelectedUser}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAllPage}
          allPageSelected={allPageSelected}
          somePageSelected={somePageSelected}
        />

        <AdminUsersPagination
          page={currentPage}
          pageSize={pageSize}
          total={filteredUsers.length}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </motion.div>

      <AdminUserDetailsDrawer
        user={selectedUser}
        activity={activity}
        onClose={() => setSelectedUser(null)}
      />

      <AdminUsersBulkBar
        selectedCount={selectedIds.size}
        onDeselectAll={() => setSelectedIds(new Set())}
      />
    </div>
  );
}
