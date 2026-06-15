import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const supabase = createClient(
  "https://mjiealkqjcqvlfrxdcif.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaWVhbGtxamNxdmxmcnhkY2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM1MjA2MiwiZXhwIjoyMDk2OTI4MDYyfQ.uuLoOmJJNrAysyXEsjdo_Vyw5jMe46VrAUttIYdw8N0",
  { auth: { persistSession: false, autoRefreshToken: false }, realtime: { transport: WebSocket } },
);

const cmdId = "2e7a681b-d721-4149-8314-80ab795fbdd6";

await Promise.all([
  supabase.from("commandes").update({ statut: "paye" }).eq("id", cmdId),
  supabase.from("oeuvres").update({ statut: "paye" }).eq("commande_id", cmdId),
]);

console.log("✅ Status reset to paye");
