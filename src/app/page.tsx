import { HomePage } from "@/components/home/home-page";
import { getFeaturedProperties, getProperties } from "@/services/property.service";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.home.metaTitle,
    description: dict.home.metaDescription,
    path: "/",
    locale,
  });
}

export default async function Page() {
  const [featured, allProperties] = await Promise.all([
    getFeaturedProperties(6),
    getProperties(),
  ]);

  const latest = allProperties.slice(0, 6);

  return <HomePage featured={featured} latest={latest} />;
}
