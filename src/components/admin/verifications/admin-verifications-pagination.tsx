"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminVerificationsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function AdminVerificationsPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  disabled,
}: AdminVerificationsPaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-surface-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-surface-500">
        {t.admin.verifications.pagination.showing
          .replace("{start}", String(start))
          .replace("{end}", String(end))
          .replace("{total}", String(total))}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1 || disabled}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-200",
            page <= 1 || disabled ? "cursor-not-allowed opacity-40" : "hover:bg-surface-50"
          )}
          aria-label={t.admin.verifications.pagination.previous}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[4.5rem] text-center text-xs font-semibold text-surface-700">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages || disabled}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-surface-200",
            page >= totalPages || disabled ? "cursor-not-allowed opacity-40" : "hover:bg-surface-50"
          )}
          aria-label={t.admin.verifications.pagination.next}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
