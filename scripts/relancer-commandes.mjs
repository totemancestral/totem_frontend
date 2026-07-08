import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mjiealkqjcqvlfrxdcif.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaWVhbGtxamNxdmxmcnhkY2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM1MjA2MiwiZXhwIjoyMDk2OTI4MDYyfQ.uuLoOmJJNrAysyXEsjdo_Vyw5jMe46VrAUttIYdw8N0";
const SECRET = "splqy8rIYxIuCsdiJ3QEb3fqIcmJtCoZ6FMdKH7FUDPaFsorw3KogyWaZGQQNtqc";
const BASE_URL = "https://totem-ancestral.com";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("Recherche des commandes bloquees...\n");

  const { data: commandes, error } = await supabase
    .from("commandes")
    .select("id, statut, offre, created_at, user_id")
    .in("statut", ["paye", "en_generation", "erreur"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur requete:", error.message);
    process.exit(1);
  }

  if (!commandes || commandes.length === 0) {
    console.log("Aucune commande bloquee trouvee.");
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
          "x-commande-id": cmd.id,
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

  console.log("\nTermine. Verifiez le statut des commandes dans l'admin FGH55FH.");
}

main().catch(console.error);
