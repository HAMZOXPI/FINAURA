import { redirect } from "next/navigation";

interface LegacySellerPageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacySellerProfileRedirect({ params }: LegacySellerPageProps) {
  const { id } = await params;
  redirect(`/seller/${id}`);
}
