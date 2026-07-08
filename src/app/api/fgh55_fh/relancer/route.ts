import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/server-auth";
import { generateCoffret } from "@/lib/services/pipeline";

export const maxDuration = 300;

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
  await supabase.from("oeuvres").update({ statut: "en_cours" }).eq("commande_id", commandeId);

  try {
    await generateCoffret(commandeId);
    return NextResponse.json({ success: true, message: "Pipeline termine avec succes" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
