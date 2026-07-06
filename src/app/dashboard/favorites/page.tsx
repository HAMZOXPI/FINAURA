import { PropertyCard } from "@/components/properties/property-card";
import { PropertyGrid } from "@/components/properties/property-grid";
import { Button } from "@/components/ui/button";
import { resolveUserId } from "@/lib/supabase/auth";
import { getUserFavorites } from "@/services/property.service";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.dashboard.favoritesTitle,
    description: dict.dashboard.favoritesSubtitle,
    path: "/dashboard/favorites",
    noIndex: true,
    locale,
  });
}

export default async function DashboardFavoritesPage() {
  const dict = getDictionary(await getLocale());
  const userId = await resolveUserId();
  const favorites = await getUserFavorites(userId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900">{dict.dashboard.favoritesTitle}</h1>
      <p className="mt-1 text-sm text-surface-500">{dict.dashboard.favoritesSubtitle}</p>

      {favorites.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-surface-200 bg-white py-16 text-center">
          <p className="text-surface-500">{dict.dashboard.noFavorites}</p>
          <Button href="/properties" variant="outline" className="mt-4">
            {dict.dashboard.browseProperties}
          </Button>
        </div>
      ) : (
        <PropertyGrid className="mt-8">
          {favorites.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </PropertyGrid>
      )}
    </div>
  );
}
