import { NextResponse } from "next/server";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { internalError } from "@/lib/api-error";
import { readAssetLinks } from "@/lib/server/asset-links";

/** Commandes du visiteur connecté, avec l'œuvre livrée si elle existe déjà. */
export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("commandes")
    .select(
      "id, offre, statut, montant_cents, devise, langue, created_at, stripe_session_id, reponses_parcours(termine), oeuvres(nom_totem, image_url, numero_serie, statut)",
    )
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return internalError("commandes.GET", error);
  }

  const commands = data ?? [];
  const assets = await readAssetLinks(request, commands.filter((command) =>
    Array.isArray(command.oeuvres) ? command.oeuvres.length > 0 : Boolean(command.oeuvres)
  ).map((command) => command.stripe_session_id).filter((id): id is string => Boolean(id)));
  if (assets instanceof NextResponse) return assets;

  return NextResponse.json(commands.map(({ reponses_parcours, ...command }) => {
    const links = command.stripe_session_id ? assets.get(command.stripe_session_id) : null;
    const refresh = <T extends { image_url: string | null }>(oeuvre: T) => ({ ...oeuvre, image_url: links?.image_url ?? null });
    return {
      ...command,
      oeuvres: Array.isArray(command.oeuvres) ? command.oeuvres.map(refresh) : command.oeuvres ? refresh(command.oeuvres) : null,
      requiresQuestionnaire: command.offre !== "junior" && command.statut === "paye" && reponses_parcours?.termine === false,
    };
  }), { headers: { "Cache-Control": "private, no-store" } });
}
