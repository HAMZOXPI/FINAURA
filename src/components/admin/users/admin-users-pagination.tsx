"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminUsersPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function AdminUsersPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: AdminUsersPaginationProps) {
  const { t } = useTranslation();

  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-surface-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-surface-500">
        {t.admin.users.pagination.showing
          .replace("{start}", String(start))
          .replace("{end}", String(end))
          .replace("{total}", String(total))}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-surface-600">
          {t.admin.users.pagination.rowsPerPage}
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs font-medium"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-200",
              page <= 1 ? "cursor-not-allowed opacity-40" : "hover:bg-surface-50"
            )}
            aria-label={t.admin.users.pagination.previous}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[4.5rem] text-center text-xs font-semibold text-surface-700">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-200",
              page >= totalPages ? "cursor-not-allowed opacity-40" : "hover:bg-surface-50"
            )}
            aria-label={t.admin.users.pagination.next}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
