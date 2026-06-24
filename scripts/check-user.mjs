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
  const email = "eltonhounnou27@gmail.com";

  // 1. Find user in auth.users via profiles
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, prenom, email, langue")
    .eq("email", email);

  if (pErr) {
    console.error("❌ Profile query error:", pErr);
    return;
  }
  if (!profiles?.length) {
    console.log("❌ User not found in profiles");
    return;
  }

  const user = profiles[0];
  console.log(`✅ User found: ${user.prenom} (${user.email}) id=${user.id} langue=${user.langue}`);

  // 2. Check user_roles
  const { data: roles } = await supabase.from("user_roles").select("*").eq("user_id", user.id);
  console.log(`   Role: ${roles?.[0]?.role ?? "none"}`);

  // 3. Check existing commandes
  const { data: commandes } = await supabase
    .from("commandes")
    .select("id, offre, statut, montant_cents, devise, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  console.log(`   Commandes: ${commandes?.length ?? 0}`);
  for (const c of commandes ?? []) {
    console.log(
      `     - ${c.id.slice(0, 8)}… ${c.offre} ${c.statut} ${(c.montant_cents / 100).toFixed(2)}${c.devise}`,
    );
  }

  // 4. Check existing oeuvres
  const { data: oeuvres } = await supabase
    .from("oeuvres")
    .select("id, commande_id, statut, nom_totem, numero_serie")
    .eq("user_id", user.id);

  console.log(`   Oeuvres: ${oeuvres?.length ?? 0}`);
  for (const o of oeuvres ?? []) {
    console.log(
      `     - ${o.id.slice(0, 8)}… commande=${o.commande_id.slice(0, 8)}… statut=${o.statut} totem=${o.nom_totem ?? "-"}`,
    );
  }

  // 5. Check reponses_parcours
  const { data: reponses } = await supabase
    .from("reponses_parcours")
    .select("id, session_id, reponses, langue, termine")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  console.log(`   Reponses parcours: ${reponses?.length ?? 0}`);
  if (reponses?.[0]) {
    console.log(`     - session=${reponses[0].session_id} termine=${reponses[0].termine}`);
    console.log(`     - keys: ${Object.keys(reponses[0].reponses ?? {}).join(", ")}`);
  }
}

main();
