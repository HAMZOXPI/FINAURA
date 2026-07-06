import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { PropertyForm } from "@/components/dashboard/property-form";
import { requireUser } from "@/lib/supabase/auth";
import { getPropertyById } from "@/services/property.service";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.dashboard.editTitle,
    description: dict.dashboard.editSubtitle,
    path: `/dashboard/${id}/edit`,
    noIndex: true,
    locale,
  });
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const dict = getDictionary(await getLocale());
  const user = await requireUser();

  const property = await getPropertyById(id);

  if (!property) notFound();

  if (user && property.owner_id !== user.id) {
    redirect("/dashboard/properties");
  }

  return (
    <div>
      <Link
        href="/dashboard/properties"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        {dict.dashboard.backToProperties}
      </Link>

      <h1 className="text-2xl font-bold text-surface-900">{dict.dashboard.editTitle}</h1>
      <p className="mt-1 text-sm text-surface-500">{dict.dashboard.editSubtitle}</p>

      <div className="mt-8 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
        <PropertyForm
          property={property}
          mode="edit"
          returnTo={`/properties/${property.id}`}
        />
      </div>
    </div>
  );
}
