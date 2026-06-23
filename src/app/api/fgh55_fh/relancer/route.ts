import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/server-auth";
import { generateCoffret } from "@/lib/services/pipeline";

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
    .select("statut")
    .eq("id", commandeId)
    .single();

  if (!commande) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (commande.statut !== "erreur") {
    return NextResponse.json(
      { error: "Seules les commandes en erreur peuvent etre relancees" },
      { status: 400 },
    );
  }

  await supabase.from("commandes").update({ statut: "en_generation" }).eq("id", commandeId);
  await supabase.from("oeuvres").update({ statut: "en_cours" }).eq("commande_id", commandeId);

  generateCoffret(commandeId).catch(() => {});

  return NextResponse.json({ success: true, message: "Pipeline relance" });
}
