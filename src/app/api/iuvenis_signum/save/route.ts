import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/server-auth";

export async function POST(request: Request) {
  const env = getServerEnv();
  if (env.TOTEM_BACKEND_URL) {
    const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
    const response = await fetch(`${backendUrl}/junior/reveal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") ?? "",
      },
      body: await request.text(),
    });

    const payload = await response.json().catch(() => null);
    return NextResponse.json(payload, { status: response.ok ? 200 : response.status || 502 });
  }

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

  const { error } = await supabase.from("oeuvres").insert({
    user_id: user.id,
    commande_id: `junior_${user.id}_${Date.now()}`,
    nom_totem: body.nomComplet || "Totem Junior",
    statut: "livree",
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
