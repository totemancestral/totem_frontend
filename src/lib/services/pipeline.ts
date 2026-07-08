import { getServerEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/server-auth";
import { generatePDFs } from "./pdf";
import { uploadAndDeliver, uploadFile, type GeneratedFile } from "./storage";
import { sendDeliveryEmail, sendAdminAlert } from "./email";
import type { Database, Json } from "@/integrations/supabase/types";
import {
  buildAdultFallbackParchment,
  buildAdultPromptBundle,
  createAdultTotemProfile,
  extractAudioScript,
  extractParchmentText,
  extractParchmentSections,
  type AdultPromptBundle,
  type AdultTotemProfile,
  type StorySection,
} from "@/lib/totem-v3";

const SUPABASE_PROJECT_REF = "mjiealkqjcqvlfrxdcif";
const EDGE_FUNCTION_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1`;

export type PipelineStep = "texte" | "image" | "audio" | "pdf" | "upload" | "email";

export type RetryOptions = {
  retries: number;
  delays: number[];
  etape: PipelineStep;
  commandeId: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function countCompletedAnswers(reponses: Record<string, unknown>): number {
  return Array.from({ length: 10 }, (_, index) => reponses[String(index + 1)]).filter((answer) => {
    if (typeof answer === "string") return answer.trim().length > 0;
    if (!answer || typeof answer !== "object") return false;

    const record = answer as { choice?: unknown; field?: unknown; skipped?: unknown };
    if (record.skipped === true) return true;
    if (typeof record.choice === "string" && record.choice.trim()) return true;
    return typeof record.field === "string" && record.field.trim().length > 0;
  }).length;
}

async function logPipelineError(
  commandeId: string,
  etape: string,
  message: string,
  stack?: string,
  tentative = 1,
): Promise<void> {
  try {
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("erreurs_pipeline").insert({
      commande_id: commandeId,
      etape,
      message,
      stack: stack ?? null,
      tentative,
    });
  } catch {
    // Ne pas bloquer le pipeline si le log échoue
  }
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  for (let attempt = 0; attempt <= options.retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === options.retries) {
        throw error;
      }
      await sleep(options.delays[attempt] ?? 1000);
    }
  }
  throw new Error(`Pipeline step ${options.etape} failed for ${options.commandeId}`);
}

async function callEdgeFunction<T>(
  slug: string,
  payload: unknown,
  anonKey: string,
): Promise<T | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
    };

    const internalSecret = process.env.PIPELINE_INTERNAL_SECRET;
    if (internalSecret) {
      headers["x-pipeline-secret"] = internalSecret;
    }

    const response = await fetch(`${EDGE_FUNCTION_URL}/${slug}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Edge function ${slug} error: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function callClaudeDirect(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-opus-4-5",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const result = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };

  return result.content?.[0]?.text?.trim() ?? "";
}

async function generateTexte(
  apiKey: string | undefined,
  anonKey: string | undefined,
  profile: AdultTotemProfile,
  prompts: AdultPromptBundle,
  reponses: Record<string, unknown>,
): Promise<{ texte: string; sections: StorySection[] }> {
  // Tentative 1 : Claude direct avec prompt A2 V3.
  if (apiKey) {
    try {
      const raw = await callClaudeDirect(apiKey, prompts.promptA2);
      const texte = extractParchmentText(raw);
      const sections = extractParchmentSections(raw);
      if (texte) return { texte, sections };
    } catch {
      // Le fallback Edge Function / SENYCE reste disponible.
    }
  }

  // Tentative 2 : Edge Function Supabase (clés stockées dans les secrets Supabase).
  if (anonKey) {
    const result = await callEdgeFunction<{
      texte?: string;
      parchment_text?: string;
      sections?: { title: string; text: string }[];
    }>(
      "generate-texte",
      {
        prenom: profile.firstName,
        reponses,
        archetypeId: profile.archetype.id,
        langue: profile.language,
        prompt: prompts.promptA2,
        profile,
      },
      anonKey,
    );

    const text = result?.parchment_text ?? result?.texte;
    if (text) {
      const texte = extractParchmentText(text);
      let sections: StorySection[] = extractParchmentSections(text);

      // Use structured sections from edge function if available (new format)
      if (result?.sections && result.sections.length > 0) {
        sections = result.sections
          .filter((s) => s.text?.trim().length > 0)
          .map((s) => ({
            title: s.title ?? "",
            paragraphs: [s.text.trim()],
          }));
      }

      return { texte, sections };
    }
  }

  return { texte: "", sections: [] };
}

async function generateImage(
  anonKey: string | undefined,
  profile: AdultTotemProfile,
  texte: string,
  prompts: AdultPromptBundle,
  commandeId: string,
  nomTotem: string,
): Promise<string> {
  if (anonKey) {
    const result = await callEdgeFunction<{ imageUrl?: string }>(
      "generate-image",
      {
        prenom: profile.firstName,
        texte,
        archetypeId: profile.archetype.id,
        langue: profile.language,
        prompt: prompts.imagePrompt,
        visualPrompt: prompts.promptA4,
        seed: profile.seed,
        commandeId,
        nom_totem: nomTotem,
      },
      anonKey,
    );

    if (result?.imageUrl) return result.imageUrl;
  }

  return "";
}

async function generateAudio(
  anonKey: string | undefined,
  profile: AdultTotemProfile,
  script: string,
  prompts: AdultPromptBundle,
): Promise<string> {
  if (anonKey) {
    const result = await callEdgeFunction<{ audioUrl?: string }>(
      "generate-audio",
      {
        prenom: profile.firstName,
        texte: script,
        script,
        archetypeId: "A",
        langue: profile.language,
        audioPrompt: prompts.promptA3,
      },
      anonKey,
    );

    if (result?.audioUrl) return result.audioUrl;
  }

  return "";
}

async function generateAudioScript(
  apiKey: string | undefined,
  prompts: AdultPromptBundle,
): Promise<string> {
  if (!apiKey) return prompts.audioScriptFallback;

  try {
    const raw = await callClaudeDirect(apiKey, prompts.promptA3);
    const script = extractAudioScript(raw);
    return script || prompts.audioScriptFallback;
  } catch {
    return prompts.audioScriptFallback;
  }
}

async function countClanMembers(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  archetypeId: string,
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("oeuvres")
      .select("id", { count: "exact", head: true })
      .eq("statut", "livree")
      .contains("metadata", { archetypeId });

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function callSenyceApi(
  endpoint: string | undefined,
  apiKey: string | undefined,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  if (!endpoint || !apiKey) return null;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`SENYCE API error: ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function castArrayBuffer(value: any): Buffer {
  if (value instanceof Buffer) return value;
  return Buffer.from(value);
}

async function downloadRemoteFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} for ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return castArrayBuffer(arrayBuffer);
}

async function downloadAndUploadToR2(
  commandeId: string,
  url: string,
  type: GeneratedFile["type"],
  mimeType: string,
): Promise<string> {
  const buffer = await downloadRemoteFile(url);
  const ext = type === "image" ? "png" : type === "audio" ? "mp3" : "pdf";
  const fileName = `${type}_${commandeId}.${ext}`;
  const { url: uploadedUrl } = await uploadFile(commandeId, { type, buffer, mimeType, fileName });
  return uploadedUrl;
}

type OeuvreUpdate = Database["public"]["Tables"]["oeuvres"]["Update"];

export async function generateCoffret(commandeId: string): Promise<void> {
  const env = getServerEnv();

  if (env.TOTEM_BACKEND_URL) {
    const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
    const response = await fetch(`${backendUrl}/totem/pipeline/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: commandeId }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Backend pipeline failed: ${response.status} ${detail}`);
    }

    return;
  }

  const supabase = createServiceClient();

  await supabase.from("commandes").update({ statut: "en_generation" }).eq("id", commandeId);

  await supabase.from("oeuvres").update({ statut: "en_generation" }).eq("commande_id", commandeId);

  async function updateOeuvreStep(step: string, meta?: Record<string, unknown>) {
    const update: OeuvreUpdate = { statut: step };
    if (meta) update.metadata = meta as Json;
    await supabase.from("oeuvres").update(update).eq("commande_id", commandeId);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseAny = supabase as any;

    const commande = await supabaseAny.from("commandes").select("*").eq("id", commandeId).single();
    const oeuvre = await supabaseAny
      .from("oeuvres")
      .select("id")
      .eq("commande_id", commandeId)
      .single();

    if (!commande.data || !oeuvre.data) {
      throw new Error("Commande ou oeuvre introuvable");
    }

    const userId = commande.data.user_id;
    const langue = (commande.data.langue || "fr") as "fr" | "en";
    const offre = commande.data.offre;

    const profile = await supabaseAny
      .from("profiles")
      .select("prenom, email")
      .eq("id", userId)
      .single();
    const prenom = profile.data?.prenom ?? "Voyageur";
    const email = profile.data?.email ?? "";

    const reponsesResult = await supabaseAny
      .from("reponses_parcours")
      .select("reponses")
      .eq("user_id", userId)
      .eq("termine", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const reponses = reponsesResult.data?.reponses ?? {};
    if (countCompletedAnswers(reponses) !== 10) {
      throw new Error("Reponses parcours incompletes");
    }

    const numeroSerie = (hashCode(commandeId) % 999999) + 1;
    const adultProfile = createAdultTotemProfile({
      firstName: prenom,
      language: langue,
      answers: reponses,
      seed: commandeId,
      orderNumber: numeroSerie,
    });
    const clanCount = await countClanMembers(supabaseAny, adultProfile.archetype.id);
    let promptBundle = buildAdultPromptBundle({
      profile: adultProfile,
      answers: reponses,
      clanCount,
    });
    const archetypeId = adultProfile.archetype.id;
    const nomTotem = adultProfile.nomComplet;

    // Étape 1 : Texte du parchemin via Edge Function ou Claude direct
    await updateOeuvreStep("generation_texte");
    let texteParchemin = "";
    let sectionsParchemin: StorySection[] = [];

    try {
      const result = await generateTexte(
        env.ANTHROPIC_API_KEY,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        adultProfile,
        promptBundle,
        reponses,
      );
      texteParchemin = result.texte;
      sectionsParchemin = result.sections;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur generation texte";
      await logPipelineError(
        commandeId,
        "texte",
        message,
        error instanceof Error ? error.stack : undefined,
        1,
      );
    }

    // Fallback SENYCE si edge function et Claude indisponibles
    if (!texteParchemin && env.SENYCE_API_TEXTE && env.SENYCE_API_KEY) {
      try {
        await retryWithBackoff(
          async () => {
            const result = await callSenyceApi(env.SENYCE_API_TEXTE, env.SENYCE_API_KEY, {
              prenom,
              reponses,
              archetype: archetypeId,
              langue,
              prompt: promptBundle.promptA2,
              profile: adultProfile,
            });
            const raw = (result?.parchment_text as string) ?? (result?.texte as string) ?? "";
            texteParchemin = extractParchmentText(raw);
            sectionsParchemin = extractParchmentSections(raw);
          },
          { retries: 2, delays: [1000, 3000], etape: "texte", commandeId },
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur generation texte SENYCE";
        await logPipelineError(
          commandeId,
          "texte",
          message,
          error instanceof Error ? error.stack : undefined,
          1,
        );
      }
    }

    // Fallback local si aucun service disponible
    if (!texteParchemin) {
      texteParchemin = buildAdultFallbackParchment(adultProfile, reponses);
      sectionsParchemin = extractParchmentSections(texteParchemin);
    }

    promptBundle = buildAdultPromptBundle({
      profile: adultProfile,
      answers: reponses,
      clanCount,
      parchmentText: texteParchemin,
    });
    const audioScript = await generateAudioScript(env.ANTHROPIC_API_KEY, promptBundle);

    // Étape 2 : Image et Audio via Edge Functions ou SENYCE (en parallèle)
    await updateOeuvreStep("generation_image_audio");
    let senyceImageUrl = "";
    let senyceAudioUrl = "";
    let imageBufferForPdf: Buffer | null = null;

    await Promise.all([
      generateImage(env.NEXT_PUBLIC_SUPABASE_ANON_KEY, adultProfile, texteParchemin, promptBundle, commandeId, nomTotem)
        .then((url) => {
          senyceImageUrl = url || "";
        })
        .catch(async (error) => {
          const message = error instanceof Error ? error.message : "Erreur generation image";
          await logPipelineError(commandeId, "image", message, undefined, 1);
        }),
      generateAudio(env.NEXT_PUBLIC_SUPABASE_ANON_KEY, adultProfile, audioScript, promptBundle)
        .then((url) => {
          senyceAudioUrl = url || "";
        })
        .catch(async (error) => {
          const message = error instanceof Error ? error.message : "Erreur generation audio";
          await logPipelineError(commandeId, "audio", message, undefined, 1);
        }),
    ]);

    // Fallback SENYCE direct si edge functions non déployées
    if (!senyceImageUrl && env.SENYCE_API_IMAGE && env.SENYCE_API_KEY) {
      try {
        const result = await callSenyceApi(env.SENYCE_API_IMAGE, env.SENYCE_API_KEY, {
          prenom,
          texte: texteParchemin,
          archetype: archetypeId,
          langue,
          prompt: promptBundle.imagePrompt,
          visualPrompt: promptBundle.promptA4,
          profile: adultProfile,
        });
        senyceImageUrl = (result?.imageUrl as string) ?? (result?.url as string) ?? "";
      } catch {
        // Silencieux
      }
    }

    if (!senyceAudioUrl && env.SENYCE_API_AUDIO && env.SENYCE_API_KEY) {
      try {
        const result = await callSenyceApi(env.SENYCE_API_AUDIO, env.SENYCE_API_KEY, {
          prenom,
          texte: audioScript,
          script: audioScript,
          archetype: archetypeId,
          langue,
          audioPrompt: promptBundle.promptA3,
          profile: adultProfile,
        });
        senyceAudioUrl = (result?.audioUrl as string) ?? (result?.url as string) ?? "";
      } catch {
        // Silencieux
      }
    }

    // Pré-téléchargement de l'image pour l'embarquer dans le PDF
    let imageDataUrl = "";
    if (senyceImageUrl) {
      try {
        if (senyceImageUrl.startsWith("data:")) {
          imageDataUrl = senyceImageUrl;
          imageBufferForPdf = Buffer.from(senyceImageUrl.split(",")[1], "base64");
        } else {
          const imgRes = await fetch(senyceImageUrl);
          if (imgRes.ok) {
            const imgBuf = Buffer.from(await imgRes.arrayBuffer());
            imageBufferForPdf = imgBuf;
            imageDataUrl = `data:image/png;base64,${imgBuf.toString("base64")}`;
          }
        }
      } catch {
        // Silencieux
      }
    }

    // Étape 3 : Génération PDF
    await updateOeuvreStep("generation_pdf");
    let parcheminBuffer: Buffer;
    let certificatBuffer: Buffer;

    const subtitle =
      langue === "fr"
        ? "Décret royal de révélation symbolique"
        : "Royal decree of symbolic revelation";

    try {
      const pdfPayload = {
        prenom,
        nomAncestral: nomTotem,
        archetypeId,
        texteParchemin,
        numeroCollection: numeroSerie,
        langue,
        imageUrl: senyceImageUrl || undefined,
        imageDataUrl: imageDataUrl || undefined,
        sections: sectionsParchemin.length > 0 ? sectionsParchemin : undefined,
        subtitle,
      };

      ({ parcheminBuffer, certificatBuffer } = await generatePDFs(pdfPayload));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur generation PDF";
      await logPipelineError(
        commandeId,
        "pdf",
        message,
        error instanceof Error ? error.stack : undefined,
        1,
      );
      throw error;
    }

    // Étape 4 : Upload fichiers vers R2
    await updateOeuvreStep("upload");
    const files: GeneratedFile[] = [
      {
        type: "parchemin",
        buffer: parcheminBuffer,
        mimeType: "application/pdf",
        fileName: `parchemin_${commandeId}.pdf`,
      },
      {
        type: "certificat",
        buffer: certificatBuffer,
        mimeType: "application/pdf",
        fileName: `certificat_${commandeId}.pdf`,
      },
    ];

    let uploadedUrls: Record<string, string> = {};
    let r2ImageUrl = "";
    let r2AudioUrl = "";

    try {
      uploadedUrls = await uploadAndDeliver(commandeId, files);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur upload R2";
      await logPipelineError(
        commandeId,
        "upload",
        message,
        error instanceof Error ? error.stack : undefined,
        1,
      );
    }

    // Uploader les assets vers R2 (stockage persistant)
    if (senyceImageUrl && imageBufferForPdf) {
      try {
        const ext = "png";
        const mimeType = "image/png";
        const fileName = `image_${commandeId}.${ext}`;
        const { url: uploadedUrl } = await uploadFile(commandeId, {
          type: "image",
          buffer: imageBufferForPdf,
          mimeType,
          fileName,
        });
        r2ImageUrl = uploadedUrl;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur upload image";
        await logPipelineError(commandeId, "upload", message, undefined, 1);
      }
    }

    if (senyceAudioUrl) {
      try {
        r2AudioUrl = await downloadAndUploadToR2(commandeId, senyceAudioUrl, "audio", "audio/mpeg");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur download/upload audio";
        await logPipelineError(
          commandeId,
          "upload",
          message,
          error instanceof Error ? error.stack : undefined,
          1,
        );
      }
    }

    // Le fallback : si R2 a échoué on garde les URLs SENYCE originales
    const pdfUrl = uploadedUrls.parchemin ?? "";
    const certUrl = uploadedUrls.certificat ?? "";
    const finalImageUrl = r2ImageUrl || senyceImageUrl || "";
    const finalAudioUrl = r2AudioUrl || senyceAudioUrl || "";

    // Étape 5 : Mise à jour des statuts
    const urls: Record<string, string | null> = {
      pdf_url: pdfUrl || null,
      image_url: finalImageUrl || null,
      audio_url: finalAudioUrl || null,
      certificat_url: certUrl || null,
    };

    const hasRequiredAssets = pdfUrl !== "";
    const livreeStatus = hasRequiredAssets ? "livree" : "erreur";

    await Promise.all([
      supabase
        .from("commandes")
        .update({
          statut: livreeStatus,
        })
        .eq("id", commandeId),
      supabase
        .from("oeuvres")
        .update({
          statut: livreeStatus,
          image_url: urls.image_url,
          audio_url: urls.audio_url,
          pdf_url: urls.pdf_url,
          nom_totem: nomTotem,
          numero_serie: String(numeroSerie).padStart(6, "0"),
          recit: texteParchemin,
          metadata: {
            certificatUrl: urls.certificat_url,
            archetypeId,
            archetypeFrench: adultProfile.archetype.french,
            archetypeEnglish: adultProfile.archetype.english,
            people: adultProfile.archetype.people,
            region: adultProfile.archetype.region,
            nomComplet: adultProfile.nomComplet,
            workTitleFr: adultProfile.workTitleFr,
            workTitleEn: adultProfile.workTitleEn,
            scores: adultProfile.scores,
            dominant: adultProfile.dominant,
            secondary: adultProfile.secondary,
            clanCount,
            narrativeVariant: promptBundle.narrativeVariant,
            visualFrame: promptBundle.visualFrame,
            share: promptBundle.shareFallback,
            langue,
            offre,
          },
        })
        .eq("commande_id", commandeId),
    ]);

    if (!hasRequiredAssets) {
      const message = "Livrable PDF manquant apres upload R2";
      await logPipelineError(commandeId, "upload", message, undefined, 1);
      await sendAdminAlert("Erreur livraison Totem", message).catch(() => {});
      return;
    }

    // Étape 6 : Email de livraison
    if (email) {
      try {
        await sendDeliveryEmail(email, prenom, langue, {
          imageUrl: urls.image_url ?? undefined,
          audioUrl: urls.audio_url ?? undefined,
          pdfUrl: urls.pdf_url ?? undefined,
          nomTotem,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur envoi email livraison";
        await logPipelineError(
          commandeId,
          "email",
          message,
          error instanceof Error ? error.stack : undefined,
          1,
        );
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur pipeline inconnue";

    await Promise.all([
      logPipelineError(
        commandeId,
        "pipeline",
        message,
        error instanceof Error ? error.stack : undefined,
        1,
      ),
      supabase.from("commandes").update({ statut: "erreur" }).eq("id", commandeId),
    ]);

    await sendAdminAlert("Erreur pipeline Totem", message).catch(() => {});
    throw error;
  }
}

export async function finalizeCoffret(
  commandeId: string,
  assets: {
    imageUrl?: string;
    audioUrl?: string;
    pdfUrl?: string;
    nomTotem?: string;
    numeroSerie?: string;
    recit?: string;
  },
): Promise<void> {
  const supabase = createServiceClient();

  const hasRequiredAssets = (assets.pdfUrl ?? "") !== "";
  const statut = hasRequiredAssets ? "livree" : "erreur";

  await Promise.all([
    supabase.from("commandes").update({ statut }).eq("id", commandeId),
    supabase
      .from("oeuvres")
      .update({
        statut,
        image_url: assets.imageUrl ?? null,
        audio_url: assets.audioUrl ?? null,
        pdf_url: assets.pdfUrl ?? null,
        nom_totem: assets.nomTotem ?? null,
        numero_serie: assets.numeroSerie ?? null,
        recit: assets.recit ?? null,
      })
      .eq("commande_id", commandeId),
  ]);
}

const JUNIOR_EDGE_URL = EDGE_FUNCTION_URL;

export async function generateJuniorMedia(
  oeuvreId: string,
  userId: string,
  anonKey: string | undefined,
  juniorResult: {
    prenom: string;
    nomComplet: string;
    phrase: string;
    attribut: string;
    messageClan: string;
    orderNumber: number;
  },
  langue: "fr" | "en",
): Promise<{ imageUrl: string; pdfUrl: string } | null> {
  try {
    const env = getServerEnv();
    let imageUrl = "";
    let pdfUrl = "";

    if (anonKey) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
        };
        const internalSecret = process.env.PIPELINE_INTERNAL_SECRET;
        if (internalSecret) headers["x-pipeline-secret"] = internalSecret;

        const response = await fetch(`${JUNIOR_EDGE_URL}/generate-image`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            prenom: juniorResult.prenom,
            texte: juniorResult.phrase,
            archetypeId: "junior",
            langue,
            prompt: `Illustration for ${juniorResult.nomComplet}, a ${juniorResult.attribut}`,
          }),
        });

        if (response.ok) {
          const data = await response.json().catch(() => null);
          imageUrl = data?.imageUrl ?? "";
        }
      } catch {
        // Silencieux
      }
    }

    // Télécharger l'image pour l'embarquer dans le PDF
    let imageDataUrl = "";
    let imageBufferForPdf: Buffer | null = null;
    if (imageUrl) {
      try {
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const imgBuf = Buffer.from(await imgRes.arrayBuffer());
          imageBufferForPdf = imgBuf;
          imageDataUrl = `data:image/png;base64,${imgBuf.toString("base64")}`;
        }
      } catch {
        // Silencieux
      }
    }

    // Générer le PDF
    try {
      const pdfPayload = {
        prenom: juniorResult.prenom,
        nomAncestral: juniorResult.nomComplet,
        archetypeId: "junior",
        texteParchemin: `${juniorResult.phrase}\n\n${juniorResult.attribut}\n\n${juniorResult.messageClan}`,
        numeroCollection: juniorResult.orderNumber,
        langue,
        imageUrl: imageUrl || undefined,
        imageDataUrl: imageDataUrl || undefined,
        sections: [
          { title: juniorResult.nomComplet, paragraphs: [juniorResult.phrase] },
          { title: "Attribut", paragraphs: [juniorResult.attribut] },
          { title: "Clan", paragraphs: [juniorResult.messageClan] },
        ],
        subtitle: langue === "fr" ? "Totem Junior" : "Junior Totem",
      };

      const { parcheminBuffer } = await generatePDFs(pdfPayload);

      const { url: uploadedUrl } = await uploadFile(oeuvreId, {
        type: "parchemin",
        buffer: parcheminBuffer,
        mimeType: "application/pdf",
        fileName: `junior_${oeuvreId}.pdf`,
      });
      pdfUrl = uploadedUrl;
    } catch {
      // Silencieux
    }

    // Uploader l'image au R2
    let r2ImageUrl = "";
    if (imageBufferForPdf) {
      try {
        const { url: uploadedUrl } = await uploadFile(oeuvreId, {
          type: "image",
          buffer: imageBufferForPdf,
          mimeType: "image/png",
          fileName: `junior_image_${oeuvreId}.png`,
        });
        r2ImageUrl = uploadedUrl;
      } catch {
        // Silencieux
      }
    }

    const finalImageUrl = r2ImageUrl || imageUrl;

    // Mettre à jour l'oeuvre dans la base
    const supabase = createServiceClient();
    await supabase
      .from("oeuvres")
      .update({
        pdf_url: pdfUrl || null,
        image_url: finalImageUrl || null,
      })
      .eq("id", oeuvreId);

    // Envoyer l'email de livraison si on a un PDF
    if (pdfUrl) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("prenom, email")
          .eq("id", userId)
          .single();
        const email = profile?.email;
        const prenom = profile?.prenom ?? juniorResult.prenom;
        if (email) {
          await sendDeliveryEmail(email, prenom, langue, {
            imageUrl: finalImageUrl || undefined,
            pdfUrl: pdfUrl || undefined,
            nomTotem: juniorResult.nomComplet,
          });
        }
      } catch {
        // Silencieux
      }
    }

    return { imageUrl: finalImageUrl, pdfUrl };
  } catch {
    return null;
  }
}
