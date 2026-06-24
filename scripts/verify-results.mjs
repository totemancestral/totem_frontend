import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { requireEnv } from "./env.mjs";

const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL", ["SUPABASE_URL"]);
const SUPABASE_SERVICE_KEY = requireEnv("SUPABASE_SERVICE_KEY", ["SUPABASE_SERVICE_ROLE_KEY"]);
const R2_ACCOUNT_ID = requireEnv("R2_ACCOUNT_ID");
const R2_ACCESS_KEY_ID = requireEnv("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = requireEnv("R2_SECRET_ACCESS_KEY");
const R2_BUCKET = requireEnv("R2_BUCKET_NAME", ["R2_BUCKET"]);

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
  console.log(
    `Commande: ${cmd?.statut} | ${cmd?.offre} | ${(cmd?.montant_cents ?? 0) / 100}${cmd?.devise}`,
  );

  // 2. Check oeuvre
  const { data: oeuvre } = await supabase
    .from("oeuvres")
    .select("*")
    .eq("commande_id", cmdId)
    .single();
  console.log(`Oeuvre: statut=${oeuvre?.statut} totem=${oeuvre?.nom_totem}`);
  console.log(`  image_url: ${oeuvre?.image_url ? "✅" : "❌"}`);
  console.log(`  audio_url: ${oeuvre?.audio_url ? "✅" : "❌"}`);
  console.log(`  pdf_url: ${oeuvre?.pdf_url ? "✅" : "❌"}`);
  console.log(`  recit: ${oeuvre?.recit?.slice(0, 80)}...`);

  // 3. Check R2 objects
  console.log("\n=== CLOUDFLARE R2 ===");
  const objects = await r2.send(
    new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: `totems/${cmdId}/`,
    }),
  );

  console.log(`Files in R2: ${objects.KeyCount ?? 0}`);
  for (const obj of objects.Contents ?? []) {
    console.log(`  ✅ ${obj.Key} (${(obj.Size / 1024).toFixed(1)} KB)`);
  }
}

main().catch(console.error);
