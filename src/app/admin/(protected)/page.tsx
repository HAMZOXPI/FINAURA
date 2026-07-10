import { AdminExecutiveDashboard } from "@/components/admin/dashboard/admin-executive-dashboard";
import { getAdminBoostHistory, getAdminBoostStats, getAdminFeaturedListings } from "@/services/admin-boost.service";
import { getAdminDashboardStats, getAdminRecentActivity } from "@/services/admin.service";
import { getBoostSettings } from "@/services/boost-settings.service";

export default async function AdminDashboardPage() {
  const [stats, boostStats, boostHistory, activity, featuredListings, boostSettings] =
    await Promise.all([
      getAdminDashboardStats(),
      getAdminBoostStats(),
      getAdminBoostHistory(200),
      getAdminRecentActivity(20),
      getAdminFeaturedListings(),
      getBoostSettings(),
    ]);

  return (
    <AdminExecutiveDashboard
      stats={stats}
      boostStats={boostStats}
      boostHistory={boostHistory}
      activity={activity}
      featuredListings={featuredListings}
      boostSettings={boostSettings}
    />
  );
}
