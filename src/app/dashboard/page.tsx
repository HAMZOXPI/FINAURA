import Link from "next/link";
import { Home, Heart, Eye, MessageSquare } from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyGrid } from "@/components/properties/property-grid";
import { Button } from "@/components/ui/button";
import { resolveUserId } from "@/lib/supabase/auth";
import { getUserFavorites } from "@/services/property.service";
import { getDashboardStats } from "@/services/dashboard.service";
import { getEffectiveUserPlan } from "@/services/subscription.service";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { DashboardPlanCard } from "@/components/dashboard/dashboard-plan-card";

export default async function DashboardOverviewPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const userId = await resolveUserId();

  const [stats, favorites, effectivePlan] = await Promise.all([
    getDashboardStats(userId),
    getUserFavorites(userId),
    getEffectiveUserPlan(userId),
  ]);

  const statCards = [
    {
      label: dict.dashboard.myListings,
      value: stats.listings_count,
      icon: Home,
      href: "/dashboard/properties",
      color: "bg-brand-50 text-brand-600",
    },
    {
      label: dict.dashboard.published,
      value: stats.published_count,
      icon: Eye,
      href: "/dashboard/properties",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: dict.dashboard.favorites,
      value: stats.favorites_count,
      icon: Heart,
      href: "/dashboard/favorites",
      color: "bg-red-50 text-red-500",
    },
    {
      label: dict.dashboard.messages,
      value: stats.messages_count,
      icon: MessageSquare,
      href: "/dashboard/messages",
      color: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            {dict.dashboard.metaOverview}
          </h1>
          <p className="mt-1 text-sm text-surface-500">{dict.dashboard.welcome}</p>
        </div>
        <Button href="/dashboard/new">{dict.dashboard.newListing}</Button>
      </div>

      {effectivePlan && <DashboardPlanCard initialPlan={effectivePlan} />}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-surface-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
                <p className="text-sm text-surface-500">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {favorites.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-surface-900">
              {dict.dashboard.recentFavorites}
            </h2>
            <Link
              href="/dashboard/favorites"
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              {dict.dashboard.viewAll}
            </Link>
          </div>
          <PropertyGrid className="mt-4">
            {favorites.slice(0, 3).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </PropertyGrid>
        </section>
      )}
    </div>
  );
}
