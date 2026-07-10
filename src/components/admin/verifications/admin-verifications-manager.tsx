"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarClock,
  Clock,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import {
  approveVerificationRequest,
  fetchVerificationDocumentUrls,
  rejectVerificationRequest,
} from "@/actions/admin-verification.actions";
import type { AdminActivityItem } from "@/services/admin.service";
import type {
  AdminVerificationListResult,
  AdminVerificationRequestRow,
  AdminVerificationStats,
  VerificationDocumentUrls,
} from "@/services/admin-verification.service";
import type { VerificationRequestStatus } from "@/types/database";
import {
  applyClientVerificationDisplay,
  DEFAULT_VERIFICATION_UI_FILTERS,
  getVerificationsEmptyVariant,
  type ActiveVerificationChip,
  type VerificationUiFilters,
} from "@/lib/admin/verifications-display";
import { useTranslation } from "@/i18n/locale-provider";
import { AdminVerificationsActiveChips } from "@/components/admin/verifications/admin-verifications-active-chips";
import { AdminVerificationsFilterToolbar } from "@/components/admin/verifications/admin-verifications-filter-toolbar";
import { AdminVerificationsHeader } from "@/components/admin/verifications/admin-verifications-header";
import { AdminVerificationsPagination } from "@/components/admin/verifications/admin-verifications-pagination";
import { AdminVerificationReviewDrawer } from "@/components/admin/verifications/admin-verification-review-drawer";
import { AdminVerificationsRejectModal } from "@/components/admin/verifications/admin-verifications-reject-modal";
import { AdminVerificationsStats } from "@/components/admin/verifications/admin-verifications-stats";
import { AdminVerificationsTable } from "@/components/admin/verifications/admin-verifications-table";
import { VerificationAnalytics } from "@/components/admin/verifications/verification-analytics";
import {
  AdminVerificationsToast,
  type VerificationToastState,
} from "@/components/admin/verifications/admin-verifications-toast";

interface AdminVerificationsManagerProps {
  stats: AdminVerificationStats;
  list: AdminVerificationListResult;
  activity: AdminActivityItem[];
}

