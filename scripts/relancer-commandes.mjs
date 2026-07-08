// Ce script nécessite les variables d'environnement suivantes :
//   SUPABASE_SERVICE_ROLE_KEY  (service role key Supabase)
//   PIPELINE_INTERNAL_SECRET   (secret interne pour l'API)
//   SUPABASE_URL               (ex: https://mjiealkqjcqvlfrxdcif.supabase.co)
//
// Usage : SUPABASE_SERVICE_ROLE_KEY=xxx PIPELINE_INTERNAL_SECRET=xxx SUPABASE_URL=xxx node scripts/relancer-commandes.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SECRET = process.env.PIPELINE_INTERNAL_SECRET;
const BASE_URL = process.env.BASE_URL || "https://totem-ancestral.com";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !SECRET) {
  console.error("Usage: SUPABASE_SERVICE_ROLE_KEY=xxx PIPELINE_INTERNAL_SECRET=xxx SUPABASE_URL=xxx node scripts/relancer-commandes.mjs");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("Recherche des commandes bloquées...\n");

  const { data: commandes, error } = await supabase
    .from("commandes")
    .select("id, statut, offre, created_at, user_id")
    .in("statut", ["paye", "en_generation", "erreur"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur requête:", error.message);
    process.exit(1);
  }

  if (!commandes || commandes.length === 0) {
    console.log("Aucune commande bloquée trouvée.");
    return;
  }

  console.log(`Total: ${commandes.length}\n`);
  for (const cmd of commandes) {
    console.log(`  [${cmd.statut}] ${cmd.id} | ${cmd.offre} | ${cmd.created_at}`);
  }

  console.log("\nReset + relance individuelle (120s timeout par commande)...\n");

  for (const cmd of commandes) {
    process.stdout.write(`  ${cmd.id.slice(0, 8)}... `);

    const { error: e1 } = await supabase
      .from("commandes")
      .update({ statut: "en_generation" })
      .eq("id", cmd.id);
    if (e1) { console.log(`reset KO: ${e1.message}`); continue; }

    const { error: e2 } = await supabase
      .from("oeuvres")
      .update({ statut: "en_cours" })
      .eq("commande_id", cmd.id);
    if (e2) { console.log(`reset oeuvre KO: ${e2.message}`); continue; }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 130000);

      const response = await fetch(`${BASE_URL}/api/fgh55_fh/relancer-tout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pipeline-secret": SECRET,
        },
        body: JSON.stringify({ commandeId: cmd.id }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        const r = result.results?.[0];
        console.log(r?.status === "ok" ? "OK" : `ERREUR: ${r?.error || "inconnue"}`);
      } else {
        console.log(`HTTP ${response.status}: ${result.error || "erreur"}`);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("TIMEOUT (130s)");
      } else {
        console.log(`Exception: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  console.log("\nTerminé. Vérifiez le statut des commandes dans l'admin FGH55FH.");
}

main().catch(console.error);
