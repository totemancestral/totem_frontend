import { NextResponse } from "next/server";

/**
 * Journalise le détail réel côté serveur et renvoie un message générique au
 * client : un message Postgres/Supabase brut peut révéler des noms de
 * colonnes ou de contraintes internes à quiconque sait provoquer l'erreur.
 */
export function internalError(context: string, error: unknown, status = 500) {
  console.error(`[${context}]`, error);
  return NextResponse.json({ error: "Une erreur interne est survenue." }, { status });
}
