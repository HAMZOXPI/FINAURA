import { notFound } from "next/navigation";

import { PropertyStructuredData } from "@/components/seo/structured-data";

import { PropertyDetailsLayout } from "@/components/property/details/property-details-layout";

import { getCurrentUser } from "@/services/user.service";

import {

  getPropertyById,

  getProperties,

  isFavorite,

} from "@/services/property.service";

import { getSellerPublicProfile } from "@/services/seller.service";

import { createMetadata } from "@/lib/seo";

import { getPropertyTypeLabel, getPropertyStatusLabel } from "@/lib/utils";

import { getDictionary } from "@/i18n/get-dictionary";

import { getLocale } from "@/i18n/server";



interface PropertyDetailPageProps {

  params: Promise<{ id: string }>;

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

      <PropertyDetailsLayout

        property={property}

        favorited={favorited}

        seller={seller}

        similarProperties={similarProperties}

        statusLabel={statusLabel}

        typeLabel={typeLabel}

        featuredPosition={(property as { featured_position?: number }).featured_position}

        defaultName={(user?.user_metadata?.full_name as string) ?? ""}

        defaultEmail={user?.email ?? ""}

        isOwner={user?.id === property.owner_id}

      />

    </>

  );

}

