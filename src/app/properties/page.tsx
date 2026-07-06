import { Suspense } from "react";
import { PropertiesBrowseView } from "@/components/properties/properties-browse-view";
import { PropertiesBrowseSkeleton } from "@/components/properties/properties-browse-skeleton";
import { getCities, getProperties } from "@/services/property.service";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { createMetadata } from "@/lib/seo";
import {
  parseBrowsePage,
  parsePropertySearchParams,
  PROPERTIES_PAGE_SIZE,
} from "@/lib/property-search";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.properties.metaTitle,
    description: dict.properties.metaDescription,
    path: "/properties",
    locale,
  });
}

interface PropertiesPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function PropertiesBrowseResults({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const filters = parsePropertySearchParams(searchParams);
  const allProperties = await getProperties(filters);
  const cities = await getCities();
  const currentPage = parseBrowsePage(searchParams.page);
  const visibleCount = currentPage * PROPERTIES_PAGE_SIZE;
  const properties = allProperties.slice(0, visibleCount);
  const hasMore = visibleCount < allProperties.length;

  return (
    <PropertiesBrowseView
      properties={properties}
      mapProperties={allProperties}
      totalCount={allProperties.length}
      hasMore={hasMore}
      currentPage={currentPage}
      cities={cities}
    />
  );
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;
  const searchKey = new URLSearchParams(
    Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]))
  ).toString();

  return (
    <Suspense key={searchKey} fallback={<PropertiesBrowseSkeleton />}>
      <PropertiesBrowseResults searchParams={params} />
    </Suspense>
  );
}
