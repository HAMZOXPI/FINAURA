"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, Megaphone, Search } from "lucide-react";
import { motion } from "framer-motion";
import { sendBroadcastNotification } from "@/actions/admin-notification.actions";
import { AdminNotificationAnalytics } from "@/components/admin/notifications/admin-notification-analytics";
import { AdminNotificationsActiveChips } from "@/components/admin/notifications/admin-notifications-active-chips";
import { AdminNotificationsAuditTable } from "@/components/admin/notifications/admin-notifications-audit-table";
import { AdminNotificationsBroadcastPanel } from "@/components/admin/notifications/admin-notifications-broadcast-panel";
import { AdminNotificationsFilterToolbar } from "@/components/admin/notifications/admin-notifications-filter-toolbar";
import { AdminNotificationsHeader } from "@/components/admin/notifications/admin-notifications-header";
import {
  AdminNotificationsStats,
  type NotificationStatCardConfig,
} from "@/components/admin/notifications/admin-notifications-stats";
import { AdminNotificationsPagination } from "@/components/admin/notifications/admin-notifications-pagination";
import { AdminNotificationsTable } from "@/components/admin/notifications/admin-notifications-table";
import { AdminNotificationDetailsDrawer } from "@/components/admin/notifications/admin-notification-details-drawer";
import type {
  AdminBroadcastListResult,
  AdminNotificationListResult,
  AdminNotificationRow,
  AdminNotificationStats,
} from "@/services/admin-notification.service";
import type {
  NotificationAuditLog,
  NotificationAudience,
  NotificationPriority,
  NotificationType,
} from "@/types/database";
import {
  applyClientNotificationFilters,
  DEFAULT_NOTIFICATION_UI_FILTERS,
  getNotificationsEmptyVariant,
  type ActiveNotificationChip,
  type NotificationReadFilter,
  type NotificationUiFilters,
} from "@/lib/admin/notifications-display";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Megaphone as MegaphoneIcon,
  Radio,
  Send,
} from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminNotificationsManagerProps {
  stats: AdminNotificationStats;
  list: AdminNotificationListResult;
  broadcasts: AdminBroadcastListResult;
  auditLog: NotificationAuditLog[];
  cities: string[];
}

type Tab = "all" | "broadcast" | "audit";

