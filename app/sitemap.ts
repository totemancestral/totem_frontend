import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// Seules les pages marketing publiques (sans authentification, sans contenu
// personnel) ont leur place dans un sitemap.
const PUBLIC_PATHS = ["", "/offres", "/la-maison", "/faq", "/contact", "/cgv", "/confidentialite", "/mentions"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();

  return PUBLIC_PATHS.flatMap((path) => (["fr", "en"] as const).map(lang => ({
    url: `${base}/${lang}${path}`,
    changeFrequency: path === "" ? "weekly" as const : "monthly" as const,
    priority: path === "" ? 1 : 0.6,
    alternates: {
      languages: {
        fr: `${base}/fr${path}`,
        en: `${base}/en${path}`,
      },
    },
  })));
}
