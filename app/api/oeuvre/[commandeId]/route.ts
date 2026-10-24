import { NextResponse } from "next/server";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { internalError } from "@/lib/api-error";
import { readAssetLinks } from "@/lib/server/asset-links";

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
    .select("id, offre, statut, stripe_session_id, oeuvres(nom_totem, recit, image_url, audio_url, pdf_url, numero_serie, statut, created_at)")
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
  // Le certificat vient du backend, même si le miroir historique n'a pas cette colonne.
  let renewed = oeuvre ? { ...oeuvre, certificate_url: null as string | null } : null;
  if (oeuvre) {
    const assets = await readAssetLinks(request, commande.stripe_session_id ? [commande.stripe_session_id] : []);
    if (assets instanceof NextResponse) return assets;
    const links = commande.stripe_session_id ? assets.get(commande.stripe_session_id) : null;
    if (!links) return NextResponse.json({ error: "artwork_assets_unavailable" }, { status: 503 });
    renewed = { ...oeuvre, image_url: links.image_url, audio_url: links.audio_url,
      pdf_url: links.pdf_url, certificate_url: links.certificate_url };
  }

  return NextResponse.json({
    commandeId: commande.id,
    offre: commande.offre,
    statutCommande: commande.statut,
    oeuvre: renewed,
  }, { headers: { "Cache-Control": "private, no-store" } });
}
