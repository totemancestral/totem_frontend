import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest, createServiceClient } from "@/lib/server-auth";
import { startPipeline } from "@/lib/services/pipeline";
import type { Json } from "@/integrations/supabase/types";

const completeSchema = z.object({
  commandeId: z.string().uuid(),
  answers: z.record(z.string(), z.unknown()),
  locale: z.enum(["fr", "en"]),
});

type BackendAnswer = { questionId: string; answer: string };

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = completeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Commande incomplete invalide" }, { status: 422 });
  }

  const backendAnswers = toBackendAnswers(parsed.data.answers);
  if (backendAnswers.length !== 10) {
    return NextResponse.json({ error: "Reponses incompletes" }, { status: 422 });
  }

  const supabase = createServiceClient();
  const { data: parcours, error: parcoursError } = await supabase
    .from("reponses_parcours")
    .upsert(
      {
        user_id: auth.userId,
        session_id: auth.userId,
        reponses: parsed.data.answers as unknown as Json,
        termine: true,
        langue: parsed.data.locale,
      },
      { onConflict: "user_id, session_id" },
    )
    .select("id")
    .single();

  if (parcoursError) {
    return NextResponse.json({ error: parcoursError.message }, { status: 500 });
  }

  const env = getServerEnv();
  const { data: commande, error: commandeReadError } = await supabase
    .from("commandes")
    .select("id, statut, stripe_session_id")
    .eq("id", parsed.data.commandeId)
    .eq("user_id", auth.userId)
    .single();

  if (commandeReadError) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  let commandeStatut = commande.statut;

  if (!env.TOTEM_BACKEND_URL) {
    if (commandeStatut === "en_attente_paiement") {
      const confirmation = await confirmStripePaymentIfNeeded(supabase, {
        stripeSecretKey: env.STRIPE_SECRET_KEY,
        commandeId: commande.id,
        stripeSessionId: commande.stripe_session_id,
      });

      if (!confirmation.ok) {
        return NextResponse.json({ error: confirmation.error }, { status: confirmation.status });
      }

      commandeStatut = "paye";
    }

    if (commandeStatut === "remboursee") {
      return NextResponse.json({ error: "Commande remboursee" }, { status: 409 });
    }

    if (commandeStatut === "livree") {
      return NextResponse.json({ completed: true, backend: false, generation: "already_done" });
    }
  }

  const { error: commandeError } = await supabase
    .from("commandes")
    .update({ reponses_id: parcours.id, langue: parsed.data.locale })
    .eq("id", parsed.data.commandeId)
    .eq("user_id", auth.userId);

  if (commandeError) {
    return NextResponse.json({ error: commandeError.message }, { status: 500 });
  }

  if (!env.TOTEM_BACKEND_URL) {
    await ensureOeuvrePlaceholder(supabase, auth.userId, parsed.data.commandeId);

    if (commandeStatut === "en_generation") {
      return NextResponse.json(
        { completed: true, backend: false, generation: "already_started" },
        { status: 202 },
      );
    }

    startPipeline(parsed.data.commandeId);
    return NextResponse.json(
      { completed: true, backend: false, generation: "started" },
      { status: 202 },
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  const result = await completeBackendOrder({
    backendUrl: env.TOTEM_BACKEND_URL.replace(/\/$/, ""),
    authorization,
    commandeId: parsed.data.commandeId,
    answers: backendAnswers,
    locale: parsed.data.locale,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.payload, { status: 202 });
}

async function confirmStripePaymentIfNeeded(
  supabase: ReturnType<typeof createServiceClient>,
  input: {
    stripeSecretKey?: string;
    commandeId: string;
    stripeSessionId: string | null;
  },
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!input.stripeSecretKey || !input.stripeSessionId) {
    return { ok: false, status: 409, error: "Paiement non confirme" };
  }

  try {
    const stripe = new Stripe(input.stripeSecretKey, { apiVersion: "2026-02-25.clover" });
    const session = await stripe.checkout.sessions.retrieve(input.stripeSessionId);

    if (session.payment_status !== "paid") {
      return { ok: false, status: 409, error: "Paiement non confirme" };
    }

    const update: {
      statut: "paye";
      stripe_payment_intent_id: string | null;
      montant_cents?: number;
      devise?: string;
    } = {
      statut: "paye",
      stripe_payment_intent_id: getStripeObjectId(session.payment_intent),
    };

    if (typeof session.amount_total === "number") update.montant_cents = session.amount_total;
    if (session.currency) update.devise = session.currency.toUpperCase();

    const { error } = await supabase.from("commandes").update(update).eq("id", input.commandeId);

    if (error) {
      return { ok: false, status: 500, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      error: error instanceof Error ? error.message : "Verification Stripe impossible",
    };
  }
}

async function completeBackendOrder(input: {
  backendUrl: string;
  authorization: string;
  commandeId: string;
  answers: BackendAnswer[];
  locale: "fr" | "en";
}): Promise<{ ok: true; payload: unknown } | { ok: false; status: number; error: string }> {
  let lastStatus = 502;
  let lastError = "backend_complete_failed";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(`${input.backendUrl}/orders/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: input.authorization,
        },
        body: JSON.stringify({
          externalCommandId: input.commandeId,
          answers: input.answers,
          locale: input.locale,
        }),
      });

      const text = await response.text();
      const payload = parseJson(text);
      if (response.ok) {
        return { ok: true, payload: payload ?? { completed: true, backend: true } };
      }

      lastStatus = response.status;
      lastError = readBackendError(payload, text);
      if (!isRetryableCompletionError(lastStatus, lastError)) break;
    } catch (error) {
      lastStatus = 502;
      lastError = error instanceof Error ? error.message : "backend_complete_failed";
    }

    await sleep(1500);
  }

  return { ok: false, status: lastStatus, error: lastError };
}

function toBackendAnswers(answers: Record<string, unknown>): BackendAnswer[] {
  return Array.from({ length: 10 }, (_, index) => {
    const questionId = `q${index + 1}`;
    const answer = formatAnswer(answers[String(index + 1)]).trim();
    return answer ? { questionId, answer } : null;
  }).filter((answer): answer is BackendAnswer => Boolean(answer));
}

function formatAnswer(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const answer = value as { choice?: string; field?: string; skipped?: boolean };
  if (answer.skipped) return "skipped";
  return [answer.choice, answer.field?.trim()].filter(Boolean).join(" | ");
}

function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function readBackendError(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const message = record.message ?? record.error;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return fallback || "backend_complete_failed";
}

function isRetryableCompletionError(status: number, message: string) {
  if (status === 408 || status === 409 || status === 425 || status >= 500) return true;
  return /payment_not_confirmed|stripe_session_missing|commande_not_found/i.test(message);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStripeObjectId(value: string | { id?: string } | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

async function ensureOeuvrePlaceholder(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  commandeId: string,
) {
  const { data: existing, error: readError } = await supabase
    .from("oeuvres")
    .select("id")
    .eq("commande_id", commandeId)
    .maybeSingle();

  if (readError) {
    throw new Error(`Erreur lecture oeuvre: ${readError.message}`);
  }

  if (existing) return;

  const { error: insertError } = await supabase.from("oeuvres").insert({
    user_id: userId,
    commande_id: commandeId,
    statut: "en_cours",
  });

  if (insertError) {
    throw new Error(`Erreur creation oeuvre: ${insertError.message}`);
  }
}
