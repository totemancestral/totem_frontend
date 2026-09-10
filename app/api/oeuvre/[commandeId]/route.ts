import { NextResponse } from "next/server";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { internalError } from "@/lib/api-error";

/**
 * L'œuvre finale (texte, image, audio, PDF) est mirrorée par totem_backend
 * dans la table `oeuvres` de ce projet Supabase, une fois le pipeline de
 * génération terminé. Cette route la sert au frontend par id de commande.
 */
export async function GET(request: Request, { params }: { params: Promise<{ commandeId: string }> }) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { commandeId } = await params;
  const supabase = createServiceClient();

  const { data: commande, error } = await supabase
    .from("commandes")
    .select("id, offre, statut, oeuvres(nom_totem, recit, image_url, audio_url, pdf_url, numero_serie, statut, created_at)")
    .eq("id", commandeId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (error) {
    return internalError("oeuvre.GET", error);
  }
  if (!commande) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  const oeuvre = Array.isArray(commande.oeuvres) ? commande.oeuvres[0] : commande.oeuvres;

  return NextResponse.json({
    commandeId: commande.id,
    offre: commande.offre,
    statutCommande: commande.statut,
    oeuvre: oeuvre ?? null,
  });
}
