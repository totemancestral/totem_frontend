import { redirect } from "next/navigation";
import { authPath } from "@/lib/routes";

/**
 * Point d'entrée `janua_vitae` : redirige vers connexion (par défaut) ou
 * inscription (`?mode=signup`). Compatibilité avec les anciens liens qui
 * passaient `mode`, `redirect` et `role` en query params.
 */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "fr";
  const query = await searchParams;

  const modeRaw = Array.isArray(query.mode) ? query.mode[0] : query.mode;
  const kind: "signup" | "signin" = modeRaw === "signup" ? "signup" : "signin";

  const redirectRaw = Array.isArray(query.redirect) ? query.redirect[0] : query.redirect;
  let target = authPath(locale, kind, redirectRaw);

  const roleRaw = Array.isArray(query.role) ? query.role[0] : query.role;
  if (roleRaw) {
    target += target.includes("?") ? "&" : "?";
    target += `role=${encodeURIComponent(roleRaw)}`;
  }

  redirect(target);
}
