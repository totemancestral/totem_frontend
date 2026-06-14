import { getServerEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/server-auth";
import { generatePDFs } from "./pdf";
import { uploadAndDeliver, uploadFile, type GeneratedFile } from "./storage";
import { sendDeliveryEmail, sendAdminAlert } from "./email";

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

const ARCHETYPE_LABELS: Record<string, { fr: string; en: string }> = {
  A: { fr: "Guerrier", en: "Warrior" },
  B: { fr: "Sage", en: "Sage" },
  C: { fr: "Gardien", en: "Guardian" },
  D: { fr: "Visionnaire", en: "Visionary" },
};

async function callEdgeFunction<T>(slug: string, payload: unknown, anonKey: string): Promise<T | null> {
  try {
    const response = await fetch(`${EDGE_FUNCTION_URL}/${slug}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
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
      model: "claude-opus-4-8",
      max_tokens: 1024,
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

function buildPrompt(
  prenom: string,
  archetype: string,
  champsLibres: string,
  langue: "fr" | "en",
): string {
  if (langue === "fr") {
    return `Tu es un griot africain ancestral, un conteur des temps anciens. Rédige un parchemin mystique et poétique pour ${prenom}, dont l'archétype ancestral est "${archetype}".

Voici les réponses de son parcours initiatique (champs libres) :
${champsLibres || "Le voyageur n'a pas laissé de paroles."}

Le parchemin doit être :
- Mystérieux et envoûtant, comme une prophétie ancestrale
- Rédigé dans un français poétique et soutenu
- Personnel, adressé directement à ${prenom}
- Environ 200-300 mots
- Parler de son archétype ${archetype}, de sa lignée, de son destin
- Ne pas mentionner que c'est une IA qui écrit

Écris uniquement le texte du parchemin, sans titre, sans signature.`;
  }

  return `You are an ancestral African griot, a storyteller from ancient times. Write a mystical and poetic parchment for ${prenom}, whose ancestral archetype is "${archetype}".

Here are their initiatory journey answers (free text fields):
${champsLibres || "The traveler left no words."}

The parchment must be:
- Mysterious and enchanting, like an ancestral prophecy
- Written in poetic, elevated English
- Personal, addressed directly to ${prenom}
- About 200-300 words
- Speak of their ${archetype} archetype, their lineage, their destiny
- Do not mention it's an AI writing

Write only the parchment text, no title, no signature.`;
}

function extractChampsLibres(reponses: Record<string, unknown>): string {
  return Object.values(reponses)
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
    .map((a) => (a as { field?: string }).field ?? "")
    .filter(Boolean)
    .join("\n");
}

async function generateTexte(
  apiKey: string | undefined,
  anonKey: string | undefined,
  prenom: string,
  reponses: Record<string, unknown>,
  archetypeId: string,
  langue: "fr" | "en",
): Promise<string> {
  // Tentative 1 : Edge Function Supabase (clés stockées dans les secrets Supabase)
  if (anonKey) {
    const result = await callEdgeFunction<{ texte?: string }>("generate-texte", {
      prenom,
      reponses,
      archetypeId,
      langue,
    }, anonKey);

    if (result?.texte) return result.texte;
  }

  // Tentative 2 : Appel direct Claude (fallback si edge function non déployée)
  if (apiKey) {
    const l = (langue === "en" ? "en" : "fr") as "fr" | "en";
    const archetype = ARCHETYPE_LABELS[archetypeId]?.[l] ?? "Griot";
    const champsLibres = extractChampsLibres(reponses);
    const prompt = buildPrompt(prenom, archetype, champsLibres, l);

    try {
      const texte = await callClaudeDirect(apiKey, prompt);
      if (texte) return texte;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur generation texte Claude";
      throw new Error(message);
    }
  }

  return "";
}

async function generateImage(
  anonKey: string | undefined,
  prenom: string,
  texte: string,
  archetypeId: string,
  langue: "fr" | "en",
): Promise<string> {
  if (anonKey) {
    const result = await callEdgeFunction<{ imageUrl?: string }>("generate-image", {
      prenom,
      texte,
      archetypeId,
      langue,
    }, anonKey);

    if (result?.imageUrl) return result.imageUrl;
  }

  return "";
}

async function generateAudio(
  anonKey: string | undefined,
  prenom: string,
  texte: string,
  archetypeId: string,
  langue: "fr" | "en",
): Promise<string> {
  if (anonKey) {
    const result = await callEdgeFunction<{ audioUrl?: string }>("generate-audio", {
      prenom,
      texte,
      archetypeId,
      langue,
    }, anonKey);

    if (result?.audioUrl) return result.audioUrl;
  }

  return "";
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

type CommandeData = {
  id: string;
  user_id: string;
  offre: string;
  langue: string;
  montant_cents: number;
};

type OeuvreData = {
  id: string;
};

type ProfileData = {
  prenom: string;
  email: string;
};

type ReponsesData = {
  reponses: Record<string, unknown>;
};

const ARCHETYPE_NAMES: Record<string, { fr: string; en: string }> = {
  A: { fr: "Guerrier", en: "Warrior" },
  B: { fr: "Sage", en: "Sage" },
  C: { fr: "Gardien", en: "Guardian" },
  D: { fr: "Visionnaire", en: "Visionary" },
};

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
    const update: Record<string, unknown> = { statut: step };
    if (meta) update.metadata = meta;
    await supabase.from("oeuvres").update(update).eq("commande_id", commandeId);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseAny = supabase as any;

    const commande = await supabaseAny.from("commandes").select("*").eq("id", commandeId).single();
    const oeuvre = await supabaseAny.from("oeuvres").select("id").eq("commande_id", commandeId).single();

    if (!commande.data || !oeuvre.data) {
      throw new Error("Commande ou oeuvre introuvable");
    }

    const userId = commande.data.user_id;
    const langue = (commande.data.langue || "fr") as "fr" | "en";
    const offre = commande.data.offre;

    const profile = await supabaseAny.from("profiles").select("prenom, email").eq("id", userId).single();
    const prenom = profile.data?.prenom ?? "Voyageur";
    const email = profile.data?.email ?? "";

    const reponsesResult = await supabaseAny
      .from("reponses_parcours")
      .select("reponses")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const reponses = reponsesResult.data?.reponses ?? {};

    const firstAnswer = Object.values(reponses).find((a) => {
      if (!a || typeof a !== "object") return false;
      return "choice" in (a as Record<string, unknown>);
    }) as { choice?: string } | undefined;

    const archetypeId = firstAnswer?.choice ?? "A";
    const archetypeName = ARCHETYPE_NAMES[archetypeId]?.[langue] ?? "Griot";
    const numeroSerie = (hashCode(commandeId) % 999999) + 1;
    const nomTotem = `${prenom} ${archetypeName}`;

    // Étape 1 : Texte du parchemin via Edge Function ou Claude direct
    await updateOeuvreStep("generation_texte");
    let texteParchemin = "";

    try {
      texteParchemin = await generateTexte(
        env.ANTHROPIC_API_KEY,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        prenom,
        reponses,
        archetypeId,
        langue,
      );
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
            });
            texteParchemin = (result?.texte as string) ?? "";
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
      const lines: string[] = [];
      for (const [, val] of Object.entries(reponses)) {
        if (!val || typeof val !== "object") continue;
        const answer = val as { choice?: string; field?: string };
        if (answer.field?.trim()) {
          lines.push(answer.field.trim());
        }
      }
      texteParchemin =
        lines.length > 0 ? lines.join("\n\n") : `Totem Ancestral de ${prenom} — ${archetypeName}`;
    }

    // Étape 2 : Image et Audio via Edge Functions ou SENYCE (en parallèle)
    await updateOeuvreStep("generation_image_audio");
    let senyceImageUrl = "";
    let senyceAudioUrl = "";

    const [imageResult, audioResult] = await Promise.all([
      generateImage(
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        prenom,
        texteParchemin,
        archetypeId,
        langue,
      ).then((url) => {
        senyceImageUrl = url || "";
      }).catch(async (error) => {
        const message = error instanceof Error ? error.message : "Erreur generation image";
        await logPipelineError(commandeId, "image", message, undefined, 1);
      }),
      generateAudio(
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        prenom,
        texteParchemin,
        archetypeId,
        langue,
      ).then((url) => {
        senyceAudioUrl = url || "";
      }).catch(async (error) => {
        const message = error instanceof Error ? error.message : "Erreur generation audio";
        await logPipelineError(commandeId, "audio", message, undefined, 1);
      }),
    ]);

    // Fallback SENYCE direct si edge functions non déployées
    if (!senyceImageUrl && env.SENYCE_API_IMAGE && env.SENYCE_API_KEY) {
      try {
        const result = await callSenyceApi(env.SENYCE_API_IMAGE, env.SENYCE_API_KEY, {
          prenom, texte: texteParchemin, archetype: archetypeId, langue,
        });
        senyceImageUrl = (result?.imageUrl as string) ?? (result?.url as string) ?? "";
      } catch {
        // Silencieux
      }
    }

    if (!senyceAudioUrl && env.SENYCE_API_AUDIO && env.SENYCE_API_KEY) {
      try {
        const result = await callSenyceApi(env.SENYCE_API_AUDIO, env.SENYCE_API_KEY, {
          prenom, texte: texteParchemin, archetype: archetypeId, langue,
        });
        senyceAudioUrl = (result?.audioUrl as string) ?? (result?.url as string) ?? "";
      } catch {
        // Silencieux
      }
    }

    // Étape 3 : Génération PDF
    await updateOeuvreStep("generation_pdf");
    let parcheminBuffer: Buffer;
    let certificatBuffer: Buffer;

    try {
      const pdfPayload = {
        prenom,
        nomAncestral: nomTotem,
        archetypeId,
        texteParchemin,
        numeroCollection: numeroSerie,
        langue,
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

    // Télécharger et re-uploader les assets SENYCE vers R2 (stockage persistant)
    if (senyceImageUrl) {
      try {
        r2ImageUrl = await downloadAndUploadToR2(commandeId, senyceImageUrl, "image", "image/png");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur download/upload image";
        await logPipelineError(
          commandeId,
          "upload",
          message,
          error instanceof Error ? error.stack : undefined,
          1,
        );
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

    await Promise.all([
      supabase
        .from("commandes")
        .update({
          statut: "livree",
        })
        .eq("id", commandeId),
      supabase
        .from("oeuvres")
        .update({
          statut: "livree",
          image_url: urls.image_url,
          audio_url: urls.audio_url,
          pdf_url: urls.pdf_url,
          nom_totem: nomTotem,
          numero_serie: String(numeroSerie).padStart(6, "0"),
          recit: texteParchemin,
          metadata: {
            certificatUrl: urls.certificat_url,
            archetypeId,
            langue,
            offre,
          },
        })
        .eq("commande_id", commandeId),
    ]);

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

  await Promise.all([
    supabase.from("commandes").update({ statut: "livree" }).eq("id", commandeId),
    supabase
      .from("oeuvres")
      .update({
        statut: "livree",
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
