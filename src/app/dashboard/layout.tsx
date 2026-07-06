import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardSignOut } from "@/components/dashboard/dashboard-sign-out";
import { DashboardCelebrationShell } from "@/components/dashboard/dashboard-celebration-shell";
import { requireUser } from "@/lib/supabase/auth";
import { getProfile } from "@/services/user.service";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { getInitials } from "@/lib/utils";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.dashboard.metaOverview,
    description: dict.meta.siteDescription,
    path: "/dashboard",
    noIndex: true,
    locale,
  });
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  const userName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string) ??
    user.email?.split("@")[0] ??
    "User";
  const userEmail = user.email ?? "";

  return (
    <div className="container-app py-8 lg:py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="lg:w-56 lg:shrink-0">
          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">
                {getInitials(userName)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-surface-900">{userName}</p>
                <p className="truncate text-xs text-surface-500">{userEmail}</p>
              </div>
            </div>
            <DashboardNav />
            <DashboardSignOut />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <DashboardCelebrationShell>{children}</DashboardCelebrationShell>
        </div>
      </div>
    </div>
  );
}
