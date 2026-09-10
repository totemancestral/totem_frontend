import type { MetadataRoute } from "next";
import { getServerEnv } from "@/lib/env";

// Tout ce qui exige une session (parcours d'achat, espace personnel, admin)
// n'a aucune valeur pour un moteur de recherche et ne doit jamais apparaître
// dans des résultats de recherche.
const PRIVATE_PATHS = [
  "/*/connexion",
  "/*/inscription",
  "/*/mot-de-passe-oublie",
  "/*/verification",
  "/*/parcours",
  "/*/parcours-junior",
  "/*/paiement",
  "/*/paiement-junior",
  "/*/confirmation",
  "/*/confirmation-junior",
  "/*/oeuvre",
  "/*/espace",
  "/*/commandes",
  "/*/oeuvres",
  "/*/profil",
  "/*/consultations",
  "/*/consultation-question",
  "/*/consultation-tirage",
  "/*/admin",
  "/api/",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (getServerEnv().NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_PATHS,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
