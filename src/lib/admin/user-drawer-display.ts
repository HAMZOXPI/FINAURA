import type { AdminActivityItem } from "@/services/admin.service";
import type { AdminUsersTableRow } from "@/lib/admin/users-display";

export function getUserRelatedActivity(
  user: AdminUsersTableRow,
  activity: AdminActivityItem[]
): AdminActivityItem[] {
  const normalizedName = user.full_name?.trim().toLowerCase();
  const normalizedEmail = user.email.trim().toLowerCase();

  return activity
    .filter((item) => {
      if (item.id === `user-${user.id}`) return true;
      if (normalizedName && item.title.trim().toLowerCase() === normalizedName) return true;
      if (normalizedEmail && item.title.trim().toLowerCase() === normalizedEmail) return true;
      if (normalizedEmail && item.subtitle.toLowerCase().includes(normalizedEmail)) return true;
      return false;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
}

export function getLastActivityLabel(
  user: AdminUsersTableRow,
  activity: AdminActivityItem[],
  locale: string
): string | null {
  const items = getUserRelatedActivity(user, activity);
  if (items.length === 0) return null;

  const date = new Date(items[0].createdAt);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function mapActivityToDrawerEvent(
  item: AdminActivityItem,
  labels: Record<string, string>
): { emoji: string; title: string; subtitle: string } {
  switch (item.type) {
    case "user":
      return { emoji: "👤", title: labels.joined, subtitle: item.title };
    case "property":
      return { emoji: "🏠", title: labels.listing, subtitle: item.title };
    case "verification":
      return { emoji: "🛡️", title: labels.verification, subtitle: item.subtitle };
    case "message":
      return { emoji: "💬", title: labels.message, subtitle: item.subtitle };
    default:
      return { emoji: "•", title: item.title, subtitle: item.subtitle };
  }
}
