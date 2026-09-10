import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, type Locale } from "./app/[lang]/dictionaries";
import { maintenanceHtml } from "./lib/maintenance";

const defaultLocale: Locale = "fr";
const BYPASS_COOKIE = "totem_bypass";
const BYPASS_ROUTE = "/api/bypass-maintenance";

// Regarde l'en-tête Accept-Language envoyé par le navigateur
// (ex: "en-US,en;q=0.9,fr;q=0.8") et retient la langue préférée
// si on la supporte, sinon on retombe sur le français par défaut.
function getPreferredLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0];
  return locales.includes(preferred as Locale) ? (preferred as Locale) : defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Mode maintenance : bloque tout le site (pages ET API) en 503, sauf la
  // route de contournement elle-même. Activé via MAINTENANCE_MODE=true ;
  // contourné par l'équipe via un cookie posé par /api/bypass-maintenance.
  if (process.env.MAINTENANCE_MODE === "true" && pathname !== BYPASS_ROUTE) {
    const secret = process.env.MAINTENANCE_BYPASS_SECRET;
    const bypassed = Boolean(secret) && request.cookies.get(BYPASS_COOKIE)?.value === secret;
    if (!bypassed) {
      return new NextResponse(maintenanceHtml(getPreferredLocale(request)), {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8", "Retry-After": "3600" },
      });
    }
  }

  // Les routes API ne prennent jamais de préfixe de langue.
  if (pathname.startsWith("/api")) return NextResponse.next();

  // Si l'URL a déjà un préfixe de langue (/fr/... ou /en/...), on ne touche à rien.
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (pathnameHasLocale) return;

  // Sinon (ex: quelqu'un visite juste "/"), on redirige vers la bonne langue.
  const locale = getPreferredLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // On laisse passer les fichiers internes de Next.js, le favicon, les
    // icônes générées par code (app/icon.tsx, app/apple-icon.tsx — elles
    // n'ont pas d'extension dans leur URL et seraient sinon redirigées vers
    // /fr/icon, qui n'existe pas), et tout fichier statique servi tel quel
    // depuis /public (ex: /images/logo.svg, reconnu à son extension). Les
    // routes API sont incluses ici (le mode maintenance doit aussi pouvoir
    // les bloquer) et gérées explicitement plus haut dans la fonction.
    "/((?!_next|favicon\\.ico|icon|apple-icon|.*\\.\\w+$).*)",
  ],
};
