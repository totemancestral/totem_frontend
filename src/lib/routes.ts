/**
 * Central route mappings for obfuscated paths.
 * Toute modification ici doit être répercutée dans les noms de dossiers.
 */

export const PAGE_ROUTES = {
  a_propos: "athenaeum_arc",
  auth: "janua_vitae",
  cgv: "lex_mercatoria",
  confidentialite: "arcanum_privata",
  contact: "scriba_mundi",
  espace_personnel: "domus_animi",
  faq: "quaestio_sacra",
  mentions: "notitia_legalis",
  offres: "tabula_munera",
  parcours: "via_sapientiae",
  reset_password: "renovare_clavis",
} as const;

export const API_ROUTES = {
  checkout: "solvens_porta",
  commandes: "ordo_tabulae",
  contact: "epistula_missa",
  generate_coffret: "arca_generatrix",
  oeuvres: "opera_artificis",
  parcours: "iter_animarum",
  profiles: "personae_nota",
  webhook_stripe: "strix_nuntius",
} as const;

export type PageRoute = keyof typeof PAGE_ROUTES;
export type ApiRoute = keyof typeof API_ROUTES;

export function pagePath(locale: string, route: PageRoute, query = ""): string {
  const base = `/${locale}/${PAGE_ROUTES[route]}`;
  return query ? `${base}?${query}` : base;
}

export function apiPath(route: ApiRoute, subpath = ""): string {
  return `/api/${API_ROUTES[route]}${subpath}`;
}

export function adminPath(): string {
  return "/fgh55_fh";
}

export function adminApiPath(endpoint: "stats" | "commandes"): string {
  return `/api/fgh55_fh/${endpoint}`;
}
