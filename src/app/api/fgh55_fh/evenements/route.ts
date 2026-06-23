import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/server-auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const supabase = createServiceClient();

  const { data: erreurs, error: errError } = await supabase
    .from("erreurs_pipeline")
    .select("id, commande_id, etape, message, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (errError) {
    return NextResponse.json({ error: errError.message }, { status: 500 });
  }

  const { data: changements, error: chgError } = await supabase
    .from("commandes")
    .select("id, offre, statut, updated_at, user_id")
    .neq("statut", "en_attente_paiement")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (chgError) {
    return NextResponse.json({ error: chgError.message }, { status: 500 });
  }

  return NextResponse.json({
    erreurs: (erreurs ?? []).map((erreur) => ({ ...erreur, type: erreur.etape })),
    changements: changements ?? [],
  });
}
