import { getServerEnv } from "@/lib/env";
import type { Locale } from "@/app/[lang]/dictionaries";

export function siteUrl(): string {
  return (getServerEnv().NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
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
