import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/dashboard/property-form";
import { getAdminPropertyById } from "@/services/admin-property.service";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { Button } from "@/components/ui/button";

interface AdminPropertyEditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AdminPropertyEditPageProps) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const property = await getAdminPropertyById(id);

  return createMetadata({
    title: property
      ? `${dict.admin.properties.editTitle} · ${property.title}`
      : dict.admin.properties.editTitle,
    description: dict.admin.properties.editSubtitle,
    path: `/admin/properties/${id}/edit`,
    noIndex: true,
    locale,
  });
}

export default async function AdminPropertyEditPage({ params }: AdminPropertyEditPageProps) {
  await requireAdmin();
  const { id } = await params;
  const property = await getAdminPropertyById(id);

  if (!property) notFound();

  const dict = getDictionary(await getLocale());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- admin-only fields omitted for form
  const { owner, favorite_count, admin_status, ...propertyForForm } = property;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/properties">
            <Button type="button" variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              {dict.admin.properties.backToList}
            </Button>
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
            {dict.admin.properties.editTitle}
          </h1>
          <p className="mt-2 text-surface-500">{property.title}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        <PropertyForm property={propertyForForm} mode="edit" adminEdit />
      </div>
    </div>
  );
}
