import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/server-auth";
import { sendConfirmationEmail } from "@/lib/services/email";
import { generateCoffret } from "@/lib/services/pipeline";
import type { Json } from "@/integrations/supabase/types";

export const maxDuration = 300;

type Locale = "fr" | "en";
type Offre = "essentiel" | "signature" | "heritage";
type CommandeStatut =
  "en_attente_paiement" | "paye" | "en_generation" | "livree" | "erreur" | "remboursee";
type SupabaseServiceClient = ReturnType<typeof createServiceClient>;

const OFFER_MAP: Record<string, Offre> = {
  origine: "essentiel",
  ancestral: "signature",
  famille: "heritage",
};

const OFFER_LABELS: Record<Offre, Record<Locale, string>> = {
  essentiel: { fr: "Origine", en: "Origin" },
  signature: { fr: "Ancestral", en: "Ancestral" },
  heritage: { fr: "Famille", en: "Family" },
};

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe manquante" }, { status: 400 });
  }

  const env = getServerEnv();

  if (env.TOTEM_BACKEND_URL) {
    const response = await fetch(`${env.TOTEM_BACKEND_URL.replace(/\/$/, "")}/webhooks/stripe`, {
      method: "POST",
      headers: {
        "content-type": request.headers.get("content-type") ?? "application/json",
        "stripe-signature": signature,
      },
      body,
    });

    return NextResponse.json(
      { received: response.ok, forwarded: true },
      { status: response.ok ? 202 : response.status },
    );
  }

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook non configure. Configure TOTEM_BACKEND_URL ou les cles Stripe." },
      { status: 503 },
    );
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Signature Stripe invalide" }, { status: 400 });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") {
        return NextResponse.json(
          { received: true, status: session.payment_status },
          { status: 202 },
        );
      }

      return await handlePaidCheckoutSession(session);
    }

    if (event.type === "charge.refunded") {
      return await handleRefundedCharge(event.data.object as Stripe.Charge);
    }

    return NextResponse.json({ received: true, ignored: event.type }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePaidCheckoutSession(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};
  const userId = metadata.userId;
  const locale = toLocale(metadata.locale);
  const email = metadata.email || session.customer_details?.email || "";
  const offre = OFFER_MAP[metadata.offre ?? ""] ?? "essentiel";
  const paymentIntentId = getStripeObjectId(session.payment_intent);
  const commandeId = isUuid(metadata.commandeId ?? "") ? metadata.commandeId : null;

  if (!userId) {
    return NextResponse.json({ error: "userId manquant dans les metadata" }, { status: 422 });
  }

  const supabase = createServiceClient();
  const reponsesId = await findCurrentParcoursId(supabase, userId);
  const commande = await upsertPaidCommande(supabase, {
    userId,
    offre,
    locale,
    session,
    paymentIntentId,
    reponsesId,
    commandeId,
  });

  if (commande.alreadyProcessed) {
    return NextResponse.json(
      { received: true, commandeId: commande.id, alreadyProcessed: true },
      { status: 200 },
    );
  }

  await ensureOeuvrePlaceholder(supabase, userId, commande.id);
  const metadataComplete = await upsertReponsesFromMetadata(
    supabase,
    userId,
    session.id,
    metadata,
    locale,
  );
  const storedParcoursComplete = reponsesId
    ? await hasCompleteParcours(supabase, reponsesId)
    : false;

  if (metadataComplete || storedParcoursComplete) {
    request.waitUntil(generateCoffret(commande.id).catch(() => undefined));
  }

  const offreLabel = OFFER_LABELS[offre][locale];
  request.waitUntil(
    sendConfirmationEmail(email, metadata.prenom ?? "", offreLabel, locale, commande.id).catch(
      () => {},
    ),
  );

  return NextResponse.json({ received: true, commandeId: commande.id }, { status: 202 });
}

