import { getServerEnv } from "@/lib/env";
import type { Locale } from "@/app/[lang]/dictionaries";

export function siteUrl(): string {
  const configured = getServerEnv().NEXT_PUBLIC_SITE_URL;
  const url = new URL(configured || (process.env.NODE_ENV === "production" ? "https://www.totem-ancestral.com" : "http://localhost:3000"));
  // Both production hosts resolve to www. Never publish the redirecting host
  // in canonical URLs, hreflang, social cards or the sitemap.
  if (["totem-ancestral.com", "www.totem-ancestral.com"].includes(url.hostname)) {
    url.protocol = "https:";
    url.hostname = "www.totem-ancestral.com";
    url.port = "";
  }
  return url.origin;
}

export function socialImages(locale: Locale) {
  return [{ url: `${siteUrl()}/${locale}/opengraph-image`, width: 1200, height: 630, alt: "Totem Ancestral" }];
}

export function baseTwitter(locale: Locale) {
  return { card: "summary_large_image" as const, images: socialImages(locale) };
}

/**
 * Next.js remplace entièrement `openGraph` d'un segment à l'autre plutôt que
 * de le fusionner (voir "Overwriting fields" dans la doc generate-metadata) :
 * chaque page doit donc réinclure ces champs communs pour ne pas perdre le
 * siteName/type/locale déjà posés par le layout racine.
 */
export function baseOpenGraph(locale: Locale, siteName: string) {
  return {
    type: "website" as const,
    siteName,
    locale: locale === "en" ? "en_US" : "fr_FR",
    images: socialImages(locale),
  };
}

/** Canonical + hreflang pour une page publique, identique dans les deux langues. */
export function pageAlternates(locale: Locale, path: string) {
  const base = siteUrl();
  return {
    canonical: `${base}/${locale}${path}`,
    languages: {
      fr: `${base}/fr${path}`,
      en: `${base}/en${path}`,
    },
  };
}
