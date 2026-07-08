import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/server-auth";
import { startPipeline } from "@/lib/services/pipeline";

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
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const supabase = createServiceClient();

  const { commandeId } = (await request.json()) as { commandeId: string };
  if (!commandeId) {
    return NextResponse.json({ error: "commandeId requis" }, { status: 400 });
  }

  const { data: commande } = await supabase
    .from("commandes")
    .select("statut, offre")
    .eq("id", commandeId)
    .single();

  if (!commande) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (!["erreur", "paye", "en_generation"].includes(commande.statut)) {
    return NextResponse.json(
      { error: `Statut ${commande.statut} non relançable` },
      { status: 400 },
    );
  }

  await supabase.from("commandes").update({ statut: "en_generation" }).eq("id", commandeId);
  await ensureOeuvre(supabase, commandeId);

  startPipeline(commandeId);
  return NextResponse.json({ success: true, message: "Pipeline lance sur Supabase" });
}
