import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { forwardRetryResponse } from "@/lib/server/response-limits";
import { ADULT_OFFERS, JUNIOR_AMOUNT_CENTS, JUNIOR_COMMANDE_OFFRE, toCommandeOffre } from "@/lib/offers";
import type { Json } from "@/lib/supabase/types";
import { adultIndicators, toAdultBackendAnswers } from "@/lib/adult-answers";
import { internalError } from "@/lib/api-error";
import { adultDraftSchema, hasAdultAnswersThrough, PAYMENT_AFTER_QUESTION } from "@/lib/adult-flow";
import { readAdultDraft, readAdultPayment } from "@/lib/server/adult-parcours";

const checkoutSchema = z.object({
  offre: z.enum(["origine", "ancestral", "famille", "junior"]),
  answers: z.unknown(),
  locale: z.enum(["fr", "en"]),
  parcoursId: z.uuid().optional(),
});

const juniorAnswerSchema = z.object({ choice: z.enum(["A", "B", "C", "D"]) });
const juniorAnswersSchema = z.object({
  "1": juniorAnswerSchema,
  "2": juniorAnswerSchema,
  "3": juniorAnswerSchema,
  "4": juniorAnswerSchema,
  "5": juniorAnswerSchema,
});

// Même limite que le backend (4000 caractères/réponse) : appliquée ici aussi
// pour ne pas laisser stocker un texte libre géant dans reponses_parcours
// avant même que la requête n'atteigne le backend.
const adultAnswersSchema = adultDraftSchema;

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth instanceof NextResponse) return auth;

    const rateLimitResponse = await rateLimit(request, 10, 60_000, "checkout");
    if (rateLimitResponse) return rateLimitResponse;

    const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête de paiement invalide" }, { status: 422 });
    }

    if (parsed.data.offre === "junior") {
      const answers = juniorAnswersSchema.safeParse(parsed.data.answers);
      if (!answers.success) {
        return NextResponse.json({ error: "Réponses invalides" }, { status: 422 });
      }
      return await handleJuniorCheckout(request, { answers: answers.data, locale: parsed.data.locale }, auth);
    }

    const answers = adultAnswersSchema.safeParse(parsed.data.answers);
    if (!answers.success || !parsed.data.parcoursId || !hasAdultAnswersThrough(answers.data, PAYMENT_AFTER_QUESTION)) {
      return NextResponse.json({ error: "Réponses invalides" }, { status: 422 });
    }
    return await handleCheckout(
      request,
      { offre: parsed.data.offre, answers: answers.data, locale: parsed.data.locale, parcoursId: parsed.data.parcoursId },
      auth,
    );
  } catch (err) {
    return internalError("checkout.POST", err);
  }
}

