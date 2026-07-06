import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

const siteConfig = {
  name: "Finaura",
  description:
    "Découvrez, achetez et vendez des biens immobiliers au Maroc avec Finaura.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://finaura.com",
  ogImage: "/og-image.png",
};

export function createMetadata({
  title,
  description,
  path = "",
  noIndex = false,
  image,
  locale = "fr",
}: {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  image?: string;
  locale?: Locale;
} = {}): Metadata {
  const siteTitle =
    locale === "ar"
      ? "Finaura — العقارات في المغرب"
      : "Finaura — Immobilier au Maroc";
  const siteDescription =
    locale === "ar"
      ? "اكتشف واشتري وبع العقارات في المغرب مع Finaura."
      : "Découvrez, achetez et vendez des biens immobiliers au Maroc avec Finaura.";

  const pageTitle = title ? `${title} | Finaura` : siteTitle;
  const pageDescription = description || siteDescription;
  const url = `${siteConfig.url}${path}`;
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${siteConfig.url}${image}`
    : `${siteConfig.url}${siteConfig.ogImage}`;

  return {
    title: pageTitle,
    description: pageDescription,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: url },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export { siteConfig };
