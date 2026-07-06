"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Search,
  Send,
} from "lucide-react";
import { sendBroadcastNotification, searchBroadcastUsers } from "@/actions/admin-notification.actions";
import type {
  AdminBroadcastListResult,
  AdminNotificationListResult,
  AdminNotificationStats,
} from "@/services/admin-notification.service";
import type { NotificationAuditLog, NotificationAudience, NotificationPriority, NotificationType } from "@/types/database";
import { BROADCAST_AUDIENCES, NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from "@/lib/notifications/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
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
  const { t, locale } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("all");

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") ?? "");

  const typeFilter = (searchParams.get("type") ?? "all") as NotificationType | "all";
  const readFilter = (searchParams.get("read") ?? "all") as "all" | "read" | "unread";

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

  const typeLabel = (type: NotificationType) => {
    const labels = t.admin.notifications.types as Record<string, string>;
    return labels[type] ?? type;
  };

  const priorityLabel = (priority: NotificationPriority) => {
    const labels = t.admin.notifications.priorities as Record<string, string>;
    return labels[priority] ?? priority;
  };

  const audienceLabel = (audience: NotificationAudience) => {
    const labels = t.admin.notifications.audiences as Record<string, string>;
    return labels[audience] ?? audience;
  };

  const statCards = [
    { label: t.admin.notifications.statTotal, value: stats.total },
    { label: t.admin.notifications.statUnread, value: stats.unread },
    { label: t.admin.notifications.statRead, value: stats.read },
    { label: t.admin.notifications.statToday, value: stats.today },
    { label: t.admin.notifications.statBroadcasts, value: stats.broadcasts },
  ];

  const handleSearchUsers = async (query: string) => {
    setUserQuery(query);
    if (query.trim().length < 2) {
      setUserResults([]);
      return;
    }
    const result = await searchBroadcastUsers(query.trim());
    if ("users" in result && result.users) setUserResults(result.users);
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

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm font-medium",
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          )}
        >
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
          {t.admin.notifications.title}
        </h1>
        <p className="mt-2 text-surface-500">{t.admin.notifications.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-surface-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-surface-900">{card.value}</p>
          </div>
        ))}
      </div>

      {Object.keys(stats.byType).length > 0 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-surface-900">{t.admin.notifications.statByType}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(stats.byType)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([type, count]) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-2 rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-700"
                >
                  {typeLabel(type as NotificationType)}
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                    {count}
                  </span>
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-2xl border border-surface-200 bg-white p-1.5 shadow-sm">
        {(
          [
            { id: "all" as Tab, label: t.admin.notifications.tabAll, icon: Bell },
            { id: "broadcast" as Tab, label: t.admin.notifications.tabBroadcast, icon: Megaphone },
            { id: "audit" as Tab, label: t.admin.notifications.tabAudit, icon: Search },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
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
        <>
          <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
              <div className="relative xl:col-span-2">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.admin.notifications.searchPlaceholder}
                  className="ps-9"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(event) =>
                  updateParams({ type: event.target.value === "all" ? null : event.target.value, page: null })
                }
                className="h-10 rounded-xl border border-surface-300 bg-white px-3 text-sm"
              >
                <option value="all">{t.admin.notifications.filterAllTypes}</option>
                {NOTIFICATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {typeLabel(type)}
                  </option>
                ))}
              </select>
              <select
                value={readFilter}
                onChange={(event) =>
                  updateParams({ read: event.target.value === "all" ? null : event.target.value, page: null })
                }
                className="h-10 rounded-xl border border-surface-300 bg-white px-3 text-sm"
              >
                <option value="all">{t.admin.notifications.filterAllRead}</option>
                <option value="unread">{t.admin.notifications.filterUnread}</option>
                <option value="read">{t.admin.notifications.filterRead}</option>
              </select>
              <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
              <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
              <Button
                type="button"
                className="xl:col-span-2"
                onClick={() =>
                  updateParams({
                    q: search.trim() || null,
                    from: dateFrom || null,
                    to: dateTo || null,
                    page: null,
                  })
                }
              >
                {t.admin.notifications.searchButton}
              </Button>
            </div>
          </div>

          <div className={cn("overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm", isPending && "opacity-60")}>
            {list.rows.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-surface-500">
                {t.admin.notifications.empty}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-surface-200">
                  <thead className="bg-surface-50">
                    <tr>
                      <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-surface-500">{t.admin.notifications.colUser}</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-surface-500">{t.admin.notifications.colType}</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-surface-500">{t.admin.notifications.colPriority}</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-surface-500">{t.admin.notifications.colTitle}</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-surface-500">{t.admin.notifications.colRead}</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-surface-500">{t.admin.notifications.colDate}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {list.rows.map((row) => (
                      <tr key={row.id} className="hover:bg-surface-50/80">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-surface-900">{row.recipient?.full_name || "—"}</p>
                          <p className="text-xs text-surface-500">{row.recipient?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-surface-700">{typeLabel(row.notification_type)}</td>
                        <td className="px-4 py-3 text-sm text-surface-700">{priorityLabel(row.priority)}</td>
                        <td className="max-w-xs px-4 py-3">
                          <p className="truncate text-sm font-medium text-surface-900">{row.title}</p>
                          <p className="truncate text-xs text-surface-500">{row.body}</p>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {row.is_read ? t.admin.notifications.readYes : t.admin.notifications.readNo}
                        </td>
                        <td className="px-4 py-3 text-sm text-surface-500">{formatDate(row.created_at, locale)}</td>
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
                {t.admin.notifications.pageInfo
                  .replace("{page}", String(list.page))
                  .replace("{totalPages}", String(list.totalPages))
                  .replace("{total}", String(list.total))}
              </p>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" disabled={list.page <= 1 || isPending} onClick={() => updateParams({ page: String(list.page - 1) })}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={list.page >= list.totalPages || isPending} onClick={() => updateParams({ page: String(list.page + 1) })}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "broadcast" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900">{t.admin.notifications.broadcastTitle}</h2>
            <p className="mt-1 text-sm text-surface-500">{t.admin.notifications.broadcastSubtitle}</p>
            <div className="mt-5 space-y-4">
              <Input value={broadcastTitle} onChange={(event) => setBroadcastTitle(event.target.value)} placeholder={t.admin.notifications.fieldTitle} />
              <Textarea value={broadcastBody} onChange={(event) => setBroadcastBody(event.target.value)} placeholder={t.admin.notifications.fieldBody} className="min-h-[120px]" />
              <Input value={broadcastActionUrl} onChange={(event) => setBroadcastActionUrl(event.target.value)} placeholder={t.admin.notifications.fieldActionUrl} />
              <select value={broadcastAudience} onChange={(event) => setBroadcastAudience(event.target.value as NotificationAudience)} className="h-10 w-full rounded-xl border border-surface-300 px-3 text-sm">
                {BROADCAST_AUDIENCES.map((audience) => (
                  <option key={audience} value={audience}>{audienceLabel(audience)}</option>
                ))}
              </select>
              <select value={broadcastPriority} onChange={(event) => setBroadcastPriority(event.target.value as NotificationPriority)} className="h-10 w-full rounded-xl border border-surface-300 px-3 text-sm">
                {NOTIFICATION_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>{priorityLabel(priority)}</option>
                ))}
              </select>
              {broadcastAudience === "single_user" && (
                <div>
                  <Input value={userQuery} onChange={(event) => handleSearchUsers(event.target.value)} placeholder={t.admin.notifications.userSearchPlaceholder} />
                  {userResults.length > 0 && (
                    <ul className="mt-2 max-h-40 overflow-auto rounded-xl border border-surface-200">
                      {userResults.map((user) => (
                        <li key={user.id}>
                          <button type="button" className="w-full px-3 py-2 text-start text-sm hover:bg-surface-50" onClick={() => { setSelectedUserId(user.id); setUserQuery(user.full_name || user.email); setUserResults([]); }}>
                            {user.full_name || user.email}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {broadcastAudience === "city_users" && (
                <select
                  value={targetCity}
                  onChange={(event) => setTargetCity(event.target.value)}
                  className="h-10 w-full rounded-xl border border-surface-300 px-3 text-sm"
                >
                  <option value="">{t.admin.notifications.selectCity}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              )}
              <Button type="button" isLoading={isPending} onClick={handleBroadcast}>
                <Send className="h-4 w-4" />
                {t.admin.notifications.sendBroadcast}
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900">{t.admin.notifications.recentBroadcasts}</h2>
            <ul className="mt-4 space-y-3">
              {broadcasts.rows.length === 0 ? (
                <li className="text-sm text-surface-500">{t.admin.notifications.noBroadcasts}</li>
              ) : (
                broadcasts.rows.map((broadcast) => (
                  <li key={broadcast.id} className="rounded-xl border border-surface-100 bg-surface-50/50 p-3">
                    <p className="font-medium text-surface-900">{broadcast.title}</p>
                    <p className="mt-1 text-xs text-surface-600">{broadcast.body}</p>
                    <p className="mt-2 text-xs text-surface-400">
                      {audienceLabel(broadcast.audience)}
                      {broadcast.target_city ? ` · ${broadcast.target_city}` : ""}
                      {" · "}
                      {broadcast.recipient_count} {t.admin.notifications.delivered}
                      {" · "}
                      {broadcast.delivered_count}/{broadcast.recipient_count} {t.admin.notifications.deliveryStatus}
                      {" · "}
                      {broadcast.read_count} {t.admin.notifications.read}
                      {" · "}
                      {formatDate(broadcast.created_at, locale)}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      )}

      {tab === "audit" && (
        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
          {auditLog.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-surface-500">{t.admin.notifications.auditEmpty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-200">
                <thead className="bg-surface-50">
                  <tr>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-surface-500">{t.admin.notifications.colAction}</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-surface-500">{t.admin.notifications.colUser}</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-surface-500">{t.admin.notifications.colDate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {auditLog.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-3 text-sm text-surface-700">{entry.action}</td>
                      <td className="px-4 py-3 text-sm text-surface-500">{entry.user_id?.slice(0, 8) ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-surface-500">{formatDate(entry.created_at, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
