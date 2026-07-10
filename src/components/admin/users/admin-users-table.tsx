"use client";

import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import {
  Ban,
  Check,
  Crown,
  Eye,
  Minus,
  Pencil,
  ShieldCheck,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import type { AdminUsersTableRow } from "@/lib/admin/users-display";
import { isPremiumUser } from "@/lib/admin/users-display";
import { UserAvatar } from "@/components/admin/promotions/promotion-ui";
import { cn, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export type UsersEmptyVariant = "none" | "search" | "filter" | "empty";

interface AdminUsersTableProps {
  users: AdminUsersTableRow[];
  emptyVariant: UsersEmptyVariant;
  onSelectUser: (user: AdminUsersTableRow) => void;
  selectedIds: Set<string>;
  onToggleSelect: (userId: string) => void;
  onToggleSelectAll: () => void;
  allPageSelected: boolean;
  somePageSelected: boolean;
}

function DisabledAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Eye;
  label: string;
  onClick?: (event: MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      disabled
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg text-surface-300 opacity-60"
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}

function SelectionCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded-md border transition-all",
        checked || indeterminate
          ? "border-brand-600 bg-brand-600 text-white shadow-sm"
          : "border-surface-300 bg-white hover:border-brand-400"
      )}
    >
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      {!checked && indeterminate && <Minus className="h-3.5 w-3.5" strokeWidth={3} />}
    </button>
  );
}

function EmptyState({ variant }: { variant: UsersEmptyVariant }) {
  const { t } = useTranslation();

  const copy =
    variant === "search"
      ? { title: t.admin.users.emptySearchTitle, subtitle: t.admin.users.emptySearchSubtitle }
      : variant === "filter"
        ? { title: t.admin.users.emptyFilterTitle, subtitle: t.admin.users.emptyFilterSubtitle }
        : variant === "empty"
          ? { title: t.admin.users.emptyTitle, subtitle: t.admin.users.emptySubtitle }
          : { title: t.admin.users.emptyTitle, subtitle: t.admin.users.emptySubtitle };

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="relative">
        <div className="absolute inset-0 scale-150 rounded-full bg-surface-100 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-surface-200/80">
          <Users className="h-7 w-7 text-surface-400" strokeWidth={1.75} />
        </div>
      </div>
      <p className="mt-6 text-base font-semibold text-surface-900">{copy.title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-surface-500">{copy.subtitle}</p>
    </div>
  );
}

const stickyCell =
  "sticky z-[1] bg-white group-hover:bg-brand-50/40 [.group:nth-child(even)_&]:bg-surface-50/35";