async function handleCheckout(
  request: Request,
  data: { offre: "origine" | "ancestral" | "famille"; answers: Record<string, unknown>; locale: "fr" | "en"; parcoursId: string },
  auth: { userId: string; email: string },
) {
  const env = getServerEnv();
  const config = ADULT_OFFERS[data.offre];
  const origin = (env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const supabase = createServiceClient();

  const draft = await readAdultDraft(auth.userId, data.parcoursId);
  if (!draft || draft.termine) return NextResponse.json({ error: "parcours_not_found" }, { status: 409 });
  if (draft.command?.stripe_session_id) {
    const payment = await readAdultPayment(request, draft.command.stripe_session_id);
    if (payment instanceof NextResponse) return payment;
    if (payment.paid) return NextResponse.json({ error: "already_paid", sessionId: draft.command.stripe_session_id }, { status: 409 });
  }
  // Le checkout ne reçoit que les quatre premières réponses : le webhook
  // ne peut donc pas déclencher prématurément la génération.
  data.answers = Object.fromEntries(Object.entries(data.answers).filter(([key]) => Number(key) <= PAYMENT_AFTER_QUESTION));

  // Nom et prénom : l'œuvre porte un numéro de série et doit pouvoir être
  // rattachée à une personne identifiée (déclarés à l'inscription).
  const profileResult = await supabase
    .from("profiles")
    .select("prenom, nom, sexe")
    .eq("id", auth.userId)
    .maybeSingle();
  const profile =
    (profileResult.data as { prenom?: string; nom?: string; sexe?: string | null } | null) ?? null;
  const prenom = profile?.prenom ?? "";
  const nomComplet = [prenom, profile?.nom ?? ""].map((part) => part.trim()).filter(Boolean).join(" ");

  const backendAnswers = withGender(toAdultBackendAnswers(data.answers), profile?.sexe ?? null);
  const { data: parcours, error: parcoursError } = await supabase
    .from("reponses_parcours")
    .update({
        reponses: data.answers as unknown as Json,
        termine: false,
        langue: data.locale,
      })
    .eq("id", draft.id).eq("user_id", auth.userId).eq("termine", false)
    .select("id")
    .single();

  if (parcoursError) {
    return internalError("checkout.handleCheckout.reponses_parcours", parcoursError);
  }

  const reserved = await reservePendingCommande(supabase, {
    userId: auth.userId,
    reponsesId: parcours.id,
    offre: toCommandeOffre(data.offre),
    amountCents: config.amountCents,
    locale: data.locale,
  });

  if ("error" in reserved) {
    return internalError("checkout.reservePendingCommande", reserved.error);
  }
  const commande = reserved.commande;

  if (!env.TOTEM_BACKEND_URL) {
    return NextResponse.json(
      { error: "Le moteur de paiement n'est pas disponible. Réessaie dans un instant." },
      { status: 503 },
    );
  }

  return callBackendCheckout(request, env.TOTEM_BACKEND_URL, {
    offer: data.offre,
    externalCommandId: commande.id,
    answers: backendAnswers,
    locale: data.locale,
    questionnaireVersion: "griot-v2",
    indicators: adultIndicators(data.answers),
    customerName: nomComplet || prenom || undefined,
    successUrl: `${origin}/${data.locale}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/${data.locale}/paiement?offre=${data.offre}&parcours=${draft.id}&checkout=cancelled`,
  }, commande.id);
}

async function handleJuniorCheckout(
  request: Request,
  data: { answers: z.infer<typeof juniorAnswersSchema>; locale: "fr" | "en" },
  auth: { userId: string; email: string },
) {
  const env = getServerEnv();
  const origin = (env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const supabase = createServiceClient();

  const profileResult = await supabase
    .from("profiles")
    .select("prenom")
    .eq("id", auth.userId)
    .maybeSingle();
  const firstName = (profileResult.data as { prenom?: string } | null)?.prenom ?? "";

  // Pas de parcours adulte associé : la commande Junior n'a pas de réponses
  // stockées dans reponses_parcours (les réponses voyagent directement vers
  // le backend, qui les mirrore dans oeuvres.metadata une fois révélées).
  const reserved = await reservePendingCommande(supabase, {
    userId: auth.userId,
    reponsesId: null,
    offre: JUNIOR_COMMANDE_OFFRE,
    amountCents: JUNIOR_AMOUNT_CENTS,
    locale: data.locale,
  });

  if ("error" in reserved) {
    return internalError("checkout.reservePendingCommande", reserved.error);
  }
  const commande = reserved.commande;

  if (!env.TOTEM_BACKEND_URL) {
    return NextResponse.json(
      { error: "Le moteur de paiement n'est pas disponible. Réessaie dans un instant." },
      { status: 503 },
    );
  }

  return callBackendCheckout(request, env.TOTEM_BACKEND_URL, {
    offer: "junior",
    externalCommandId: commande.id,
    firstName: firstName || undefined,
    answers: data.answers,
    locale: data.locale,
    successUrl: `${origin}/${data.locale}/confirmation-junior?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/${data.locale}/paiement-junior?checkout=cancelled`,
  }, commande.id);
}

async function callBackendCheckout(
  request: Request,
  backendUrlRaw: string,
  body: Record<string, unknown>,
  commandeId: string,
) {
  const backendUrl = backendUrlRaw.replace(/\/$/, "");

  try {
    const backendResponse = await fetch(`${backendUrl}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") ?? "",
      },
      body: JSON.stringify(body),
    });

    const limited = forwardRetryResponse(backendResponse);
    if (limited) return limited;
    const backendPayload = (await backendResponse.json().catch(() => null)) as {
      id?: string;
      url?: string | null;
      message?: string | string[];
      code?: string;
    } | null;

    if (backendResponse.ok && backendPayload?.url) {
      return NextResponse.json({
        checkoutUrl: backendPayload.url,
        checkoutSessionId: backendPayload.id,
        commandeId,
      });
    }

    const conflict = backendPayload?.code;
    if (backendResponse.status === 409 && ["totem_already_exists", "totem_order_in_progress", "totem_checkout_in_progress"].includes(conflict ?? "")) {
      return NextResponse.json({ code: conflict, error: conflict }, { status: 409 });
    }
    console.error(`[checkout] Backend checkout failed (${backendResponse.status})`, backendPayload);
    return NextResponse.json(
      {
        error:
          "Le paiement est temporairement indisponible. Aucun débit n'a été effectué. Réessaie dans un instant.",
      },
      { status: backendResponse.status >= 400 ? backendResponse.status : 502 },
    );
  } catch (err) {
    console.error("[checkout] Backend fetch failed:", err);
    return NextResponse.json(
      {
        error:
          "Le moteur de paiement est injoignable. Aucun débit n'a été effectué. Réessaie dans un instant.",
      },
      { status: 503 },
    );
  }
}

/**
 * Reprend une commande non payée de la même offre et du même parcours.
 * Une autre création, ou une commande Junior, garde ses propres réponses.
 */
async function reservePendingCommande(
  supabase: ReturnType<typeof createServiceClient>,
  input: {
    userId: string;
    reponsesId: string | null;
    offre: ReturnType<typeof toCommandeOffre> | typeof JUNIOR_COMMANDE_OFFRE;
    amountCents: number;
    locale: "fr" | "en";
  },
): Promise<{ commande: { id: string } } | { error: string }> {
  const fields = {
    reponses_id: input.reponsesId,
    offre: input.offre,
    montant_cents: input.amountCents,
    devise: "EUR",
    langue: input.locale,
  };

  let pendingQuery = supabase
    .from("commandes")
    .select("id")
    .eq("user_id", input.userId)
    .eq("statut", "en_attente_paiement")
    .eq("offre", input.offre);
  pendingQuery = input.reponsesId === null ? pendingQuery.is("reponses_id", null) : pendingQuery.eq("reponses_id", input.reponsesId);
  const { data: existing, error: pendingError } = await pendingQuery.order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pendingError) return { error: pendingError.message };

  if (existing?.id) {
    const { error } = await supabase.from("commandes").update(fields).eq("id", existing.id);
    if (error) return { error: error.message };
    return { commande: { id: existing.id } };
  }

  const { data: created, error } = await supabase
    .from("commandes")
    .insert({ user_id: input.userId, statut: "en_attente_paiement", ...fields })
    .select("id")
    .single();

  if (error || !created) return { error: error?.message ?? "commande_creation_failed" };
  return { commande: { id: created.id } };
}

/** Le sexe déclaré voyage comme réponse dédiée : le backend le lit sous
 *  l'identifiant « sexe » et n'en tient pas compte dans le scoring. */
function withGender(
  answers: { questionId: string; answer: string }[],
  sexe: unknown,
): { questionId: string; answer: string }[] {
  const value = typeof sexe === "string" ? sexe.trim().toLowerCase() : "";
  if (value !== "homme" && value !== "femme") return answers;
  return [...answers, { questionId: "sexe", answer: value }];
}
