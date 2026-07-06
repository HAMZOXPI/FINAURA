"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pencil,
  Search,
  Star,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import {
  adminApproveProperty,
  adminBulkApproveProperties,
  adminBulkDeleteProperties,
  adminBulkHideProperties,
  adminDeleteProperty,
  adminHideProperty,
  adminRejectProperty,
  adminToggleFeaturedProperty,
  adminUnhideProperty,
} from "@/actions/admin-property.actions";
import { AdminPropertyDetailModal } from "@/components/admin/properties/admin-property-detail-modal";
import { AdminPropertyStatusBadge } from "@/components/admin/properties/admin-property-status-badge";
import type {
  AdminPropertyFilterStatus,
  AdminPropertyListResult,
  AdminPropertyRow,
  AdminPropertySort,
  AdminPropertyStats,
} from "@/services/admin-property.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn, formatDate, formatPrice, getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminPropertiesManagerProps {
  stats: AdminPropertyStats;
  list: AdminPropertyListResult;
}

type ToastState = { type: "success" | "error"; message: string } | null;

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

export function AdminPropertiesManager({ stats, list }: AdminPropertiesManagerProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastState>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailProperty, setDetailProperty] = useState<AdminPropertyRow | null>(null);
  const [rejectProperty, setRejectProperty] = useState<AdminPropertyRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteProperty, setDeleteProperty] = useState<AdminPropertyRow | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");

  const statusFilter = (searchParams.get("status") ?? "all") as AdminPropertyFilterStatus;
  const sortFilter = (searchParams.get("sort") ?? "newest") as AdminPropertySort;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });
      startTransition(() => {
        router.push(`/admin/properties?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const allSelected = useMemo(
    () => list.rows.length > 0 && list.rows.every((row) => selectedIds.includes(row.id)),
    [list.rows, selectedIds]
  );

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.rows.map((row) => row.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const runAction = (action: () => Promise<{ error?: string; success?: boolean }>, successMessage: string) => {
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setToast({ type: "error", message: result.error });
        return;
      }
      setToast({ type: "success", message: successMessage });
      setSelectedIds([]);
      router.refresh();
    });
  };

  const statCards = [
    { key: "active", label: t.admin.properties.statActive, value: stats.active, className: "border-emerald-200 bg-emerald-50/60" },
    { key: "pending", label: t.admin.properties.statPending, value: stats.pending, className: "border-orange-200 bg-orange-50/60" },
    { key: "rejected", label: t.admin.properties.statRejected, value: stats.rejected, className: "border-red-200 bg-red-50/60" },
    { key: "hidden", label: t.admin.properties.statHidden, value: stats.hidden, className: "border-surface-300 bg-surface-50" },
    { key: "sold", label: t.admin.properties.statSold, value: stats.sold, className: "border-blue-200 bg-blue-50/60" },
  ] as const;

  return (
    <div className="space-y-6">
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
          {t.admin.properties.title}
        </h1>
        <p className="mt-2 text-surface-500">{t.admin.properties.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => updateParams({ status: card.key, page: null })}
            className={cn(
              "rounded-2xl border p-5 text-start transition-shadow hover:shadow-md",
              card.className,
              statusFilter === card.key && "ring-2 ring-brand-500"
            )}
          >
            <p className="text-sm font-medium text-surface-600">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-surface-900">{card.value}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]">
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
              placeholder={t.admin.properties.searchPlaceholder}
              className="ps-9"
            />
          </div>
          <Button type="button" onClick={() => updateParams({ q: searchInput.trim() || null, page: null })}>
            {t.admin.properties.searchButton}
          </Button>
          <select
            value={statusFilter}
            onChange={(event) =>
              updateParams({ status: event.target.value === "all" ? null : event.target.value, page: null })
            }
            className="h-10 rounded-xl border border-surface-300 bg-white px-3 text-sm"
          >
            <option value="all">{t.admin.properties.filterAllStatuses}</option>
            <option value="active">{t.admin.properties.statusActive}</option>
            <option value="pending">{t.admin.properties.statusPending}</option>
            <option value="rejected">{t.admin.properties.statusRejected}</option>
            <option value="hidden">{t.admin.properties.statusHidden}</option>
            <option value="sold">{t.admin.properties.statusSold}</option>
          </select>
          <select
            value={sortFilter}
            onChange={(event) => updateParams({ sort: event.target.value === "newest" ? null : event.target.value, page: null })}
            className="h-10 rounded-xl border border-surface-300 bg-white px-3 text-sm"
          >
            <option value="newest">{t.admin.properties.sortNewest}</option>
            <option value="oldest">{t.admin.properties.sortOldest}</option>
            <option value="price_asc">{t.admin.properties.sortPriceAsc}</option>
            <option value="price_desc">{t.admin.properties.sortPriceDesc}</option>
            <option value="views">{t.admin.properties.sortViews}</option>
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchInput("");
              updateParams({ q: null, status: null, sort: null, page: null });
            }}
          >
            {t.admin.properties.clearFilters}
          </Button>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-3">
            <span className="text-sm font-medium text-brand-900">
              {t.admin.properties.selectedCount.replace("{count}", String(selectedIds.length))}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                runAction(() => adminBulkApproveProperties(selectedIds), t.admin.properties.bulkApproveSuccess)
              }
            >
              {t.admin.properties.bulkApprove}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                runAction(() => adminBulkHideProperties(selectedIds), t.admin.properties.bulkHideSuccess)
              }
            >
              {t.admin.properties.bulkHide}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => setBulkDeleteConfirm(true)}
            >
              {t.admin.properties.bulkDelete}
            </Button>
          </div>
        )}
      </div>

      <div className={cn("overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm", isPending && "opacity-60")}>
        {list.rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-lg font-semibold text-surface-900">{t.admin.properties.emptyTitle}</p>
            <p className="mt-2 text-sm text-surface-500">{t.admin.properties.emptySubtitle}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200">
              <thead className="bg-surface-50">
                <tr>
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.properties.colProperty}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.properties.colSeller}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.properties.colCity}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.properties.colPrice}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.properties.colStatus}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.properties.colViews}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.properties.colDate}
                  </th>
                  <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wide text-surface-500">
                    {t.admin.properties.colActions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {list.rows.map((property) => (
                  <tr key={property.id} className="hover:bg-surface-50/80">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(property.id)}
                        onChange={() => toggleSelect(property.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[220px] items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-100">
                          <Image
                            src={property.images[0] || PLACEHOLDER_IMAGE}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="line-clamp-1 font-medium text-surface-900">{property.title}</p>
                          <p className="text-xs text-surface-500">{property.property_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                          {getInitials(property.owner?.full_name || property.owner?.email || "?")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-900">
                            {property.owner?.full_name || "—"}
                          </p>
                          <p className="text-xs text-surface-500">{property.owner?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-700">{property.city}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-surface-900">
                      {formatPrice(property.price, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <AdminPropertyStatusBadge status={property.admin_status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-700">{property.favorite_count}</td>
                    <td className="px-4 py-3 text-sm text-surface-500">
                      {formatDate(property.created_at, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button type="button" size="sm" variant="ghost" onClick={() => setDetailProperty(property)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/properties/${property.id}/edit`}>
                          <Button type="button" size="sm" variant="ghost">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        {property.admin_status === "pending" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={isPending}
                            onClick={() =>
                              runAction(
                                () => adminApproveProperty(property.id),
                                t.admin.properties.approveSuccess
                              )
                            }
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </Button>
                        )}
                        {(property.admin_status === "pending" || property.admin_status === "active") && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={isPending}
                            onClick={() => setRejectProperty(property)}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                        {property.admin_status === "active" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={isPending}
                            onClick={() =>
                              runAction(
                                () => adminHideProperty(property.id),
                                t.admin.properties.hideSuccess
                              )
                            }
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        )}
                        {(property.admin_status === "hidden" || property.admin_status === "rejected") && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={isPending}
                            onClick={() =>
                              runAction(
                                () => adminUnhideProperty(property.id),
                                t.admin.properties.unhideSuccess
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() =>
                            runAction(
                              () => adminToggleFeaturedProperty(property.id, !property.is_featured),
                              property.is_featured
                                ? t.admin.properties.unfeatureSuccess
                                : t.admin.properties.featureSuccess
                            )
                          }
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              property.is_featured ? "fill-amber-400 text-amber-500" : "text-surface-400"
                            )}
                          />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() => setDeleteProperty(property)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {list.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">
            {t.admin.properties.pageInfo
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

      {detailProperty && (
        <AdminPropertyDetailModal property={detailProperty} onClose={() => setDetailProperty(null)} />
      )}

      {rejectProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-surface-900">{t.admin.properties.rejectTitle}</h3>
            <p className="mt-2 text-sm text-surface-500">{t.admin.properties.rejectSubtitle}</p>
            <Textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder={t.admin.properties.rejectPlaceholder}
              className="mt-4 min-h-[120px]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRejectProperty(null);
                  setRejectReason("");
                }}
              >
                {t.admin.properties.cancel}
              </Button>
              <Button
                type="button"
                disabled={isPending || rejectReason.trim().length < 5}
                onClick={() =>
                  runAction(async () => {
                    const result = await adminRejectProperty(rejectProperty.id, rejectReason);
                    if (!result?.error) {
                      setRejectProperty(null);
                      setRejectReason("");
                    }
                    return result;
                  }, t.admin.properties.rejectSuccess)
                }
              >
                {t.admin.properties.confirmReject}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-surface-900">{t.admin.properties.deleteTitle}</h3>
            <p className="mt-2 text-sm text-surface-500">{t.admin.properties.deleteSubtitle}</p>
            <p className="mt-3 font-medium text-surface-900">{deleteProperty.title}</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteProperty(null)}>
                {t.admin.properties.cancel}
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={() =>
                  runAction(async () => {
                    const result = await adminDeleteProperty(deleteProperty.id);
                    if (!result?.error) setDeleteProperty(null);
                    return result;
                  }, t.admin.properties.deleteSuccess)
                }
              >
                {t.admin.properties.confirmDelete}
              </Button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-surface-900">{t.admin.properties.bulkDeleteTitle}</h3>
            <p className="mt-2 text-sm text-surface-500">{t.admin.properties.bulkDeleteSubtitle}</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setBulkDeleteConfirm(false)}>
                {t.admin.properties.cancel}
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={() =>
                  runAction(async () => {
                    const result = await adminBulkDeleteProperties(selectedIds);
                    if (!result?.error) setBulkDeleteConfirm(false);
                    return result;
                  }, t.admin.properties.bulkDeleteSuccess)
                }
              >
                {t.admin.properties.confirmDelete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
