import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { PropertyStructuredData } from "@/components/seo/structured-data";
import { PropertyDetailFeatures } from "@/components/properties/property-detail-features";
import { PropertyDescription } from "@/components/properties/property-description";
import { PropertyDetailSidebar } from "@/components/properties/property-detail-sidebar";
import { SimilarPropertiesSection } from "@/components/properties/similar-properties-section";
import { SellerReviewsSection } from "@/components/seller/seller-reviews-section";
import { PropertyDetailGallerySkeleton } from "@/components/properties/property-detail-gallery";
import { getCurrentUser } from "@/services/user.service";
import {
  getPropertyById,
  getProperties,
  isFavorite,
} from "@/services/property.service";
import { getSellerPublicProfile } from "@/services/seller.service";
import { createMetadata } from "@/lib/seo";
import {
  formatDate,
  getPropertyTypeLabel,
  getPropertyStatusLabel,
  interpolate,
} from "@/lib/utils";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import type { Locale } from "@/i18n/config";
import type { PropertyStatus } from "@/types/database";
import { MapPin, Calendar } from "lucide-react";

const PropertyDetailGallery = dynamic(
  () =>
    import("@/components/properties/property-detail-gallery").then(
      (m) => m.PropertyDetailGallery
    ),
  { loading: () => <PropertyDetailGallerySkeleton /> }
);

const PropertyMap = dynamic(
  () => import("@/components/properties/property-map").then((m) => m.PropertyMap),
  {
    loading: () => (
      <div className="h-72 animate-pulse rounded-[20px] bg-surface-200 sm:h-96" />
    ),
  }
);

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDetailPrice(price: number, status: PropertyStatus, locale: Locale): string {
  const num = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace(/\u00a0/g, " ");

  const base = `${num} DH`;
  const rentSuffix = locale === "ar" ? "/شهر" : "/mois";
  return status === "for_rent" ? `${base}${rentSuffix}` : base;
}

function statusBadgeClass(status: PropertyStatus): string {
  switch (status) {
    case "for_rent":
      return "bg-brand-50 text-brand-700";
    case "sold":
      return "bg-surface-100 text-surface-600";
    case "pending":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-emerald-50 text-emerald-700";
  }
}

export async function generateMetadata({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const property = await getPropertyById(id);

  if (!property) {
    return createMetadata({
      title: dict.errors.notFoundTitle,
      noIndex: true,
      locale,
    });
  }

  return createMetadata({
    title: property.title,
    description: property.description.slice(0, 160),
    path: `/properties/${id}`,
    image: property.images[0],
    locale,
  });
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  const user = await getCurrentUser();

  let favorited = false;
  if (user) {
    favorited = await isFavorite(user.id, property.id);
  }

  const similarProperties = (
    await getProperties({ city: property.city, property_type: property.property_type })
  )
    .filter((item) => item.id !== property.id)
    .slice(0, 8);

  const seller = property.owner_id
    ? await getSellerPublicProfile(property.owner_id, user?.id, 5)
    : null;

  const statusLabel = getPropertyStatusLabel(property.status, dict);
  const typeLabel = getPropertyTypeLabel(property.property_type, dict);

  return (
    <>
      <PropertyStructuredData property={property} />
      <div className="container-app py-8 lg:py-10">
        <Link
          href="/properties"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-surface-500 transition-colors duration-[250ms] hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          {dict.properties.backToList}
        </Link>

        {user?.id === property.owner_id && (
          <div className="mb-4 flex justify-end">
            <Link
              href={`/dashboard/${property.id}/edit`}
              className="inline-flex h-10 items-center rounded-xl border border-surface-200 bg-white px-4 text-sm font-semibold text-surface-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              {dict.dashboard.edit}
            </Link>
          </div>
        )}

        <PropertyDetailGallery images={property.images} title={property.title} />

        <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="min-w-0 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold ${statusBadgeClass(property.status)}`}
              >
                {statusLabel}
              </span>
              {property.is_featured && (
                <span className="inline-flex items-center rounded-lg bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {dict.properties.featured}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-surface-500">
                <Calendar className="h-4 w-4" />
                {interpolate(dict.propertyDetail.publishedOn, {
                  date: formatDate(property.created_at, locale),
                })}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              {property.title}
            </h1>

            <p className="mt-3 flex items-start gap-2 text-base text-surface-600 sm:text-lg">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <span>
                {property.city}
                {property.state ? `, ${property.state}` : ""}
              </span>
            </p>

            <p
              className="mt-5 text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl"
              dir={locale === "ar" ? "ltr" : undefined}
            >
              <span className="[unicode-bidi:isolate]">
                {formatDetailPrice(property.price, property.status, locale)}
              </span>
            </p>

            <div className="mt-10 space-y-10">
              <PropertyDetailFeatures property={property} typeLabel={typeLabel} />
              <PropertyDescription description={property.description} />

              {property.latitude && property.longitude && (
                <section>
                  <h2 className="text-xl font-bold text-surface-900 sm:text-2xl">
                    {dict.properties.location}
                  </h2>
                  <p className="mt-2 text-sm text-surface-500">
                    {property.address}, {property.city}, {property.state} {property.zip_code}
                  </p>
                  <div className="mt-4 overflow-hidden rounded-[20px] border border-surface-200/80 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]">
                    <PropertyMap
                      latitude={property.latitude}
                      longitude={property.longitude}
                      title={property.title}
                    />
                  </div>
                </section>
              )}

              {seller && (
                <SellerReviewsSection
                  seller={seller}
                  propertyId={property.id}
                />
              )}
            </div>
          </div>

          <PropertyDetailSidebar
            propertyId={property.id}
            propertyTitle={property.title}
            seller={seller}
            favorited={favorited}
            defaultName={(user?.user_metadata?.full_name as string) ?? ""}
            defaultEmail={user?.email ?? ""}
          />
        </div>

        <SimilarPropertiesSection properties={similarProperties} />
      </div>
    </>
  );
}
