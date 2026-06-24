import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { requireEnv } from "./env.mjs";

const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL", ["SUPABASE_URL"]);
const SUPABASE_SERVICE_KEY = requireEnv("SUPABASE_SERVICE_KEY", ["SUPABASE_SERVICE_ROLE_KEY"]);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: WebSocket },
});

async function main() {
  const commandeId = process.argv[2];
  if (!commandeId) {
    // List les commandes paye non livrees
    const { data } = await supabase
      .from("commandes")
      .select(
        "id, offre, statut, montant_cents, devise, stripe_session_id, user_id, created_at, reponses_id",
      )
      .in("statut", ["paye", "en_attente_paiement"]);
    console.log("Commandes disponibles pour pipeline:");
    for (const c of data ?? []) {
      console.log(
        `  ${c.id} | ${c.offre} | ${c.statut} | ${(c.montant_cents / 100).toFixed(2)}${c.devise} | reponses_id=${c.reponses_id ?? "null"}`,
      );
    }
    return;
  }

  const { data: cmd, error } = await supabase
    .from("commandes")
    .select("*, user_id")
    .eq("id", commandeId)
    .single();

  if (error || !cmd) {
    console.error("Commande introuvable:", error);
    return;
  }

  console.log("Commande:", JSON.stringify(cmd, null, 2));

  // Voir l'oeuvre associée
  const { data: oeuvres } = await supabase
    .from("oeuvres")
    .select("*")
    .eq("commande_id", commandeId);
  console.log("Oeuvres associées:", JSON.stringify(oeuvres, null, 2));

  // Voir les reponses
  if (cmd.reponses_id) {
    const { data: rep } = await supabase
      .from("reponses_parcours")
      .select("*")
      .eq("id", cmd.reponses_id);
    console.log("Reponses:", JSON.stringify(rep, null, 2));
  } else {
    // Chercher les reponses par user
    const { data: reps } = await supabase
      .from("reponses_parcours")
      .select("*")
      .eq("user_id", cmd.user_id)
      .order("created_at", { ascending: false })
      .limit(1);
    console.log("Reponses (user):", JSON.stringify(reps, null, 2));
  }
}

main();
