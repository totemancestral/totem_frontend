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

  console.log("\nRelance via API...\n");

  const response = await fetch(`${BASE_URL}/api/fgh55_fh/relancer-tout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-pipeline-secret": SECRET,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Erreur API:", result.error || response.statusText);
    process.exit(1);
  }

  const total = result.results?.length || 0;
  const ok = result.results?.filter((r) => r.status === "ok").length || 0;
  const errs = result.results?.filter((r) => r.status !== "ok").length || 0;

  console.log(`Termine: ${ok} OK, ${errs} erreurs sur ${total}`);

  for (const r of result.results || []) {
    if (r.status !== "ok") {
      console.log(`  ${r.id}: ${r.error}`);
    }
  }
}

main().catch(console.error);
