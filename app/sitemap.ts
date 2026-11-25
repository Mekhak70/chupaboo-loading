import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.chupaboo.com";
  const locales = ["hy", "en", "ru", "pl"];

  return locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    changeFrequency: "weekly",
    priority: 1,
    alternates: {
      languages: {
        hy: `${baseUrl}/hy`,
        en: `${baseUrl}/en`,
        ru: `${baseUrl}/ru`,
        pl: `${baseUrl}/pl`,
      },
    },
  }));
}