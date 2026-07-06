import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { getProperties } from "@/services/property.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getProperties();

  const propertyUrls = properties.map((property) => ({
    url: `${siteConfig.url}/properties/${property.id}`,
    lastModified: new Date(property.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/properties`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...propertyUrls,
  ];
}
