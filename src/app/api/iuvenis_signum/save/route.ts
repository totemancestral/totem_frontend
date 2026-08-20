import { NextResponse } from "next/server";

/**
 * Ancienne route de sauvegarde Junior : la commande payee et son image sont
 * maintenant persistées par le backend. Elle ne doit plus accepter de payload
 * client ni créer une œuvre locale.
 */
export async function POST() {
  return NextResponse.json({ error: "Sauvegarde Junior indisponible" }, { status: 410 });
}
