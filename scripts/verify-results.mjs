import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const SUPABASE_URL = "https://mjiealkqjcqvlfrxdcif.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaWVhbGtxamNxdmxmcnhkY2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM1MjA2MiwiZXhwIjoyMDk2OTI4MDYyfQ.uuLoOmJJNrAysyXEsjdo_Vyw5jMe46VrAUttIYdw8N0";
const R2_ACCOUNT_ID = "52217c714e4feae8afbe8b6ac629281a";
const R2_ACCESS_KEY_ID = "722d1760e18a0d64a070a4f3711b456c";
const R2_SECRET_ACCESS_KEY = "89542afa2ea9f1bc23237ec9843cfacdcab34fa87d602e0b762faf15f31c30b4";
const R2_BUCKET = "totem-ancestral";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: WebSocket },
});

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const cmdId = "2e7a681b-d721-4149-8314-80ab795fbdd6";

async function main() {
  // 1. Check Supabase commande
  console.log("=== SUPABASE ===");
  const { data: cmd } = await supabase.from("commandes").select("*").eq("id", cmdId).single();
  console.log(`Commande: ${cmd?.statut} | ${cmd?.offre} | ${(cmd?.montant_cents ?? 0) / 100}${cmd?.devise}`);

  // 2. Check oeuvre
  const { data: oeuvre } = await supabase.from("oeuvres").select("*").eq("commande_id", cmdId).single();
  console.log(`Oeuvre: statut=${oeuvre?.statut} totem=${oeuvre?.nom_totem}`);
  console.log(`  image_url: ${oeuvre?.image_url ? "✅" : "❌"}`);
  console.log(`  audio_url: ${oeuvre?.audio_url ? "✅" : "❌"}`);
  console.log(`  pdf_url: ${oeuvre?.pdf_url ? "✅" : "❌"}`);
  console.log(`  recit: ${oeuvre?.recit?.slice(0, 80)}...`);

  // 3. Check R2 objects
  console.log("\n=== CLOUDFLARE R2 ===");
  const objects = await r2.send(new ListObjectsV2Command({
    Bucket: R2_BUCKET,
    Prefix: `totems/${cmdId}/`,
  }));

  console.log(`Files in R2: ${objects.KeyCount ?? 0}`);
  for (const obj of objects.Contents ?? []) {
    console.log(`  ✅ ${obj.Key} (${(obj.Size / 1024).toFixed(1)} KB)`);
  }
}

main().catch(console.error);
