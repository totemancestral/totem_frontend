import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { internalError } from "@/lib/api-error";

const patchSchema = z.object({
  prenom: z.string().trim().min(1).max(80).optional(),
  nom: z.string().trim().max(80).optional(),
});

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("prenom, nom, sexe, langue, email")
    .eq("id", auth.userId)
    .maybeSingle();

  if (error) {
    return internalError("profil.GET", error);
  }

  return NextResponse.json(
    data ?? { prenom: null, nom: null, sexe: null, langue: "fr", email: auth.email },
  );
}

export async function PATCH(request: Request) {
  const rateLimitResponse = await rateLimit(request, 20, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 422 });
  }

  // L'email vient toujours du jeton vérifié, jamais du corps de la requête :
  // ça resynchronise profiles.email après un changement d'adresse confirmé
  // côté Auth (aucun trigger DB ne le fait), et un appel sans prenom/nom
  // reste un no-op utile plutôt qu'une erreur.
  const update: { prenom?: string; nom?: string; email: string } = { email: auth.email };
  if (parsed.data.prenom !== undefined) update.prenom = parsed.data.prenom;
  if (parsed.data.nom !== undefined) update.nom = parsed.data.nom;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", auth.userId)
    .select("prenom, nom, sexe, langue, email")
    .single();

  if (error) {
    return internalError("profil.PATCH", error);
  }

  return NextResponse.json(data);
}

/**
 * Suppression définitive du compte. Toutes les tables (profil, réponses de
 * parcours, commandes, œuvres, versions) référencent auth.users avec
 * ON DELETE CASCADE : supprimer l'utilisateur Auth suffit à tout effacer
 * proprement, sans laisser de données orphelines.
 */
export async function DELETE(request: Request) {
  // Action destructrice et irréversible : limite volontairement basse.
  const rateLimitResponse = await rateLimit(request, 3, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createServiceClient();
  const { error } = await supabase.auth.admin.deleteUser(auth.userId);

  if (error) {
    return internalError("profil.DELETE", error);
  }

  return NextResponse.json({ success: true });
}
