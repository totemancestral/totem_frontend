import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";
import { JUNIOR_AMOUNT_CENTS } from "@/lib/offers";
import { createServiceClient } from "@/lib/server-auth";

/** Bucket public partage avec le pipeline de livraison. */
const STORAGE_BUCKET = "totem-files";

export async function POST(request: Request) {
  const env = getServerEnv();
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corps requis" }, { status: 400 });
  }

  // Le paiement est obligatoire : sans session Stripe verifiee, l'appel
  // permettait d'enregistrer un totem a 0 EUR par simple requete HTTP.
  const checkoutSessionId =
    typeof body.checkoutSessionId === "string" ? body.checkoutSessionId : null;
  if (!checkoutSessionId) {
    return NextResponse.json({ error: "Paiement requis" }, { status: 402 });
  }
  if (!env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Paiement impossible à vérifier" }, { status: 503 });
  }
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" });
    const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    if (checkoutSession.payment_status !== "paid" || checkoutSession.metadata?.userId !== user.id) {
      return NextResponse.json({ error: "Paiement non confirmé" }, { status: 402 });
    }
  } catch {
    return NextResponse.json({ error: "Session de paiement invalide" }, { status: 402 });
  }

  if (env.TOTEM_BACKEND_URL) {
    const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
    const response = await fetch(`${backendUrl}/junior/reveal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader ?? "",
      },
      body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => null);
    return NextResponse.json(payload, { status: response.ok ? 200 : response.status || 502 });
  }

  const { data: commande, error: commandeError } = await supabase
    .from("commandes")
    .insert({
      user_id: user.id,
      offre: "junior",
      statut: "livree",
      montant_cents: JUNIOR_AMOUNT_CENTS,
      devise: "eur",
      langue: body.locale === "en" ? "en" : "fr",
      stripe_session_id: checkoutSessionId,
    })
    .select("id")
    .single();

  if (commandeError || !commande) {
    return NextResponse.json({ error: "Erreur sauvegarde commande" }, { status: 500 });
  }

  // Carte de partage composee par le navigateur : stockee avec l'oeuvre pour
  // que le totem apparaisse illustre dans le tableau de bord.
  const imageUrl = await storeShareCard(supabase, commande.id, body.imageDataUrl);

  const { error } = await supabase.from("oeuvres").insert({
    user_id: user.id,
    commande_id: commande.id,
    nom_totem: body.nomComplet || "Totem Junior",
    statut: "livree",
    image_url: imageUrl,
    recit: body.phrase || null,
    metadata: {
      type: "junior",
      seed: body.seed || "",
      orderNumber: body.orderNumber || 0,
      scores: body.scores || {},
      dominant: body.dominant || "",
      secondary: body.secondary || "",
      totem: body.totem || {},
      nomComplet: body.nomComplet || "",
      phrase: body.phrase || "",
      attribut: body.attribut || "",
      messageClan: body.messageClan || "",
      share: body.share || {},
    },
  });

  if (error) {
    return NextResponse.json({ error: "Erreur sauvegarde" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * Depose la carte de partage dans le bucket public et renvoie son URL.
 *
 * L'echec n'est jamais bloquant : le totem est deja paye et compose, il serait
 * absurde de refuser la livraison parce que l'illustration n'a pas pu etre
 * televersee. L'oeuvre est alors simplement enregistree sans image.
 */
async function storeShareCard(
  supabase: ReturnType<typeof createServiceClient>,
  commandeId: string,
  dataUrl: unknown,
): Promise<string | null> {
  if (typeof dataUrl !== "string") return null;

  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl.trim());
  if (!match) return null;

  const bytes = Buffer.from(match[1], "base64");
  // Garde-fou : une carte legitime pese quelques centaines de kilo-octets.
  if (bytes.byteLength === 0 || bytes.byteLength > 4_000_000) return null;

  const key = `totems/junior/${commandeId}/totem.png`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(key, bytes, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) return null;

  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(key).data.publicUrl ?? null;
}
