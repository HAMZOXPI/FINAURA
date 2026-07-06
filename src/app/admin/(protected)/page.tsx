import { AdminRecentActivity } from "@/components/admin/admin-recent-activity";
import { AdminStatsGrid } from "@/components/admin/admin-stats-grid";
import { getAdminDashboardStats, getAdminRecentActivity } from "@/services/admin.service";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

export default async function AdminDashboardPage() {
  const dict = getDictionary(await getLocale());
  const [stats, activity] = await Promise.all([
    getAdminDashboardStats(),
    getAdminRecentActivity(10),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
          {dict.admin.dashboardTitle}
        </h1>
        <p className="mt-2 text-surface-500">{dict.admin.dashboardSubtitle}</p>
      </div>

      <AdminStatsGrid
        stats={stats}
        labels={{
          totalUsers: dict.admin.totalUsers,
          totalProperties: dict.admin.totalProperties,
          activeListings: dict.admin.activeListings,
          pendingVerification: dict.admin.pendingVerification,
          totalMessages: dict.admin.totalMessages,
          premiumUsers: dict.admin.premiumUsers,
        }}
      />

      <AdminRecentActivity items={activity} />
    </div>
  );
}
