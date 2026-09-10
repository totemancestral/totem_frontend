import type { MetadataRoute } from "next";
import { getServerEnv } from "@/lib/env";

// Seules les pages marketing publiques (sans authentification, sans contenu
// personnel) ont leur place dans un sitemap.
const PUBLIC_PATHS = ["", "/offres", "/la-maison", "/faq", "/contact", "/cgv", "/confidentialite", "/mentions"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = (getServerEnv().NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  return PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}/fr${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
    alternates: {
      languages: {
        fr: `${siteUrl}/fr${path}`,
        en: `${siteUrl}/en${path}`,
      },
    },
  }));
}
