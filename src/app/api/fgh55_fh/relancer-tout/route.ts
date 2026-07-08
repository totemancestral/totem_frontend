import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/server-auth";
import { generateCoffret } from "@/lib/services/pipeline";

export const maxDuration = 300;

export async function POST(request: Request) {
  const secret = request.headers.get("x-pipeline-secret");
  if (secret !== process.env.PIPELINE_INTERNAL_SECRET) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: commandes, error } = await supabase
    .from("commandes")
    .select("id, statut, offre")
    .in("statut", ["paye", "en_generation", "erreur"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { id: string; status: string; error?: string }[] = [];

  for (const cmd of commandes || []) {
    try {
      await supabase.from("commandes").update({ statut: "en_generation" }).eq("id", cmd.id);
      await supabase.from("oeuvres").update({ statut: "en_cours" }).eq("commande_id", cmd.id);

      await generateCoffret(cmd.id);
      results.push({ id: cmd.id, status: "ok" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      results.push({ id: cmd.id, status: "erreur", error: msg });
    }
  }

  return NextResponse.json({ results });
}
