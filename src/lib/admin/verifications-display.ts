import type { AdminVerificationRequestRow } from "@/services/admin-verification.service";
import type { VerificationRequestStatus } from "@/types/database";

export type VerificationTypeFilter = "all" | "identity" | "with_address";
export type VerificationSort = "newest" | "oldest";

export interface VerificationUiFilters {
  type: VerificationTypeFilter;
  sort: VerificationSort;
}

export const DEFAULT_VERIFICATION_UI_FILTERS: VerificationUiFilters = {
  type: "all",
  sort: "newest",
};

export type ActiveVerificationChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

export type VerificationsEmptyVariant = "none" | "empty" | "search" | "filter";

export function applyClientVerificationDisplay(
  rows: AdminVerificationRequestRow[],
  ui: VerificationUiFilters
): AdminVerificationRequestRow[] {
  let list = [...rows];

  if (ui.type === "identity") {
    list = list.filter((row) => !row.proof_of_address);
  } else if (ui.type === "with_address") {
    list = list.filter((row) => Boolean(row.proof_of_address));
  }

  if (ui.sort === "oldest") {
    list = list.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  return list;
}

export function hasServerFilters(params: {
  query: string;
  status: VerificationRequestStatus | "all";
  date: string;
}): boolean {
  return (
    params.query.trim().length > 0 ||
    params.status !== "all" ||
    params.date.length > 0
  );
}

export function hasUiFilters(ui: VerificationUiFilters): boolean {
  return ui.type !== "all" || ui.sort !== "newest";
}

export function getVerificationsEmptyVariant(
  serverRows: number,
  displayRows: number,
  params: { query: string; status: VerificationRequestStatus | "all"; date: string },
  ui: VerificationUiFilters
): VerificationsEmptyVariant {
  if (displayRows > 0) return "none";
  if (serverRows === 0 && !hasServerFilters(params) && !hasUiFilters(ui)) return "empty";
  if (params.query.trim().length > 0) return "search";
  return "filter";
}
