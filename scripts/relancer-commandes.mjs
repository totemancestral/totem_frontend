// Ce script nécessite les variables d'environnement suivantes :
//   SUPABASE_SERVICE_ROLE_KEY  (service role key Supabase)
//   SUPABASE_URL               (ex: https://mjiealkqjcqvlfrxdcif.supabase.co)
//   TOTEM_BACKEND_URL          (URL du backend NestJS, optionnel)
//   SUPABASE_AUTH_TOKEN        (JWT admin, prioritaire si fourni)
//
// Usage : SUPABASE_SERVICE_ROLE_KEY=xxx SUPABASE_URL=xxx node scripts/relancer-commandes.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BACKEND_URL = process.env.TOTEM_BACKEND_URL;
const AUTH_TOKEN = process.env.SUPABASE_AUTH_TOKEN;
const BASE_URL = process.env.BASE_URL || "https://totem-ancestral.com";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Usage: SUPABASE_SERVICE_ROLE_KEY=xxx SUPABASE_URL=xxx node scripts/relancer-commandes.mjs");
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

  console.log("\nReset + notification backend...\n");

  for (const cmd of commandes) {
    process.stdout.write(`  ${cmd.id.slice(0, 8)}... `);

    const { error: e1 } = await supabase
      .from("commandes")
      .update({ statut: "en_generation" })
      .eq("id", cmd.id);
    if (e1) { console.log(`reset KO: ${e1.message}`); continue; }

    const { error: e2 } = await supabase
      .from("oeuvres")
      .update({ statut: "en_generation" })
      .eq("commande_id", cmd.id);
    if (e2) { console.log(`reset oeuvre KO: ${e2.message}`); continue; }

    const { error: e3 } = await supabase
      .from("erreurs_pipeline")
      .delete()
      .eq("commande_id", cmd.id);
    if (e3) { console.log(`efface erreurs KO: ${e3.message}`); }

    // Notifier le backend NestJS si disponible
    if (BACKEND_URL) {
      try {
        const headers = { "Content-Type": "application/json" };
        if (AUTH_TOKEN) {
          headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
        }
        const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/orders/retry`, {
          method: "POST",
          headers,
          body: JSON.stringify({ externalCommandId: cmd.id }),
        });
        if (response.ok) {
          console.log("OK (backend notifie)");
        } else {
          const payload = await response.json().catch(() => ({}));
          console.log(`BACKEND ${response.status}: ${payload.message || payload.error || "erreur"}`);
        }
      } catch (err) {
        console.log(`BACKEND unreachable: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      console.log("OK (reset local, pas de backend)");
    }
  }

  console.log("\nTerminé. Le worker NestJS reprendra les commandes en 'en_generation' au prochain cycle.");
  if (BACKEND_URL) {
    console.log(`Backend: ${BACKEND_URL}`);
  }
}

main().catch(console.error);