export function AdminUsersTable({
  users,
  emptyVariant,
  onSelectUser,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allPageSelected,
  somePageSelected,
}: AdminUsersTableProps) {
  const { t, locale } = useTranslation();

  const stopPropagation = (event: MouseEvent) => {
    event.stopPropagation();
  };

  if (users.length === 0) {
    return <EmptyState variant={emptyVariant} />;
  }

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
            <tr className="border-b border-surface-200 text-start text-xs font-semibold uppercase tracking-wider text-surface-500">
              <th
                className={cn("start-0 w-12 px-3 py-3", stickyCell, "z-[2]")}
                style={{ boxShadow: "2px 0 6px -2px rgba(0,0,0,0.06)" }}
              >
                <SelectionCheckbox
                  checked={allPageSelected}
                  indeterminate={somePageSelected && !allPageSelected}
                  onChange={onToggleSelectAll}
                  label={t.admin.users.bulk.selectAll}
                />
              </th>
              <th
                className={cn("start-12 min-w-[4rem] px-3 py-3 resize-x overflow-hidden", stickyCell, "z-[2]")}
                style={{ boxShadow: "2px 0 6px -2px rgba(0,0,0,0.04)" }}
              >
                {t.admin.users.colAvatar}
              </th>
              <th className="min-w-[9rem] resize-x overflow-hidden px-3 py-3">{t.admin.users.colName}</th>
              <th className="min-w-[11rem] resize-x overflow-hidden px-3 py-3">{t.admin.users.colEmail}</th>
              <th className="min-w-[6rem] resize-x overflow-hidden px-3 py-3">{t.admin.users.colRole}</th>
              <th className="min-w-[7rem] resize-x overflow-hidden px-3 py-3">{t.admin.users.colVerification}</th>
              <th className="min-w-[6rem] resize-x overflow-hidden px-3 py-3">{t.admin.users.colPremium}</th>
              <th className="min-w-[5rem] resize-x overflow-hidden px-3 py-3">{t.admin.users.colListings}</th>
              <th className="min-w-[5rem] resize-x overflow-hidden px-3 py-3">{t.admin.users.colBoosts}</th>
              <th className="min-w-[7rem] resize-x overflow-hidden px-3 py-3">{t.admin.users.colJoined}</th>
              <th className="min-w-[5rem] resize-x overflow-hidden px-3 py-3">{t.admin.users.colStatus}</th>
              <th
                className={cn("end-0 min-w-[11rem] px-3 py-3 text-end", stickyCell, "z-[2]")}
                style={{ boxShadow: "-2px 0 6px -2px rgba(0,0,0,0.06)" }}
              >
                {t.admin.users.colActions}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const isSelected = selectedIds.has(user.id);

              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.28 }}
                  onClick={() => onSelectUser(user)}
                  className={cn(
                    "group cursor-pointer border-b border-surface-100 transition-colors hover:bg-brand-50/40",
                    index % 2 === 1 && "bg-surface-50/35",
                    isSelected && "bg-brand-50/60"
                  )}
                >
                  <td
                    className={cn("start-0 px-3 py-3", stickyCell, "z-[1]")}
                    style={{ boxShadow: "2px 0 6px -2px rgba(0,0,0,0.04)" }}
                    onClick={stopPropagation}
                  >
                    <SelectionCheckbox
                      checked={isSelected}
                      onChange={() => onToggleSelect(user.id)}
                      label={t.admin.users.bulk.selectUser}
                    />
                  </td>
                  <td
                    className={cn("start-12 px-3 py-3", stickyCell, "z-[1]")}
                    style={{ boxShadow: "2px 0 6px -2px rgba(0,0,0,0.03)" }}
                  >
                    <UserAvatar
                      name={user.full_name}
                      email={user.email}
                      avatarUrl={user.avatar_url}
                      size="sm"
                    />
                  </td>
                  <td className="px-3 py-3 font-semibold text-surface-900">
                    {user.full_name || "—"}
                  </td>
                  <td className="px-3 py-3 text-surface-600">{user.email}</td>
                  <td className="px-3 py-3 text-surface-500">{t.admin.users.unavailable}</td>
                  <td className="px-3 py-3 text-surface-500">{t.admin.users.unavailable}</td>
                  <td className="px-3 py-3">
                    {isPremiumUser(user) ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/80">
                        <Star className="h-3 w-3" />
                        {user.plan_name ?? t.admin.users.badgePremium}
                      </span>
                    ) : (
                      <span className="text-surface-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-surface-400">—</td>
                  <td className="px-3 py-3 text-surface-400">—</td>
                  <td className="px-3 py-3 text-surface-500">
                    {user.created_at ? formatDate(user.created_at, locale) : t.admin.users.unavailable}
                  </td>
                  <td className="px-3 py-3 text-surface-500">{t.admin.users.unavailable}</td>
                  <td
                    className={cn("end-0 px-3 py-3", stickyCell, "z-[1]")}
                    style={{ boxShadow: "-2px 0 6px -2px rgba(0,0,0,0.04)" }}
                    onClick={stopPropagation}
                  >
                    <div className="flex items-center justify-end gap-0.5">
                      <DisabledAction icon={Eye} label={t.admin.users.actionView} onClick={stopPropagation} />
                      <DisabledAction icon={Pencil} label={t.admin.users.actionEdit} onClick={stopPropagation} />
                      <DisabledAction icon={ShieldCheck} label={t.admin.users.actionVerify} onClick={stopPropagation} />
                      <DisabledAction icon={Crown} label={t.admin.users.actionPremium} onClick={stopPropagation} />
                      <DisabledAction icon={Ban} label={t.admin.users.actionSuspend} onClick={stopPropagation} />
                      <DisabledAction icon={Trash2} label={t.admin.users.actionDelete} onClick={stopPropagation} />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 lg:hidden">
        <div className="flex items-center justify-between rounded-xl border border-surface-200 bg-surface-50/60 px-3 py-2">
          <SelectionCheckbox
            checked={allPageSelected}
            indeterminate={somePageSelected && !allPageSelected}
            onChange={onToggleSelectAll}
            label={t.admin.users.bulk.selectAll}
          />
          <span className="text-xs font-medium text-surface-500">
            {selectedIds.size} {t.admin.users.bulk.selectedShort}
          </span>
        </div>

        {users.map((user, index) => {
          const isSelected = selectedIds.has(user.id);

          return (
            <motion.article
              key={user.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              onClick={() => onSelectUser(user)}
              className={cn(
                "cursor-pointer rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
                isSelected ? "border-brand-300 ring-1 ring-brand-200" : "border-surface-200/80"
              )}
            >
              <div className="flex items-start gap-3">
                <div onClick={stopPropagation}>
                  <SelectionCheckbox
                    checked={isSelected}
                    onChange={() => onToggleSelect(user.id)}
                    label={t.admin.users.bulk.selectUser}
                  />
                </div>
                <UserAvatar name={user.full_name} email={user.email} avatarUrl={user.avatar_url} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-surface-900">
                    {user.full_name || user.email}
                  </p>
                  <p className="truncate text-sm text-surface-500">{user.email}</p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </>
  );
}
