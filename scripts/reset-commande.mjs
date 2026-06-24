import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { requireEnv } from "./env.mjs";

const supabase = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL", ["SUPABASE_URL"]),
  requireEnv("SUPABASE_SERVICE_KEY", ["SUPABASE_SERVICE_ROLE_KEY"]),
  { auth: { persistSession: false, autoRefreshToken: false }, realtime: { transport: WebSocket } },
);

const cmdId = "2e7a681b-d721-4149-8314-80ab795fbdd6";

await Promise.all([
  supabase.from("commandes").update({ statut: "paye" }).eq("id", cmdId),
  supabase.from("oeuvres").update({ statut: "paye" }).eq("commande_id", cmdId),
]);

console.log("✅ Status reset to paye");
