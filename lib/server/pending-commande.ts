import type { createServiceClient } from "@/lib/supabase/server";
import type { toCommandeOffre } from "@/lib/offers";
import { JUNIOR_COMMANDE_OFFRE } from "@/lib/offers";

export async function reservePendingCommande(
  supabase: ReturnType<typeof createServiceClient>,
  input: {
    userId: string;
    reponsesId: string | null;
    offre: ReturnType<typeof toCommandeOffre> | typeof JUNIOR_COMMANDE_OFFRE;
    amountCents: number;
    locale: "fr" | "en";
  },
): Promise<{ commande: { id: string } } | { error: string }> {
  const fields = {
    reponses_id: input.reponsesId,
    offre: input.offre,
    montant_cents: input.amountCents,
    devise: "EUR",
    langue: input.locale,
  };

  let pendingQuery = supabase
    .from("commandes")
    .select("id")
    .eq("user_id", input.userId)
    .eq("statut", "en_attente_paiement")
    .eq("offre", input.offre);
  pendingQuery = input.reponsesId === null ? pendingQuery.is("reponses_id", null) : pendingQuery.eq("reponses_id", input.reponsesId);
  const { data: existing, error: pendingError } = await pendingQuery.order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pendingError) return { error: pendingError.message };

  if (existing?.id) {
    const { error } = await supabase.from("commandes").update(fields).eq("id", existing.id);
    if (error) return { error: error.message };
    return { commande: { id: existing.id } };
  }

  const { data: created, error } = await supabase
    .from("commandes")
    .insert({ user_id: input.userId, statut: "en_attente_paiement", ...fields })
    .select("id")
    .single();

  if (error || !created) return { error: error?.message ?? "commande_creation_failed" };
  return { commande: { id: created.id } };
}