export function AdminVerificationsManager({ stats, list, activity }: AdminVerificationsManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<VerificationToastState>(null);

  const [previewRequest, setPreviewRequest] = useState<AdminVerificationRequestRow | null>(null);
  const [previewUrls, setPreviewUrls] = useState<VerificationDocumentUrls | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [rejectRequest, setRejectRequest] = useState<AdminVerificationRequestRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [uiFilters, setUiFilters] = useState<VerificationUiFilters>(DEFAULT_VERIFICATION_UI_FILTERS);

  const statusFilter = (searchParams.get("status") ?? "all") as VerificationRequestStatus | "all";
  const dateFilter = searchParams.get("date") ?? "";
  const query = searchParams.get("q") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });
      if (!updates.page) params.delete("page");
      startTransition(() => {
        router.push(`/admin/verifications?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const displayRows = useMemo(
    () => applyClientVerificationDisplay(list.rows, uiFilters),
    [list.rows, uiFilters]
  );

  const emptyVariant = getVerificationsEmptyVariant(
    list.rows.length,
    displayRows.length,
    { query, status: statusFilter, date: dateFilter },
    uiFilters
  );

  const activeChips = useMemo((): ActiveVerificationChip[] => {
    const chips: ActiveVerificationChip[] = [];

    if (query.trim()) {
      chips.push({
        key: "q",
        label: query.trim(),
        onRemove: () => {
          setSearchInput("");
          updateParams({ q: null, page: null });
        },
      });
    }

    if (statusFilter !== "all") {
      const labels: Record<string, string> = {
        pending: t.admin.verifications.statusPending,
        approved: t.admin.verifications.statusApproved,
        rejected: t.admin.verifications.statusRejected,
      };
      chips.push({
        key: "status",
        label: labels[statusFilter] ?? statusFilter,
        onRemove: () => updateParams({ status: null, page: null }),
      });
    }

    if (dateFilter) {
      chips.push({
        key: "date",
        label: dateFilter === "today" ? t.admin.verifications.statToday : dateFilter,
        onRemove: () => updateParams({ date: null, page: null }),
      });
    }

    if (uiFilters.type !== "all") {
      const labels: Record<string, string> = {
        identity: t.admin.verifications.filters.typeIdentity,
        with_address: t.admin.verifications.filters.typeWithAddress,
      };
      chips.push({
        key: "type",
        label: labels[uiFilters.type] ?? uiFilters.type,
        onRemove: () => setUiFilters((current) => ({ ...current, type: "all" })),
      });
    }

    if (uiFilters.sort !== "newest") {
      chips.push({
        key: "sort",
        label: t.admin.verifications.filters.sortOldest,
        onRemove: () => setUiFilters((current) => ({ ...current, sort: "newest" })),
      });
    }

    return chips;
  }, [query, statusFilter, dateFilter, uiFilters, t, updateParams]);

  const statCards = useMemo(
    () => [
      {
        key: "pending",
        label: t.admin.verifications.statPending,
        value: stats.pending,
        icon: Clock,
        accent: "bg-orange-50 text-orange-600",
        delay: 0.04,
        onClick: () => updateParams({ status: "pending", date: null, page: null }),
      },
      {
        key: "approved",
        label: t.admin.verifications.statApproved,
        value: stats.approved,
        icon: UserCheck,
        accent: "bg-emerald-50 text-emerald-600",
        delay: 0.08,
        onClick: () => updateParams({ status: "approved", date: null, page: null }),
      },
      {
        key: "rejected",
        label: t.admin.verifications.statRejected,
        value: stats.rejected,
        icon: XCircle,
        accent: "bg-red-50 text-red-600",
        delay: 0.12,
        onClick: () => updateParams({ status: "rejected", date: null, page: null }),
      },
      {
        key: "today",
        label: t.admin.verifications.statToday,
        value: stats.today,
        icon: CalendarClock,
        accent: "bg-blue-50 text-blue-600",
        delay: 0.16,
        onClick: () => updateParams({ date: "today", status: null, page: null }),
      },
      {
        key: "verified",
        label: t.admin.verifications.statVerifiedSellers,
        value: null,
        icon: ShieldCheck,
        accent: "bg-purple-50 text-purple-600",
        delay: 0.2,
      },
      {
        key: "avgTime",
        label: t.admin.verifications.statAvgReviewTime,
        value: null,
        icon: Clock,
        accent: "bg-indigo-50 text-indigo-600",
        delay: 0.24,
      },
    ],
    [stats, t, updateParams]
  );

  const openPreview = async (request: AdminVerificationRequestRow) => {
    setPreviewRequest(request);
    setPreviewUrls(null);
    setPreviewLoading(true);

    const result = await fetchVerificationDocumentUrls(request.id);
    setPreviewLoading(false);

    if ("error" in result && result.error) {
      setToast({ type: "error", message: result.error });
      return;
    }

    if (result.request) setPreviewRequest(result.request as AdminVerificationRequestRow);
    if (result.urls) setPreviewUrls(result.urls);
  };

  const closePreview = () => {
    setPreviewRequest(null);
    setPreviewUrls(null);
  };

  const downloadDocumentUrls = (urls: VerificationDocumentUrls) => {
    const links = [urls.idFront, urls.idBack, urls.selfie, urls.proofOfAddress].filter(
      (url): url is string => Boolean(url)
    );

    for (const url of links) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.download = "";
      anchor.click();
    }
  };

  const handleDownloadDocuments = async (
    requestId: string,
    cachedUrls: VerificationDocumentUrls | null
  ) => {
    if (cachedUrls) {
      downloadDocumentUrls(cachedUrls);
      return;
    }

    const result = await fetchVerificationDocumentUrls(requestId);
    if ("error" in result && result.error) {
      setToast({ type: "error", message: result.error });
      return;
    }

    if (result.urls) {
      downloadDocumentUrls(result.urls);
      return;
    }

    setToast({ type: "error", message: t.admin.verifications.documentUnavailable });
  };

  const handleApprove = (requestId: string) => {
    startTransition(async () => {
      const result = await approveVerificationRequest(requestId);
      if (result?.error) {
        setToast({ type: "error", message: result.error });
        return;
      }
      setToast({ type: "success", message: t.admin.verifications.approveSuccess });
      closePreview();
      router.refresh();
    });
  };

  const handleRejectSubmit = () => {
    if (!rejectRequest) return;

    startTransition(async () => {
      const result = await rejectVerificationRequest(rejectRequest.id, rejectReason);
      if (result?.error) {
        setToast({ type: "error", message: result.error });
        return;
      }
      setToast({ type: "success", message: t.admin.verifications.rejectSuccess });
      setRejectRequest(null);
      setRejectReason("");
      closePreview();
      router.refresh();
    });
  };

  const handleReset = () => {
    setSearchInput("");
    setUiFilters(DEFAULT_VERIFICATION_UI_FILTERS);
    updateParams({ q: null, status: null, date: null, page: null });
  };

  return (
    <div className="space-y-6">
      <AdminVerificationsHeader />

      <AdminVerificationsStats cards={statCards} />

      <VerificationAnalytics stats={stats} />

      <AdminVerificationsFilterToolbar
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={() => updateParams({ q: searchInput.trim() || null, page: null })}
        statusFilter={statusFilter}
        onStatusChange={(status) =>
          updateParams({ status: status === "all" ? null : status, page: null })
        }
        dateFilter={dateFilter}
        onDateChange={(date) => updateParams({ date: date || null, page: null })}
        uiFilters={uiFilters}
        onUiFiltersChange={setUiFilters}
        onReset={handleReset}
        isPending={isPending}
      />

      <AdminVerificationsActiveChips chips={activeChips} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"
      >
        <AdminVerificationsTable
          rows={displayRows}
          emptyVariant={emptyVariant}
          isPending={isPending}
          onPreview={openPreview}
          onApprove={handleApprove}
          onReject={(row) => {
            setRejectRequest(row);
            setRejectReason("");
          }}
          onDownloadDocuments={handleDownloadDocuments}
        />

        <AdminVerificationsPagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          pageSize={list.pageSize}
          onPageChange={(page) => updateParams({ page: String(page) })}
          disabled={isPending}
        />
      </motion.div>

      {previewRequest && (
        <AdminVerificationReviewDrawer
          request={previewRequest}
          urls={previewUrls}
          documentsLoading={previewLoading}
          activity={activity}
          isPending={isPending}
          onClose={closePreview}
          onApprove={handleApprove}
          onReject={(row) => {
            setRejectRequest(row);
            setRejectReason("");
          }}
          onDownloadDocuments={handleDownloadDocuments}
        />
      )}

      {rejectRequest && (
        <AdminVerificationsRejectModal
          request={rejectRequest}
          reason={rejectReason}
          onReasonChange={setRejectReason}
          onCancel={() => {
            setRejectRequest(null);
            setRejectReason("");
          }}
          onConfirm={handleRejectSubmit}
          isPending={isPending}
        />
      )}

      <AdminVerificationsToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
