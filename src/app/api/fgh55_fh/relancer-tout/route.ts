import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/server-auth";
import { generateCoffret } from "@/lib/services/pipeline";

export const maxDuration = 300;

async function ensureOeuvre(supabase: ReturnType<typeof createServiceClient>, commandeId: string) {
  const { data: existing } = await supabase
    .from("oeuvres")
    .select("id")
    .eq("commande_id", commandeId)
    .maybeSingle();

  if (existing) return;

  const { data: cmd } = await supabase
    .from("commandes")
    .select("user_id")
    .eq("id", commandeId)
    .single();

  if (cmd) {
    await supabase.from("oeuvres").insert({
      user_id: cmd.user_id,
      commande_id: commandeId,
      statut: "en_cours",
    });
  }
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-pipeline-secret");
  if (secret !== process.env.PIPELINE_INTERNAL_SECRET) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { commandeId } = await request.json().catch(() => ({}));

  const query = supabase.from("commandes").select("id, statut, offre");

  if (commandeId) {
    query.eq("id", commandeId);
  } else {
    query.in("statut", ["paye", "en_generation", "erreur"]);
  }

  const { data: commandes, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { id: string; status: string; error?: string }[] = [];

  for (const cmd of commandes || []) {
    try {
      await supabase.from("commandes").update({ statut: "en_generation" }).eq("id", cmd.id);
      await ensureOeuvre(supabase, cmd.id);

      await generateCoffret(cmd.id);
      results.push({ id: cmd.id, status: "ok" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      results.push({ id: cmd.id, status: "erreur", error: msg });
    }
  }

  return NextResponse.json({ results });
}
