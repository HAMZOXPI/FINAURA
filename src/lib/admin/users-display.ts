import type { AdminGiftRecipient } from "@/services/admin-promotion.service";

export type AdminUsersFilter =
  | "all"
  | "individuals"
  | "agents"
  | "agencies"
  | "verified"
  | "premium"
  | "admins"
  | "suspended"
  | "pending_verification";

export type RoleFilter = "all" | "individuals" | "agents" | "agencies" | "admins";
export type VerificationFilter = "all" | "verified" | "pending" | "rejected";
export type PremiumFilter = "all" | "premium" | "standard" | "enterprise";
export type StatusFilter = "all" | "active" | "offline" | "suspended";
export type DateFilter = "all" | "today" | "7d" | "30d" | "custom";
export type SortOption =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "most_listings"
  | "premium_first";

export interface AdminUsersFilterState {
  role: RoleFilter;
  verification: VerificationFilter;
  premium: PremiumFilter;
  status: StatusFilter;
  joinDate: DateFilter;
  sort: SortOption;
}

export const DEFAULT_USERS_FILTER_STATE: AdminUsersFilterState = {
  role: "all",
  verification: "all",
  premium: "all",
  status: "all",
  joinDate: "all",
  sort: "newest",
};

export interface AdminUsersTableRow extends AdminGiftRecipient {
  created_at?: string | null;
}

export function isPremiumUser(user: AdminGiftRecipient): boolean {
  const slug = user.plan_slug ?? "free";
  return slug === "pro" || slug === "enterprise";
}

export function isEnterpriseUser(user: AdminGiftRecipient): boolean {
  return user.plan_slug === "enterprise";
}

function getDisplayName(user: AdminUsersTableRow): string {
  return (user.full_name || user.email || "").toLowerCase();
}

function isWithinJoinDate(user: AdminUsersTableRow, filter: DateFilter): boolean {
  if (filter === "all" || filter === "custom") return true;
  if (!user.created_at) return false;

  const created = new Date(user.created_at);
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  if (filter === "today") return created >= startOfToday;

  const days = filter === "7d" ? 7 : 30;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return created >= cutoff;
}

export function applyAdvancedUserFilters(
  users: AdminUsersTableRow[],
  filters: AdminUsersFilterState
): AdminUsersTableRow[] {
  return users.filter((user) => {
    if (filters.role !== "all") return false;
    if (filters.verification !== "all") return false;
    if (filters.status !== "all") return false;

    if (filters.premium === "premium" && !isPremiumUser(user)) return false;
    if (filters.premium === "standard" && isPremiumUser(user)) return false;
    if (filters.premium === "enterprise" && !isEnterpriseUser(user)) return false;

    if (!isWithinJoinDate(user, filters.joinDate)) return false;

    return true;
  });
}

export function sortUsers(
  users: AdminUsersTableRow[],
  sort: SortOption
): AdminUsersTableRow[] {
  const list = [...users];

  switch (sort) {
    case "newest":
      return list.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });
    case "oldest":
      return list.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
    case "name_asc":
      return list.sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b)));
    case "name_desc":
      return list.sort((a, b) => getDisplayName(b).localeCompare(getDisplayName(a)));
    case "premium_first":
      return list.sort((a, b) => {
        const aPremium = isPremiumUser(a) ? 1 : 0;
        const bPremium = isPremiumUser(b) ? 1 : 0;
        return bPremium - aPremium;
      });
    case "most_listings":
      return list;
    default:
      return list;
  }
}

export function filterUsersBySearch(
  users: AdminUsersTableRow[],
  query: string
): AdminUsersTableRow[] {
  const term = query.trim().toLowerCase();
  if (!term) return users;

  return users.filter((user) => {
    const name = user.full_name?.toLowerCase() ?? "";
    const email = user.email.toLowerCase();
    const id = user.id.toLowerCase();
    return name.includes(term) || email.includes(term) || id.includes(term);
  });
}

export function dedupeUsers(users: AdminUsersTableRow[]): AdminUsersTableRow[] {
  const map = new Map<string, AdminUsersTableRow>();
  for (const user of users) {
    map.set(user.id, { ...map.get(user.id), ...user });
  }
  return [...map.values()];
}

export function hasActiveFilters(filters: AdminUsersFilterState): boolean {
  return (
    filters.role !== "all" ||
    filters.verification !== "all" ||
    filters.premium !== "all" ||
    filters.status !== "all" ||
    filters.joinDate !== "all" ||
    filters.sort !== "newest"
  );
}

export type ActiveFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

/** @deprecated use applyAdvancedUserFilters */
export function filterUsersByPill(
  users: AdminUsersTableRow[],
  filter: AdminUsersFilter
): AdminUsersTableRow[] {
  switch (filter) {
    case "all":
      return users;
    case "premium":
      return users.filter(isPremiumUser);
    default:
      return [];
  }
}

export function paginateUsers<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getTotalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
