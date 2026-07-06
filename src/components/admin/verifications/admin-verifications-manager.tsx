"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import {
  approveVerificationRequest,
  fetchVerificationDocumentUrls,
  rejectVerificationRequest,
} from "@/actions/admin-verification.actions";
import type {
  AdminVerificationListResult,
  AdminVerificationRequestRow,
  AdminVerificationStats,
  VerificationDocumentUrls,
} from "@/services/admin-verification.service";
import type { VerificationRequestStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminVerificationsManagerProps {
  stats: AdminVerificationStats;
  list: AdminVerificationListResult;
}

type ToastState = { type: "success" | "error"; message: string } | null;

function StatusBadge({ status }: { status: VerificationRequestStatus }) {
  const { t } = useTranslation();
  const config = {
    pending: {
      label: t.admin.verifications.statusPending,
      className: "bg-orange-50 text-orange-700 ring-orange-200",
    },
    approved: {
      label: t.admin.verifications.statusApproved,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    rejected: {
      label: t.admin.verifications.statusRejected,
      className: "bg-red-50 text-red-700 ring-red-200",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

function AdminToast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 end-6 z-[100] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg",
        toast.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-red-200 bg-red-50 text-red-900"
      )}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <p className="text-sm font-medium">{toast.message}</p>
      <button type="button" onClick={onClose} className="ms-auto opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function DocumentPreview({
  label,
  url,
  alt,
}: {
  label: string;
  url: string | null;
  alt: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-surface-900">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-surface-200 bg-surface-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={alt} className="max-h-[420px] w-full object-contain" />
        </a>
      ) : (
        <p className="rounded-xl border border-dashed border-surface-300 px-4 py-8 text-center text-sm text-surface-500">
          {t.admin.verifications.documentUnavailable}
        </p>
      )}
    </div>
  );
}

