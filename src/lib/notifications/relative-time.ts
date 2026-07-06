import type { Locale } from "@/i18n/config";

interface RelativeTimeLabels {
  justNow: string;
  minutesAgo: (n: number) => string;
  hoursAgo: (n: number) => string;
  yesterday: string;
  daysAgo: (n: number) => string;
}

const LABELS: Record<Locale, RelativeTimeLabels> = {
  fr: {
    justNow: "À l'instant",
    minutesAgo: (n) => (n === 1 ? "Il y a 1 minute" : `Il y a ${n} minutes`),
    hoursAgo: (n) => (n === 1 ? "Il y a 1 heure" : `Il y a ${n} heures`),
    yesterday: "Hier",
    daysAgo: (n) => `Il y a ${n} jours`,
  },
  ar: {
    justNow: "الآن",
    minutesAgo: (n) => (n === 1 ? "منذ دقيقة" : `منذ ${n} دقائق`),
    hoursAgo: (n) => (n === 1 ? "منذ ساعة" : `منذ ${n} ساعات`),
    yesterday: "أمس",
    daysAgo: (n) => `منذ ${n} أيام`,
  },
};

function isYesterday(date: Date, now: Date): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

export function formatNotificationRelativeTime(
  dateString: string,
  locale: Locale = "fr"
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const labels = LABELS[locale];

  if (diffMins < 1) return labels.justNow;
  if (diffMins < 60) return labels.minutesAgo(diffMins);
  if (diffHours < 24 && date.getDate() === now.getDate()) return labels.hoursAgo(diffHours);
  if (isYesterday(date, now)) return labels.yesterday;
  if (diffDays < 7) return labels.daysAgo(diffDays);

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date);
}
