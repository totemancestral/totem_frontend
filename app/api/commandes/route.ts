import { NextResponse } from "next/server";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { internalError } from "@/lib/api-error";

/** Commandes du visiteur connecté, avec l'œuvre livrée si elle existe déjà. */
export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("commandes")
    .select(
      "id, offre, statut, montant_cents, devise, langue, created_at, oeuvres(nom_totem, image_url, numero_serie, statut)",
    )
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return internalError("commandes.GET", error);
  }

  return NextResponse.json(data);
}
