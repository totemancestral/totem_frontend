import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSupabaseRef, requireEnv } from "./env.mjs";

// ====== Configuration ======
const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL", ["SUPABASE_URL"]);
const SUPABASE_SERVICE_KEY = requireEnv("SUPABASE_SERVICE_KEY", ["SUPABASE_SERVICE_ROLE_KEY"]);
const SUPABASE_ANON_KEY = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", [
  "SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
]);
const R2_ACCOUNT_ID = requireEnv("R2_ACCOUNT_ID");
const R2_ACCESS_KEY_ID = requireEnv("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = requireEnv("R2_SECRET_ACCESS_KEY");
const R2_BUCKET = requireEnv("R2_BUCKET_NAME", ["R2_BUCKET"]);
const SUPABASE_REF = getSupabaseRef(SUPABASE_URL);
const EDGE_FUNCTION_URL = `https://${SUPABASE_REF}.supabase.co/functions/v1`;
const COMMANDE_ID = "2e7a681b-d721-4149-8314-80ab795fbdd6";

const ARCHETYPE_LABELS: Record<string, { fr: string; en: string }> = {
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
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callEdge<T>(slug: string, payload: unknown): Promise<T | null> {
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
    return (await res.json()) as T;
  } catch (e) {
    console.log(`  ⚠️ Edge ${slug}: ${(e as Error).message}`);
    return null;
  }
}

async function generateTexte(
  prenom: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reponses: any,
  archetypeId: string,
  langue: string,
): Promise<string> {
  console.log("  📝 Step 1: Generating text...");
  const result = await callEdge<{ texte?: string }>("generate-texte", {
    prenom,
    reponses,
    archetypeId,
    langue,
  });
  if (result?.texte) {
    console.log(`  ✅ Text generated (${result.texte.length} chars)`);
    return result.texte;
  }
  console.log("  ⚠️ Text generation unavailable");
  return "";
}

async function generateImage(
  prenom: string,
  texte: string,
  archetypeId: string,
  langue: string,
): Promise<string> {
  console.log("  🖼️ Step 2a: Generating image...");
  const result = await callEdge<{ imageUrl?: string }>("generate-image", {
    prenom,
    texte,
    archetypeId,
    langue,
  });
  if (result?.imageUrl) {
    console.log(`  ✅ Image generated`);
    return result.imageUrl;
  }
  return "";
}

async function generateAudio(
  prenom: string,
  texte: string,
  archetypeId: string,
  langue: string,
): Promise<string> {
  console.log("  🔊 Step 2b: Generating audio...");
  const result = await callEdge<{ audioUrl?: string }>("generate-audio", {
    prenom,
    texte,
    archetypeId,
    langue,
  });
  if (result?.audioUrl) {
    console.log(`  ✅ Audio generated`);
    return result.audioUrl;
  }
  return "";
}

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string } {
  const [header, b64] = dataUrl.split(",");
  return {
    buffer: Buffer.from(b64, "base64"),
    mimeType: header.match(/:(.*?);/)?.[1] ?? "application/octet-stream",
  };
}