export function AdminVerificationsManager({ stats, list }: AdminVerificationsManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastState>(null);

  const [previewRequest, setPreviewRequest] = useState<AdminVerificationRequestRow | null>(null);
  const [previewUrls, setPreviewUrls] = useState<VerificationDocumentUrls | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [rejectRequest, setRejectRequest] = useState<AdminVerificationRequestRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const statusFilter = (searchParams.get("status") ?? "all") as VerificationRequestStatus | "all";
  const dateFilter = searchParams.get("date") ?? "";

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

  const statCards = [
    {
      key: "pending",
      label: t.admin.verifications.statPending,
      value: stats.pending,
      className: "border-orange-200 bg-orange-50/60",
      filter: { status: "pending" },
    },
    {
      key: "approved",
      label: t.admin.verifications.statApproved,
      value: stats.approved,
      className: "border-emerald-200 bg-emerald-50/60",
      filter: { status: "approved" },
    },
    {
      key: "rejected",
      label: t.admin.verifications.statRejected,
      value: stats.rejected,
      className: "border-red-200 bg-red-50/60",
      filter: { status: "rejected" },
    },
    {
      key: "today",
      label: t.admin.verifications.statToday,
      value: stats.today,
      className: "border-brand-200 bg-brand-50/60",
      filter: { date: "today" },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
          {t.admin.verifications.title}
        </h1>
        <p className="mt-2 text-surface-500">{t.admin.verifications.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() =>
              updateParams({
                status: "status" in card.filter ? (card.filter.status ?? null) : null,
                date: "date" in card.filter ? (card.filter.date ?? null) : null,
                page: null,
              })
            }
            className={cn(
              "rounded-2xl border p-5 text-start transition-shadow hover:shadow-md",
              card.className
            )}
          >
            <p className="text-sm font-medium text-surface-600">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-surface-900">{card.value}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  updateParams({ q: searchInput.trim() || null, page: null });
                }
              }}
              placeholder={t.admin.verifications.searchPlaceholder}
              className="ps-9"
            />
          </div>
          <Button
            type="button"
            onClick={() => updateParams({ q: searchInput.trim() || null, page: null })}
          >
            {t.admin.verifications.searchButton}
          </Button>
          <select
            value={statusFilter}
            onChange={(event) =>
              updateParams({ status: event.target.value === "all" ? null : event.target.value, page: null })
            }
            className="h-10 rounded-xl border border-surface-300 bg-white px-3 text-sm"
          >
            <option value="all">{t.admin.verifications.filterAllStatuses}</option>
            <option value="pending">{t.admin.verifications.statusPending}</option>
            <option value="approved">{t.admin.verifications.statusApproved}</option>
            <option value="rejected">{t.admin.verifications.statusRejected}</option>
          </select>
          <Input
            type="date"
            value={dateFilter === "today" ? new Date().toISOString().slice(0, 10) : dateFilter}
            onChange={(event) =>
              updateParams({ date: event.target.value || null, page: null })
            }
            className="h-10"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchInput("");
              updateParams({ q: null, status: null, date: null, page: null });
            }}
          >
            {t.admin.verifications.clearFilters}
          </Button>
        </div>
      </div>

      <div className={cn("overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm", isPending && "opacity-60")}>
        {list.rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-surface-300" />
            <p className="mt-4 text-lg font-semibold text-surface-900">
              {t.admin.verifications.emptyTitle}
            </p>
            <p className="mt-2 text-sm text-surface-500">{t.admin.verifications.emptySubtitle}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-100">
              <thead className="bg-surface-50/80">
                <tr>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.verifications.colSeller}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.verifications.colEmail}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.verifications.colDate}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.verifications.colStatus}
                  </th>
                  <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.verifications.colActions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {list.rows.map((row) => {
                  const seller = row.seller;
                  const name = seller?.full_name ?? t.properties.defaultAgent;

                  return (
                    <tr key={row.id} className="hover:bg-surface-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {seller?.avatar_url ? (
                            <Image
                              src={seller.avatar_url}
                              alt={name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                              {getInitials(name)}
                            </span>
                          )}
                          <span className="font-medium text-surface-900">{name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600">{seller?.email ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-surface-600">
                        {formatDate(row.created_at, locale)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openPreview(row)}
                          >
                            <Eye className="h-4 w-4" />
                            {t.admin.verifications.preview}
                          </Button>
                          {row.status === "pending" && (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleApprove(row.id)}
                                disabled={isPending}
                              >
                                {t.admin.verifications.approve}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setRejectRequest(row);
                                  setRejectReason("");
                                }}
                                disabled={isPending}
                              >
                                {t.admin.verifications.reject}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {list.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-surface-200 bg-white px-4 py-3">
          <p className="text-sm text-surface-500">
            {t.admin.verifications.pageInfo
              .replace("{page}", String(list.page))
              .replace("{totalPages}", String(list.totalPages))
              .replace("{total}", String(list.total))}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={list.page <= 1 || isPending}
              onClick={() => updateParams({ page: String(list.page - 1) })}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={list.page >= list.totalPages || isPending}
              onClick={() => updateParams({ page: String(list.page + 1) })}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {previewRequest && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-surface-900">
                  {t.admin.verifications.previewTitle}
                </h2>
                <p className="text-sm text-surface-500">
                  {previewRequest.seller?.full_name ?? previewRequest.seller?.email}
                </p>
              </div>
              <button type="button" onClick={closePreview} className="rounded-lg p-2 hover:bg-surface-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-surface-500">
                    {t.admin.verifications.fieldName}
                  </p>
                  <p className="mt-1 font-medium text-surface-900">
                    {previewRequest.seller?.full_name ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-surface-500">
                    {t.admin.verifications.fieldEmail}
                  </p>
                  <p className="mt-1 font-medium text-surface-900">
                    {previewRequest.seller?.email ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-surface-500">
                    {t.admin.verifications.fieldPhone}
                  </p>
                  <p className="mt-1 font-medium text-surface-900">
                    {previewRequest.seller?.phone ?? "—"}
                  </p>
                </div>
              </div>

              {previewLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-64 animate-pulse rounded-xl bg-surface-100" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <DocumentPreview
                    label={t.dashboard.verificationIdFront}
                    url={previewUrls?.idFront ?? null}
                    alt="CIN front"
                  />
                  <DocumentPreview
                    label={t.dashboard.verificationIdBack}
                    url={previewUrls?.idBack ?? null}
                    alt="CIN back"
                  />
                  <DocumentPreview
                    label={t.dashboard.verificationSelfie}
                    url={previewUrls?.selfie ?? null}
                    alt="Selfie"
                  />
                  {previewRequest.proof_of_address && (
                    <DocumentPreview
                      label={t.dashboard.verificationProofOfAddress}
                      url={previewUrls?.proofOfAddress ?? null}
                      alt="Proof of address"
                    />
                  )}
                </div>
              )}
            </div>

            {previewRequest.status === "pending" && (
              <div className="flex flex-wrap gap-3 border-t border-surface-100 px-6 py-4">
                <Button
                  type="button"
                  onClick={() => handleApprove(previewRequest.id)}
                  disabled={isPending}
                >
                  {t.admin.verifications.approve}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setRejectRequest(previewRequest);
                    setRejectReason("");
                  }}
                  disabled={isPending}
                >
                  {t.admin.verifications.reject}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {rejectRequest && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-surface-900">
              {t.admin.verifications.rejectTitle}
            </h3>
            <p className="mt-2 text-sm text-surface-500">{t.admin.verifications.rejectSubtitle}</p>
            <Textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder={t.admin.verifications.rejectPlaceholder}
              rows={4}
              className="mt-4"
            />
            <div className="mt-5 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRejectRequest(null);
                  setRejectReason("");
                }}
                disabled={isPending}
              >
                {t.admin.verifications.cancel}
              </Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleRejectSubmit}
                disabled={isPending || rejectReason.trim().length < 5}
                isLoading={isPending}
              >
                {t.admin.verifications.confirmReject}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
