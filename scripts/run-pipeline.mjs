import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

// ====== Configuration ======
const SUPABASE_URL = "https://mjiealkqjcqvlfrxdcif.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaWVhbGtxamNxdmxmcnhkY2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM1MjA2MiwiZXhwIjoyMDk2OTI4MDYyfQ.uuLoOmJJNrAysyXEsjdo_Vyw5jMe46VrAUttIYdw8N0";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaWVhbGtxamNxdmxmcnhkY2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTIwNjIsImV4cCI6MjA5NjkyODA2Mn0.vSeeQcfaTNc1IMsIAZmlZMpbeM4o-OD6S1tRuxT42WM";

const R2_ACCOUNT_ID = "52217c714e4feae8afbe8b6ac629281a";
const R2_ACCESS_KEY_ID = "722d1760e18a0d64a070a4f3711b456c";
const R2_SECRET_ACCESS_KEY = "89542afa2ea9f1bc23237ec9843cfacdcab34fa87d602e0b762faf15f31c30b4";
const R2_BUCKET = "totem-ancestral";

const SUPABASE_REF = "mjiealkqjcqvlfrxdcif";
const EDGE_FUNCTION_URL = `https://${SUPABASE_REF}.supabase.co/functions/v1`;

const ARCHETYPE_LABELS = {
  A: { fr: "Guerrier", en: "Warrior" },
  B: { fr: "Sage", en: "Sage" },
  C: { fr: "Gardien", en: "Guardian" },
  D: { fr: "Visionnaire", en: "Visionary" },
};

