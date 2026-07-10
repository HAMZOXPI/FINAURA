"use client";

import type { Property, SellerPublicProfile } from "@/types/database";
import { SellerProfileLayout } from "@/components/seller/profile/seller-profile-layout";

interface SellerProfileViewProps {
  seller: SellerPublicProfile;
  listings: Property[];
}

export function SellerProfileView({ seller, listings }: SellerProfileViewProps) {
  return <SellerProfileLayout seller={seller} listings={listings} />;
}
