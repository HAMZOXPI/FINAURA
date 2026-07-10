"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import type { AdminVerificationRequestRow } from "@/services/admin-verification.service";
import type { VerificationDocumentUrls } from "@/services/admin-verification.service";
import type { VerificationRequestStatus } from "@/types/database";
import { VerificationModerationActions } from "@/components/admin/verifications/verification-moderation-actions";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import type { VerificationsEmptyVariant } from "@/lib/admin/verifications-display";

interface AdminVerificationsTableProps {
  rows: AdminVerificationRequestRow[];
  emptyVariant: VerificationsEmptyVariant;
  isPending?: boolean;
  onPreview: (row: AdminVerificationRequestRow) => void;
  onApprove: (requestId: string) => void;
  onReject: (row: AdminVerificationRequestRow) => void;
  onDownloadDocuments: (requestId: string, cachedUrls: VerificationDocumentUrls | null) => void;
}

function StatusBadge({ status }: { status: VerificationRequestStatus }) {
  const { t } = useTranslation();
  const config = {
    pending: {
      label: t.admin.verifications.statusPending,
      className: "bg-orange-50 text-orange-700 ring-orange-200/80",
      dot: "bg-orange-500",
    },
    approved: {
      label: t.admin.verifications.statusApproved,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
      dot: "bg-emerald-500",
    },
    rejected: {
      label: t.admin.verifications.statusRejected,
      className: "bg-red-50 text-red-700 ring-red-200/80",
      dot: "bg-red-500",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        config.className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

function EmptyState({ variant }: { variant: VerificationsEmptyVariant }) {
  const { t } = useTranslation();

  const copy =
    variant === "search"
      ? {
          title: t.admin.verifications.emptySearchTitle,
          subtitle: t.admin.verifications.emptySearchSubtitle,
        }
      : variant === "filter"
        ? {
            title: t.admin.verifications.emptyFilterTitle,
            subtitle: t.admin.verifications.emptyFilterSubtitle,
          }
        : {
            title: t.admin.verifications.emptyTitle,
            subtitle: t.admin.verifications.emptySubtitle,
          };

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="relative">
        <div className="absolute inset-0 scale-150 rounded-full bg-surface-100 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-surface-200/80">
          <ShieldCheck className="h-7 w-7 text-surface-400" strokeWidth={1.75} />
        </div>
      </div>
      <p className="mt-6 text-base font-semibold text-surface-900">{copy.title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-surface-500">{copy.subtitle}</p>
    </div>
  );
}

export function AdminVerificationsTable({
  rows,
  emptyVariant,
  isPending,
  onPreview,
  onApprove,
  onReject,
  onDownloadDocuments,
}: AdminVerificationsTableProps) {
  const { t, locale } = useTranslation();

  if (rows.length === 0) {
    return <EmptyState variant={emptyVariant} />;
  }

  return (
    <>
      <div
        className={cn(
          "hidden overflow-x-auto lg:block",
          isPending && "pointer-events-none opacity-60"
        )}
      >
        <table className="min-w-[980px] w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
            <tr className="border-b border-surface-200 text-start text-xs font-semibold uppercase tracking-wider text-surface-500">
              <th className="px-4 py-3">{t.admin.verifications.colAvatar}</th>
              <th className="px-4 py-3">{t.admin.verifications.colSeller}</th>
              <th className="px-4 py-3">{t.admin.verifications.colEmail}</th>
              <th className="px-4 py-3">{t.admin.verifications.colDate}</th>
              <th className="px-4 py-3">{t.admin.verifications.colStatus}</th>
              <th className="min-w-[18rem] px-4 py-3 text-end">{t.admin.verifications.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const seller = row.seller;
              const name = seller?.full_name ?? t.properties.defaultAgent;

              return (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.28 }}
                  className={cn(
                    "group border-b border-surface-100 transition-colors hover:bg-brand-50/40",
                    index % 2 === 1 && "bg-surface-50/35"
                  )}
                >
                  <td className="px-4 py-3.5">
                    {seller?.avatar_url ? (
                      <Image
                        src={seller.avatar_url}
                        alt={name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 ring-2 ring-white shadow-sm">
                        {getInitials(name)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-surface-900">{name}</td>
                  <td className="px-4 py-3.5 text-surface-600">{seller?.email ?? "—"}</td>
                  <td className="px-4 py-3.5 text-surface-600">
                    {formatDate(row.created_at, locale)}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <VerificationModerationActions
                      status={row.status}
                      actionPending={isPending}
                      downloadReady
                      variant="table"
                      handlers={{
                        onApprove: () => onApprove(row.id),
                        onReject: () => onReject(row),
                        onViewDocuments: () => onPreview(row),
                        onDownloadDocuments: () => onDownloadDocuments(row.id, null),
                      }}
                    />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={cn("space-y-3 p-4 lg:hidden", isPending && "opacity-60")}>
        {rows.map((row, index) => {
          const seller = row.seller;
          const name = seller?.full_name ?? t.properties.defaultAgent;

          return (
            <motion.article
              key={row.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                {seller?.avatar_url ? (
                  <Image
                    src={seller.avatar_url}
                    alt={name}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                    {getInitials(name)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-surface-900">{name}</p>
                  <p className="truncate text-sm text-surface-500">{seller?.email ?? "—"}</p>
                  <p className="mt-1 text-xs text-surface-400">
                    {formatDate(row.created_at, locale)}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={row.status} />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <VerificationModerationActions
                  status={row.status}
                  actionPending={isPending}
                  downloadReady
                  variant="table"
                  handlers={{
                    onApprove: () => onApprove(row.id),
                    onReject: () => onReject(row),
                    onViewDocuments: () => onPreview(row),
                    onDownloadDocuments: () => onDownloadDocuments(row.id, null),
                  }}
                />
              </div>
            </motion.article>
          );
        })}
      </div>
    </>
  );
}
