import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardSignOut } from "@/components/dashboard/dashboard-sign-out";
import { DashboardCelebrationShell } from "@/components/dashboard/dashboard-celebration-shell";
import { PageTransition } from "@/components/layout/page-transition";
import { DashboardUserCard } from "@/components/dashboard/dashboard-user-card";
import { DashboardQuickStats } from "@/components/dashboard/dashboard-quick-stats";
import { DashboardUpgradeCard } from "@/components/dashboard/dashboard-upgrade-card";
import { requireUser } from "@/lib/supabase/auth";
import { getProfile } from "@/services/user.service";
import { getUserSubscription, getEffectiveUserPlan } from "@/services/subscription.service";
import { getDashboardStats } from "@/services/dashboard.service";
import { isPremiumPlan } from "@/lib/dashboard/workspace-display";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
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
  const [profile, subscription, effectivePlan, stats] = await Promise.all([
    getProfile(user.id),
    getUserSubscription(user.id),
    getEffectiveUserPlan(user.id),
    getDashboardStats(user.id),
  ]);

  const userName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string) ??
    user.email?.split("@")[0] ??
    "User";

  const planSlug = subscription?.plan?.slug ?? "free";
  const planLabel = effectivePlan?.displayName ?? subscription?.plan?.name ?? "Free";
  const isPremium = isPremiumPlan(planSlug);

  return (
    <div className="container-app py-8 lg:py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-5">
            <DashboardUserCard
              userName={userName}
              avatarUrl={profile?.avatar_url ?? null}
              verifiedSeller={Boolean(profile?.verified_seller)}
              memberSinceDate={profile?.created_at ?? null}
              planSlug={planSlug}
              planLabel={planLabel}
            />

            <DashboardQuickStats
              activeListingsCount={stats.published_count}
              favoritesCount={stats.favorites_count}
            />

            <div className="my-5 border-t border-surface-200" />

            <DashboardNav />

            <DashboardUpgradeCard isPremium={isPremium} />

            <DashboardSignOut />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <PageTransition>
            <DashboardCelebrationShell>{children}</DashboardCelebrationShell>
          </PageTransition>
        </div>
      </div>
    </div>
  );
}