async function upsertPaidCommande(
  supabase: SupabaseServiceClient,
  input: {
    userId: string;
    offre: Offre;
    locale: Locale;
    session: Stripe.Checkout.Session;
    paymentIntentId: string | null;
    reponsesId: string | null;
    commandeId: string | null;
  },
): Promise<{ id: string; alreadyProcessed: boolean }> {
  const { data: existing, error: existingError } = await supabase
    .from("commandes")
    .select("id, statut")
    .eq("stripe_session_id", input.session.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Erreur lecture commande: ${existingError.message}`);
  }

  if (existing) {
    return updateExistingCommande(supabase, existing, input);
  }

  if (input.commandeId) {
    const { data: existingById, error: existingByIdError } = await supabase
      .from("commandes")
      .select("id, statut")
      .eq("id", input.commandeId)
      .eq("user_id", input.userId)
      .maybeSingle();

    if (existingByIdError) {
      throw new Error(`Erreur lecture commande: ${existingByIdError.message}`);
    }

    if (existingById) {
      return updateExistingCommande(supabase, existingById, input);
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("commandes")
    .insert({
      user_id: input.userId,
      reponses_id: input.reponsesId,
      offre: input.offre,
      statut: "paye",
      montant_cents: input.session.amount_total ?? 0,
      devise: input.session.currency?.toUpperCase() ?? "EUR",
      stripe_session_id: input.session.id,
      stripe_payment_intent_id: input.paymentIntentId,
      langue: input.locale,
    })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: duplicate } = await supabase
        .from("commandes")
        .select("id")
        .eq("stripe_session_id", input.session.id)
        .maybeSingle();

      if (duplicate) return { id: duplicate.id, alreadyProcessed: true };
    }

    throw new Error(`Erreur creation commande: ${insertError.message}`);
  }

  return { id: inserted.id, alreadyProcessed: false };
}

async function updateExistingCommande(
  supabase: SupabaseServiceClient,
  existing: { id: string; statut: string },
  input: {
    locale: Locale;
    session: Stripe.Checkout.Session;
    paymentIntentId: string | null;
    reponsesId: string | null;
  },
): Promise<{ id: string; alreadyProcessed: boolean }> {
  if ((existing.statut as CommandeStatut) !== "en_attente_paiement") {
    return { id: existing.id, alreadyProcessed: true };
  }

  const { data: updated, error: updateError } = await supabase
    .from("commandes")
    .update({
      statut: "paye",
      montant_cents: input.session.amount_total ?? 0,
      devise: input.session.currency?.toUpperCase() ?? "EUR",
      stripe_session_id: input.session.id,
      stripe_payment_intent_id: input.paymentIntentId,
      reponses_id: input.reponsesId,
      langue: input.locale,
    })
    .eq("id", existing.id)
    .select("id")
    .single();

  if (updateError) {
    throw new Error(`Erreur mise a jour commande: ${updateError.message}`);
  }

  return { id: updated.id, alreadyProcessed: false };
}

async function ensureOeuvrePlaceholder(
  supabase: SupabaseServiceClient,
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

async function handleRefundedCharge(charge: Stripe.Charge) {
  const fullyRefunded = charge.refunded || charge.amount_refunded >= charge.amount;
  const paymentIntentId = getStripeObjectId(charge.payment_intent);

  if (!fullyRefunded || !paymentIntentId) {
    return NextResponse.json(
      { received: true, refunded: fullyRefunded, paymentIntentId: paymentIntentId ?? null },
      { status: 202 },
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("commandes")
    .update({ statut: "remboursee" })
    .eq("stripe_payment_intent_id", paymentIntentId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Erreur remboursement commande: ${error.message}`);
  }

  return NextResponse.json(
    { received: true, refunded: true, commandeId: data?.id ?? null },
    { status: 202 },
  );
}

async function findCurrentParcoursId(
  supabase: SupabaseServiceClient,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("reponses_parcours")
    .select("id")
    .eq("user_id", userId)
    .eq("session_id", userId)
    .maybeSingle();

  return data?.id ?? null;
}

async function upsertReponsesFromMetadata(
  supabase: SupabaseServiceClient,
  userId: string,
  stripeSessionId: string,
  metadata: Stripe.Metadata,
  locale: Locale,
): Promise<boolean> {
  const reponsesRaw = metadata.reponses;
  if (!reponsesRaw) return false;

  try {
    const reponses = JSON.parse(reponsesRaw) as Record<string, unknown>;
    const complete = countCompletedAnswers(reponses) === 10;
    await supabase.from("reponses_parcours").upsert(
      {
        user_id: userId,
        session_id: `stripe_${stripeSessionId}`,
        reponses: reponses as Json,
        langue: locale,
        termine: complete,
      },
      { onConflict: "user_id, session_id" },
    );
    return complete;
  } catch {
    // Les metadata Stripe peuvent être tronquées, la sauvegarde checkout reste la source fiable.
    return false;
  }
}

async function hasCompleteParcours(
  supabase: SupabaseServiceClient,
  reponsesId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("reponses_parcours")
    .select("reponses, termine")
    .eq("id", reponsesId)
    .maybeSingle();

  if (error || !data?.termine) return false;
  return countCompletedAnswers(data.reponses as Record<string, unknown>) === 10;
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

function toLocale(value: string | undefined): Locale {
  return value === "en" ? "en" : "fr";
}

function getStripeObjectId(value: string | { id?: string } | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