export function AdminNotificationsManager({
  stats,
  list,
  broadcasts,
  auditLog,
  cities,
}: AdminNotificationsManagerProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("all");

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") ?? "");
  const [uiFilters, setUiFilters] = useState<NotificationUiFilters>(DEFAULT_NOTIFICATION_UI_FILTERS);

  const typeFilter = (searchParams.get("type") ?? "all") as NotificationType | "all";
  const readFilter = (searchParams.get("read") ?? "all") as NotificationReadFilter;

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastAudience, setBroadcastAudience] = useState<NotificationAudience>("all_users");
  const [broadcastPriority, setBroadcastPriority] = useState<NotificationPriority>("info");
  const [broadcastActionUrl, setBroadcastActionUrl] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<
    { id: string; full_name: string | null; email: string }[]
  >([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [targetCity, setTargetCity] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<AdminNotificationRow | null>(
    null
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });
      startTransition(() => router.push(`/admin/notifications?${params.toString()}`));
    },
    [router, searchParams]
  );

  const displayRows = useMemo(
    () => applyClientNotificationFilters(list.rows, uiFilters),
    [list.rows, uiFilters]
  );

  const emptyVariant = getNotificationsEmptyVariant(
    list.rows.length,
    displayRows.length,
    { query: searchParams.get("q") ?? "", type: typeFilter, read: readFilter, dateFrom, dateTo },
    uiFilters
  );

  const statCards: NotificationStatCardConfig[] = [
    {
      key: "total",
      label: t.admin.notifications.statTotal,
      value: stats.total,
      icon: BellRing,
      accent: "bg-indigo-50 text-indigo-600",
      delay: 0,
    },
    {
      key: "unread",
      label: t.admin.notifications.statUnread,
      value: stats.unread,
      icon: Radio,
      accent: "bg-brand-50 text-brand-600",
      delay: 0.05,
    },
    {
      key: "read",
      label: t.admin.notifications.statRead,
      value: stats.read,
      icon: CheckCircle2,
      accent: "bg-emerald-50 text-emerald-600",
      delay: 0.1,
    },
    {
      key: "today",
      label: t.admin.notifications.statToday,
      value: stats.today,
      icon: Send,
      accent: "bg-sky-50 text-sky-600",
      delay: 0.15,
    },
    {
      key: "broadcasts",
      label: t.admin.notifications.statBroadcasts,
      value: stats.broadcasts,
      icon: MegaphoneIcon,
      accent: "bg-purple-50 text-purple-600",
      delay: 0.2,
    },
    {
      key: "highPriority",
      label: t.admin.notifications.statHighPriority,
      value: null,
      icon: AlertTriangle,
      accent: "bg-amber-50 text-amber-600",
      delay: 0.25,
    },
  ];

  const activeChips: ActiveNotificationChip[] = useMemo(() => {
    const typeLabels = t.admin.notifications.types as Record<string, string>;
    const priorityLabels = t.admin.notifications.priorities as Record<string, string>;
    const chips: ActiveNotificationChip[] = [];
    const query = searchParams.get("q") ?? "";

    if (query.trim()) {
      chips.push({
        key: "q",
        label: `${t.admin.notifications.filters.search}: ${query.trim()}`,
        onRemove: () => {
          setSearch("");
          updateParams({ q: null, page: null });
        },
      });
    }
    if (typeFilter !== "all") {
      chips.push({
        key: "type",
        label: `${t.admin.notifications.filters.type}: ${typeLabels[typeFilter] ?? typeFilter}`,
        onRemove: () => updateParams({ type: null, page: null }),
      });
    }
    if (readFilter !== "all") {
      chips.push({
        key: "read",
        label: `${t.admin.notifications.filters.status}: ${
          readFilter === "unread"
            ? t.admin.notifications.filterUnread
            : t.admin.notifications.filterRead
        }`,
        onRemove: () => updateParams({ read: null, page: null }),
      });
    }
    if (dateFrom) {
      chips.push({
        key: "from",
        label: `${t.admin.notifications.filters.dateFrom}: ${dateFrom}`,
        onRemove: () => {
          setDateFrom("");
          updateParams({ from: null, page: null });
        },
      });
    }
    if (dateTo) {
      chips.push({
        key: "to",
        label: `${t.admin.notifications.filters.dateTo}: ${dateTo}`,
        onRemove: () => {
          setDateTo("");
          updateParams({ to: null, page: null });
        },
      });
    }
    if (uiFilters.priority !== "all") {
      chips.push({
        key: "priority",
        label: `${t.admin.notifications.filters.priority}: ${priorityLabels[uiFilters.priority] ?? uiFilters.priority}`,
        onRemove: () => setUiFilters((prev) => ({ ...prev, priority: "all" })),
      });
    }
    if (uiFilters.sort !== "newest") {
      chips.push({
        key: "sort",
        label: `${t.admin.notifications.filters.sort}: ${t.admin.notifications.filters.sortOldest}`,
        onRemove: () => setUiFilters((prev) => ({ ...prev, sort: "newest" })),
      });
    }
    return chips;
  }, [
    searchParams,
    typeFilter,
    readFilter,
    dateFrom,
    dateTo,
    uiFilters,
    t,
    updateParams,
  ]);

  const handleSearchSubmit = () => {
    updateParams({
      q: search.trim() || null,
      from: dateFrom || null,
      to: dateTo || null,
      page: null,
    });
  };

  const handleReset = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setUiFilters(DEFAULT_NOTIFICATION_UI_FILTERS);
    startTransition(() => router.push("/admin/notifications"));
  };

  const handleBroadcast = () => {
    startTransition(async () => {
      const result = await sendBroadcastNotification({
        title: broadcastTitle,
        body: broadcastBody,
        audience: broadcastAudience,
        targetUserId: broadcastAudience === "single_user" ? selectedUserId : null,
        targetCity: broadcastAudience === "city_users" ? targetCity : null,
        priority: broadcastPriority,
        actionUrl: broadcastActionUrl || null,
      });

      if (result?.error) {
        setToast({ type: "error", message: result.error });
        return;
      }

      setToast({
        type: "success",
        message: t.admin.notifications.broadcastSuccess.replace(
          "{count}",
          String(result.recipientCount ?? 0)
        ),
      });
      setBroadcastTitle("");
      setBroadcastBody("");
      setBroadcastActionUrl("");
      setSelectedUserId(null);
      setTargetCity("");
      setUserQuery("");
      router.refresh();
    });
  };

  const tabs = [
    { id: "all" as Tab, label: t.admin.notifications.tabAll, icon: Bell },
    { id: "broadcast" as Tab, label: t.admin.notifications.tabBroadcast, icon: Megaphone },
    { id: "audit" as Tab, label: t.admin.notifications.tabAudit, icon: Search },
  ];

  return (
    <div className="space-y-8">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-xl border px-4 py-3 text-sm font-medium",
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          )}
        >
          {toast.message}
        </motion.div>
      )}

      <AdminNotificationsHeader onBroadcastClick={() => setTab("broadcast")} />

      <AdminNotificationsStats cards={statCards} />

      <AdminNotificationAnalytics stats={stats} />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-surface-200/80 bg-white p-1.5 shadow-sm">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
              tab === item.id
                ? "bg-brand-600 text-white shadow-sm"
                : "text-surface-600 hover:bg-surface-50"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === "all" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <AdminNotificationsFilterToolbar
            searchInput={search}
            onSearchInputChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            typeFilter={typeFilter}
            onTypeChange={(type) =>
              updateParams({ type: type === "all" ? null : type, page: null })
            }
            readFilter={readFilter}
            onReadChange={(read) =>
              updateParams({ read: read === "all" ? null : read, page: null })
            }
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            uiFilters={uiFilters}
            onUiFiltersChange={setUiFilters}
            onReset={handleReset}
            isPending={isPending}
          />

          <AdminNotificationsActiveChips chips={activeChips} />

          <AdminNotificationsTable
            rows={displayRows}
            emptyVariant={emptyVariant}
            isPending={isPending}
            onSelect={setSelectedNotification}
          />

          <AdminNotificationsPagination
            page={list.page}
            totalPages={list.totalPages}
            total={list.total}
            onPageChange={(page) => updateParams({ page: String(page) })}
            isPending={isPending}
          />
        </motion.div>
      )}

      {tab === "broadcast" && (
        <AdminNotificationsBroadcastPanel
          cities={cities}
          broadcasts={broadcasts}
          broadcastTitle={broadcastTitle}
          broadcastBody={broadcastBody}
          broadcastAudience={broadcastAudience}
          broadcastPriority={broadcastPriority}
          broadcastActionUrl={broadcastActionUrl}
          userQuery={userQuery}
          userResults={userResults}
          selectedUserId={selectedUserId}
          targetCity={targetCity}
          isPending={isPending}
          onTitleChange={setBroadcastTitle}
          onBodyChange={setBroadcastBody}
          onAudienceChange={setBroadcastAudience}
          onPriorityChange={setBroadcastPriority}
          onActionUrlChange={setBroadcastActionUrl}
          onUserQueryChange={setUserQuery}
          onUserResultsChange={setUserResults}
          onSelectedUserIdChange={setSelectedUserId}
          onTargetCityChange={setTargetCity}
          onSend={handleBroadcast}
        />
      )}

      {tab === "audit" && <AdminNotificationsAuditTable auditLog={auditLog} />}

      <AdminNotificationDetailsDrawer
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
}