// ====== Clients ======
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: WebSocket },
});

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ====== Edge Function calls ======
async function callEdge(slug, payload) {
  try {
    const res = await fetch(`${EDGE_FUNCTION_URL}/${slug}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Edge ${slug} error: ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.log(`  ⚠️ Edge function ${slug} unavailable: ${e.message}`);
    return null;
  }
}

// ====== Generation functions (simplified) ======
async function generateTexte(prenom, reponses, archetypeId, langue) {
  console.log("  📝 Step 1: Generating text...");

  // Try Edge Function first
  const result = await callEdge("generate-texte", { prenom, reponses, archetypeId, langue });
  if (result?.texte) {
    console.log(`  ✅ Text generated via Edge Function (${result.texte.length} chars)`);
    return result.texte;
  }

  // Fallback: local generation
  console.log("  ⚠️ Edge function unavailable, using local fallback...");
  const l = langue === "en" ? "en" : "fr";
  const archetype = ARCHETYPE_LABELS[archetypeId]?.[l] ?? "Griot";

  const lines = [];
  for (const [, val] of Object.entries(reponses)) {
    if (!val || typeof val !== "object") continue;
    const answer = val;
    if (answer.field?.trim()) lines.push(answer.field.trim());
  }

  const texte = lines.length > 0
    ? lines.join("\n\n")
    : `Totem Ancestral de ${prenom} — ${archetype}`;

  console.log(`  ✅ Text generated locally (${texte.length} chars)`);
  return texte;
}

async function generateImage(prenom, texte, archetypeId, langue) {
  console.log("  🖼️ Step 2: Generating image...");
  const result = await callEdge("generate-image", { prenom, texte, archetypeId, langue });
  if (result?.imageUrl) {
    console.log(`  ✅ Image generated: ${result.imageUrl}`);
    return result.imageUrl;
  }
  console.log("  ⚠️ Image generation unavailable, will use placeholder");
  return "";
}

async function generateAudio(prenom, texte, archetypeId, langue) {
  console.log("  🔊 Step 3: Generating audio...");
  const result = await callEdge("generate-audio", { prenom, texte, archetypeId, langue });
  if (result?.audioUrl) {
    console.log(`  ✅ Audio generated: ${result.audioUrl}`);
    return result.audioUrl;
  }
  console.log("  ⚠️ Audio generation unavailable");
  return "";
}

// ====== R2 Upload ======
async function uploadToR2(commandeId, type, buffer, mimeType) {
  const ext = type === "image" ? "png" : type === "audio" ? "mp3" : "pdf";
  const fileName = `${type}_${commandeId}.${ext}`;
  const key = `totems/${commandeId}/${type}/${fileName}`;

  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));

  const publicUrl = `https://${R2_BUCKET}.r2.cloudflarestorage.com/${key}`;

  const signedUrl = await getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }), {
    expiresIn: 7 * 24 * 60 * 60, // R2 max = 7 jours
  });

  console.log(`  ✅ Uploaded ${type}: ${key} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return { url: publicUrl, signedUrl, key };
}

// ====== PDF Generation (inline - no React-PDF) ======
function generateSimplePDF(text, title, isCertificat = false) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const wrapped = [];
  for (const line of lines) {
    let remaining = line;
    while (remaining.length > 80) {
      wrapped.push(remaining.slice(0, 80));
      remaining = remaining.slice(80);
    }
    if (remaining) wrapped.push(remaining);
  }
  const body = wrapped.length ? wrapped.join("\n") : "Texte du parchemin";

  const content = isCertificat ? `
CERTIFICAT D'AUTHENTICITÉ
${"=".repeat(50)}

Numéro de série : ${title}

La Maison TOTEM ANCESTRAL certifie que
l'œuvre désignée ci-dessous est une création
originale, unique et numérotée.

Collection Digitale — ${new Date().getFullYear()}
TOTEM ANCESTRAL
SENYCE PARTNERS
` : `
${"=".repeat(50)}
${title}
${"=".repeat(50)}

${body}

${"=".repeat(50)}
TOTEM ANCESTRAL — Édition Digitale
${"=".repeat(50)}
`;

  return Buffer.from(content, "utf-8");
}

// ====== MAIN PIPELINE ======
async function generateCoffret(commandeId) {
  console.log(`\n🚀 Starting pipeline for commande ${commandeId}\n`);

  // 1. Get commande
  const { data: cmd } = await supabase.from("commandes").select("*").eq("id", commandeId).single();
  if (!cmd) throw new Error("Commande not found");
  console.log(`📦 Commande: ${cmd.offre} | ${cmd.statut} | ${(cmd.montant_cents / 100).toFixed(2)}${cmd.devise}`);

  await supabase.from("commandes").update({ statut: "en_generation" }).eq("id", commandeId);
  await supabase.from("oeuvres").update({ statut: "en_generation" }).eq("commande_id", commandeId);

  const userId = cmd.user_id;
  const langue = cmd.langue || "fr";

  // 2. Get profile
  const { data: profile } = await supabase.from("profiles").select("prenom, email").eq("id", userId).single();
  const prenom = profile?.prenom ?? "Voyageur";
  const email = profile?.email ?? "";
  console.log(`👤 User: ${prenom} (${email})`);

  // 3. Get reponses
  let reponses = {};
  if (cmd.reponses_id) {
    const { data: rep } = await supabase.from("reponses_parcours").select("reponses").eq("id", cmd.reponses_id).single();
    reponses = rep?.reponses ?? {};
  } else {
    const { data: reps } = await supabase.from("reponses_parcours")
      .select("reponses").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single();
    reponses = reps?.reponses ?? {};
  }
  console.log(`📋 Reponses: ${Object.keys(reponses).length} questions`);

  // Determine archetype
  const firstAnswer = Object.values(reponses).find(a => a && typeof a === "object" && "choice" in a);
  const archetypeId = firstAnswer?.choice ?? "A";
  const archetypeName = ARCHETYPE_LABELS[archetypeId]?.[langue] ?? "Griot";
  const nomTotem = `${prenom} ${archetypeName}`;

  // 4. Generate text
  const texte = await generateTexte(prenom, reponses, archetypeId, langue);
  console.log(`📜 Texte: ${texte.slice(0, 100)}...`);

  // 5. Generate image & audio in parallel
  const [imageUrl, audioUrl] = await Promise.all([
    generateImage(prenom, texte, archetypeId, langue),
    generateAudio(prenom, texte, archetypeId, langue),
  ]);

  // 6. Generate PDFs
  console.log("  📄 Step 4: Generating PDFs...");
  const numeroSerie = String((Math.abs(hashCode(commandeId)) % 999999) + 1).padStart(6, "0");

  const parcheminBuffer = generateSimplePDF(texte, `Parchemin de ${prenom} — ${archetypeName}`);
  const certificatBuffer = generateSimplePDF("", `N° ${numeroSerie} — ${nomTotem}`, true);
  console.log(`  ✅ PDFs generated: parchemin (${(parcheminBuffer.length/1024).toFixed(1)} KB), certificat (${(certificatBuffer.length/1024).toFixed(1)} KB)`);

  // 7. Upload to R2
  console.log("  ☁️ Step 5: Uploading to R2...");
  const [parcheminResult, certificatResult] = await Promise.all([
    uploadToR2(commandeId, "parchemin", parcheminBuffer, "application/pdf"),
    uploadToR2(commandeId, "certificat", certificatBuffer, "application/pdf"),
  ]);

  let r2ImageUrl = "";
  let r2AudioUrl = "";

  function dataUrlToBuffer(dataUrl) {
    const [header, b64] = dataUrl.split(",");
    return { buffer: Buffer.from(b64, "base64"), mimeType: header.match(/:(.*?);/)?.[1] ?? "application/octet-stream" };
  }

  if (imageUrl) {
    try {
      if (imageUrl.startsWith("data:")) {
        const { buffer, mimeType } = dataUrlToBuffer(imageUrl);
        const imgResult = await uploadToR2(commandeId, "image", buffer, mimeType);
        r2ImageUrl = imgResult.url;
      } else {
        const imgRes = await fetch(imageUrl);
        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
        const imgResult = await uploadToR2(commandeId, "image", imgBuf, "image/png");
        r2ImageUrl = imgResult.url;
      }
    } catch (e) {
      console.log(`  ⚠️ Could not re-upload image: ${e.message}`);
    }
  }

  if (audioUrl) {
    try {
      if (audioUrl.startsWith("data:")) {
        const { buffer, mimeType } = dataUrlToBuffer(audioUrl);
        const audResult = await uploadToR2(commandeId, "audio", buffer, mimeType);
        r2AudioUrl = audResult.url;
      } else {
        const audRes = await fetch(audioUrl);
        const audBuf = Buffer.from(await audRes.arrayBuffer());
        const audResult = await uploadToR2(commandeId, "audio", audBuf, "audio/mpeg");
        r2AudioUrl = audResult.url;
      }
    } catch (e) {
      console.log(`  ⚠️ Could not re-upload audio: ${e.message}`);
    }
  }

  // 8. Update status
  console.log("  💾 Step 6: Updating database...");
  await Promise.all([
    supabase.from("commandes").update({ statut: "livree" }).eq("id", commandeId),
    supabase.from("oeuvres").update({
      statut: "livree",
      image_url: r2ImageUrl || imageUrl || null,
      audio_url: r2AudioUrl || audioUrl || null,
      pdf_url: parcheminResult.signedUrl,
      nom_totem: nomTotem,
      numero_serie: numeroSerie,
      recit: texte,
      metadata: {
        certificatUrl: certificatResult.signedUrl,
        archetypeId,
        langue,
        offre: cmd.offre,
      },
    }).eq("commande_id", commandeId),
  ]);

  console.log(`\n✅ Pipeline complete!`);
  console.log(`   📜 Texte: ${texte.length} chars`);
  console.log(`   🖼️ Image: ${r2ImageUrl || imageUrl || "N/A"}`);
  console.log(`   🔊 Audio: ${r2AudioUrl || audioUrl || "N/A"}`);
  console.log(`   📄 Parchemin PDF: ${parcheminResult.signedUrl}`);
  console.log(`   📄 Certificat PDF: ${certificatResult.signedUrl}`);
  console.log(`   🏷️ Numéro série: ${numeroSerie}`);
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Run
const commandeId = "2e7a681b-d721-4149-8314-80ab795fbdd6";
generateCoffret(commandeId).catch(console.error);
