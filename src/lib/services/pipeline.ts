import { getServerEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/server-auth";

export type PipelineStep = "texte" | "image" | "audio" | "pdf" | "upload" | "email";

export type RetryOptions = {
  retries: number;
  delays: number[];
  etape: PipelineStep;
  commandeId: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
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

export async function generateCoffret(commandeId: string): Promise<void> {
  const env = getServerEnv();

  // If backend orchestrator is configured, forward to it
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

  // Inline fallback: update status and wait for microservices
  const supabase = createServiceClient();

  await supabase
    .from("commandes")
    .update({ statut: "en_generation" })
    .eq("id", commandeId);

  await supabase
    .from("oeuvres")
    .update({ statut: "en_cours" })
    .eq("commande_id", commandeId);

  // Les microservices (Texte, Image, Audio, PDF) seront connectes
  // par l'utilisateur via les variables d'environnement SENYCE_API_*.
  // Pour l'instant, le statut reste "en_generation" et les fichiers
  // apparaitront dans le dashboard quand la pipeline sera complete.

  // Tentative de ping des microservices si configures
  if (env.SENYCE_API_TEXTE && env.SENYCE_API_KEY) {
    // Microservices disponibles — la pipeline sera executee
    // via un worker dedie ou le backend NestJS
    return;
  }

  // Aucun microservice configure — la commande reste en attente
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

  await supabase
    .from("commandes")
    .update({
      statut: "livree",
    })
    .eq("id", commandeId);

  await supabase
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
    .eq("commande_id", commandeId);
}
