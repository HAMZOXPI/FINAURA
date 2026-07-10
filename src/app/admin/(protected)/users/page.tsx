import { AdminUsersManager } from "@/components/admin/users/admin-users-manager";
import { getAdminDashboardStats, getAdminRecentActivity } from "@/services/admin.service";
import { searchAdminGiftUsers } from "@/services/admin-promotion.service";
import type { AdminUsersTableRow } from "@/lib/admin/users-display";
import { dedupeUsers } from "@/lib/admin/users-display";

export default async function AdminUsersPage() {
  const [stats, giftUsers, activity] = await Promise.all([
    getAdminDashboardStats(),
    searchAdminGiftUsers("co", 100),
    getAdminRecentActivity(50),
  ]);

  const activityUsers: AdminUsersTableRow[] = activity
    .filter((item) => item.type === "user")
    .map((item) => ({
      id: item.id.replace(/^user-/, ""),
      full_name: item.title,
      email: item.title.includes("@") ? item.title : "",
      avatar_url: null,
      created_at: item.createdAt,
    }));

  const initialUsers = dedupeUsers([
    ...giftUsers.map((user) => ({ ...user, created_at: null })),
    ...activityUsers,
  ]);

  return <AdminUsersManager stats={stats} initialUsers={initialUsers} activity={activity} />;
}
