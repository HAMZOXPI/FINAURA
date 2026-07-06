import { notFound } from "next/navigation";
import { getCurrentUser } from "@/services/user.service";
import {
  getSellerActiveListings,
  getSellerPublicProfile,
} from "@/services/seller.service";
import { SellerProfileView } from "@/components/seller/seller-profile-view";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

interface SellerProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SellerProfilePageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const seller = await getSellerPublicProfile(id, null, 1);

  if (!seller) {
    return createMetadata({
      title: dict.errors.notFoundTitle,
      noIndex: true,
      locale,
    });
  }

  return createMetadata({
    title: seller.profile.full_name ?? dict.properties.defaultAgent,
    description: seller.profile.bio ?? dict.seller.profileMetaDescription,
    path: `/seller/${id}`,
    image: seller.profile.avatar_url ?? undefined,
    locale,
  });
}

export default async function SellerProfilePage({ params }: SellerProfilePageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const seller = await getSellerPublicProfile(id, user?.id, 100);

  if (!seller) {
    notFound();
  }

  const listings = await getSellerActiveListings(id);

  return <SellerProfileView seller={seller} listings={listings} />;
}
