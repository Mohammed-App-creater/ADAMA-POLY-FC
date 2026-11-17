import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...Object.keys(PAGES).map((path) => ({ url: SITE_URL + path, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
