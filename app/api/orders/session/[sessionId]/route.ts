import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { internalError } from "@/lib/api-error";

/**
 * Relaie le statut d'une commande depuis totem_backend : le pipeline de
 * génération (texte/image/audio/PDF) tourne entièrement côté NestJS, ce
 * frontend ne fait qu'afficher où en est la commande.
 */
export async function GET(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { sessionId } = await params;
  const env = getServerEnv();
  if (!env.TOTEM_BACKEND_URL) {
    return NextResponse.json({ error: "Moteur de génération indisponible" }, { status: 503 });
  }

  const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");

  try {
    const response = await fetch(`${backendUrl}/orders/session/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: request.headers.get("authorization") ?? "" },
    });
    const payload = await response.json().catch(() => null);

    if (response.status === 402) {
      return NextResponse.json({ error: "Paiement non confirmé" }, { status: 402 });
    }
    if (!response.ok || !payload) {
      return NextResponse.json(
        { error: payload?.error ?? payload?.message ?? "Commande introuvable" },
        { status: response.status >= 400 ? response.status : 502 },
      );
    }

    // La commande côté frontend (celle à laquelle l'œuvre est rattachée)
    // n'est identifiée que par la session Stripe : on la retrouve ici pour
    // permettre au front de lier directement vers /oeuvre.
    let commandeId: string | null = null;
    try {
      const supabase = createServiceClient();
      const { data } = await supabase
        .from("commandes")
        .select("id")
        .eq("stripe_session_id", sessionId)
        .eq("user_id", auth.userId)
        .maybeSingle();
      commandeId = data?.id ?? null;
    } catch {
      // Non-bloquant : la page de confirmation reste utilisable sans lien direct.
    }

    return NextResponse.json({ ...payload, commandeId });
  } catch (error) {
    return internalError("orders.session.GET", error, 502);
  }
}