async function uploadToR2(commandeId: string, type: string, buffer: Buffer, mimeType: string) {
  const ext = type === "image" ? "png" : type === "audio" ? "mp3" : "pdf";
  const fileName = `${type}_${commandeId}.${ext}`;
  const key = `totems/${commandeId}/${type}/${fileName}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  const publicUrl = `https://${R2_BUCKET}.r2.cloudflarestorage.com/${key}`;
  const signedUrl = await getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }), {
    expiresIn: 7 * 24 * 60 * 60,
  });

  console.log(`  ✅ Uploaded ${key} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return { url: publicUrl, signedUrl, key };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function generateSimplePDF(text: string, title: string, isCertificat = false): Buffer {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const wrapped: string[] = [];
  for (const line of lines) {
    let remaining = line;
    while (remaining.length > 80) {
      wrapped.push(remaining.slice(0, 80));
      remaining = remaining.slice(80);
    }
    if (remaining) wrapped.push(remaining);
  }
  const body = wrapped.length ? wrapped.join("\n") : "Texte du parchemin";

  const frame = `
  ╔══════════════════════════════════════════════════════════════════════════════╗
  ║                             TOTEM ANCESTRAL                                ║
  ║                             ⸻ ✦ ⸻                                        ║
  ╚══════════════════════════════════════════════════════════════════════════════╝
  `.trim();

  const content = isCertificat
    ? `

    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                   CERTIFICAT D'AUTHENTICITÉ                          ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

    Numéro de série : ${title}

    La Maison TOTEM ANCESTRAL certifie que
    l'œuvre désignée ci-dessous est une création
    originale, unique et numérotée.

    Collection Digitale — ${new Date().getFullYear()}
    TOTEM ANCESTRAL — SENYCE PARTNERS

  `
    : `

    ╔══════════════════════════════════════════════════════════════════════╗
    ║                        P A R C H E M I N                            ║
    ║                          ${title.padEnd(40).slice(0, 40)}           ║
    ╚══════════════════════════════════════════════════════════════════════╝

${body
  .split("\n")
  .map((l) => `  ${l}`)
  .join("\n")}

    ═══════════════════════════════════════════════════════════════════════
    TOTEM ANCESTRAL — Édition Digitale — SENYCE PARTNERS
    ═══════════════════════════════════════════════════════════════════════

  `;

  return Buffer.from(content, "utf-8");
}

async function main() {
  console.log(`\n🚀 Full pipeline for commande ${COMMANDE_ID}\n`);

  // 1. Get commande
  const { data: cmd } = await supabase.from("commandes").select("*").eq("id", COMMANDE_ID).single();
  if (!cmd) throw new Error("Commande not found");
  console.log(`📦 Commande: ${cmd.offre} | ${cmd.statut}`);

  await supabase.from("commandes").update({ statut: "en_generation" }).eq("id", COMMANDE_ID);
  await supabase.from("oeuvres").update({ statut: "en_generation" }).eq("commande_id", COMMANDE_ID);

  const userId = cmd.user_id;
  const langue = cmd.langue || "fr";

  // 2. Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, email")
    .eq("id", userId)
    .single();
  const prenom = profile?.prenom ?? "Voyageur";
  const email = profile?.email ?? "";
  console.log(`👤 ${prenom} (${email})`);

  // 3. Reponses
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reponses: any = {};
  if (cmd.reponses_id) {
    const { data: rep } = await supabase
      .from("reponses_parcours")
      .select("reponses")
      .eq("id", cmd.reponses_id)
      .single();
    reponses = rep?.reponses ?? {};
  }
  console.log(`📋 ${Object.keys(reponses).length} questions`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstAnswer = Object.values(reponses).find((a: any) => a?.choice);
  const archetypeId = (firstAnswer as { choice?: string })?.choice ?? "A";
  const archetypeName = ARCHETYPE_LABELS[archetypeId]?.[langue as "fr" | "en"] ?? "Griot";
  const nomTotem = `${prenom} ${archetypeName}`;

  // 4. Generate text
  const texte = await generateTexte(prenom, reponses, archetypeId, langue);
  if (!texte) throw new Error("Texte generation failed");

  // 5. Generate image + audio
  const [imageUrl, audioUrl] = await Promise.all([
    generateImage(prenom, texte, archetypeId, langue),
    generateAudio(prenom, texte, archetypeId, langue),
  ]);

  // 6. Download image buffer + create data URL for PDF
  let imageBuffer: Buffer | null = null;
  let imageDataUrl = "";
  if (imageUrl) {
    try {
      if (imageUrl.startsWith("data:")) {
        const { buffer } = dataUrlToBuffer(imageUrl);
        imageBuffer = buffer;
        imageDataUrl = imageUrl;
      } else {
        const res = await fetch(imageUrl);
        if (res.ok) {
          imageBuffer = Buffer.from(await res.arrayBuffer());
          imageDataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`;
        }
      }
    } catch (e) {
      console.log(`  ⚠️ Image download failed: ${(e as Error).message}`);
    }
  }

  // 7. Generate PDFs (simple text with metadata)
  console.log("  📄 Generating PDFs...");
  const numeroSerie = String((hashCode(COMMANDE_ID) % 999999) + 1).padStart(6, "0");
  const meta = `Destinataire : ${prenom}
Nom Ancestral : ${nomTotem}
Archetype : ${archetypeName}
Collection : Tome ${numeroSerie}
Date : ${new Date().toISOString().split("T")[0]}
Langue : ${langue}
${imageUrl ? "\n[Image intégrée dans le PDF via React-PDF en production]" : ""}
`;
  const parcheminText = `${meta}\n${texte}`;
  const parcheminBuffer = generateSimplePDF(texte, `${prenom} — ${archetypeName}`);
  const certificatBuffer = generateSimplePDF("", `N° ${numeroSerie} — ${nomTotem}`, true);
  console.log(
    `  ✅ PDFs: parchemin (${(parcheminBuffer.length / 1024).toFixed(1)} KB), certificat (${(certificatBuffer.length / 1024).toFixed(1)} KB)`,
  );

  // 8. Upload all to R2
  console.log("  ☁️ Uploading to R2...");
  const [parchRes, certRes] = await Promise.all([
    uploadToR2(COMMANDE_ID, "parchemin", parcheminBuffer, "application/pdf"),
    uploadToR2(COMMANDE_ID, "certificat", certificatBuffer, "application/pdf"),
  ]);

  let r2ImageUrl = "";
  let r2AudioUrl = "";

  if (imageBuffer) {
    const imgRes = await uploadToR2(COMMANDE_ID, "image", imageBuffer, "image/png");
    r2ImageUrl = imgRes.url;
  }

  if (audioUrl) {
    try {
      let audioBuf: Buffer;
      if (audioUrl.startsWith("data:")) {
        audioBuf = dataUrlToBuffer(audioUrl).buffer;
      } else {
        const res = await fetch(audioUrl);
        audioBuf = Buffer.from(await res.arrayBuffer());
      }
      const audRes = await uploadToR2(COMMANDE_ID, "audio", audioBuf, "audio/mpeg");
      r2AudioUrl = audRes.url;
    } catch (e) {
      console.log(`  ⚠️ Audio upload failed: ${(e as Error).message}`);
    }
  }

  // 9. Update database
  console.log("  💾 Updating database...");
  await Promise.all([
    supabase.from("commandes").update({ statut: "livree" }).eq("id", COMMANDE_ID),
    supabase
      .from("oeuvres")
      .update({
        statut: "livree",
        image_url: r2ImageUrl || imageUrl || null,
        audio_url: r2AudioUrl || audioUrl || null,
        pdf_url: parchRes.signedUrl,
        nom_totem: nomTotem,
        numero_serie: numeroSerie,
        recit: texte,
        metadata: {
          certificatUrl: certRes.signedUrl,
          archetypeId,
          langue,
          offre: cmd.offre,
        },
      })
      .eq("commande_id", COMMANDE_ID),
  ]);

  console.log(`\n✅ PIPELINE COMPLETE!`);
  console.log(`   📜 Texte: ${texte.length} chars`);
  console.log(`   🖼️ Image: ${r2ImageUrl || "N/A"}`);
  console.log(`   🔊 Audio: ${r2AudioUrl || "N/A"}`);
  console.log(`   📄 Parchemin: ${parchRes.url}`);
  console.log(`   📄 Certificat: ${certRes.url}`);
  console.log(`   🏷️ Série: ${numeroSerie}`);
  console.log(`   👤 Pour: ${prenom} (${email})`);
}

main().catch(console.error);
