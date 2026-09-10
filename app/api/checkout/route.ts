import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { ADULT_OFFERS, JUNIOR_AMOUNT_CENTS, JUNIOR_COMMANDE_OFFRE, toCommandeOffre } from "@/lib/offers";
import type { Json } from "@/lib/supabase/types";
import { adultIndicators, toAdultBackendAnswers } from "@/lib/adult-answers";
import { internalError } from "@/lib/api-error";

const checkoutSchema = z.object({
  offre: z.enum(["origine", "ancestral", "famille", "junior"]),
  answers: z.unknown(),
  locale: z.enum(["fr", "en"]),
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
const adultAnswerStateSchema = z.object({
  choice: z.enum(["A", "B", "C", "D"]).optional(),
  field: z.string().max(4000).optional(),
  skipped: z.boolean().optional(),
});
const adultAnswersSchema = z
  .record(z.string().max(10), adultAnswerStateSchema)
  .refine((obj) => Object.keys(obj).length <= 20, { message: "Trop de réponses" });

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth instanceof NextResponse) return auth;

    const rateLimitResponse = await rateLimit(request, 10, 60_000);
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
    if (!answers.success) {
      return NextResponse.json({ error: "Réponses invalides" }, { status: 422 });
    }
    return await handleCheckout(
      request,
      { offre: parsed.data.offre, answers: answers.data, locale: parsed.data.locale },
      auth,
    );
  } catch (err) {
    return internalError("checkout.POST", err);
  }
}

async function handleCheckout(
  request: Request,
  data: { offre: "origine" | "ancestral" | "famille"; answers: Record<string, unknown>; locale: "fr" | "en" },
  auth: { userId: string; email: string },
) {
  const env = getServerEnv();
  const config = ADULT_OFFERS[data.offre];
  const origin = (env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const supabase = createServiceClient();

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
  if (backendAnswers.length < 4) {
    return NextResponse.json({ error: "Réponses insuffisantes" }, { status: 422 });
  }

  const { data: parcours, error: parcoursError } = await supabase
    .from("reponses_parcours")
    .upsert(
      {
        user_id: auth.userId,
        session_id: auth.userId,
        reponses: data.answers as unknown as Json,
        termine: true,
        langue: data.locale,
      },
      { onConflict: "user_id, session_id" },
    )
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
    questionnaireVersion: "griot-v1",
    indicators: adultIndicators(data.answers),
    customerName: nomComplet || prenom || undefined,
    successUrl: `${origin}/${data.locale}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/${data.locale}/paiement?offre=${data.offre}&checkout=cancelled`,
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

    const backendPayload = (await backendResponse.json().catch(() => null)) as {
      id?: string;
      url?: string | null;
      message?: string | string[];
    } | null;

    if (backendResponse.ok && backendPayload?.url) {
      return NextResponse.json({
        checkoutUrl: backendPayload.url,
        checkoutSessionId: backendPayload.id,
        commandeId,
      });
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
 * Renvoie la commande en attente de paiement du visiteur, en la créant si
 * elle n'existe pas encore : une seule commande reste ouverte par visiteur,
 * reprise avec l'offre choisie en dernier (parcours repris, offre changée).
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

  const { data: existing } = await supabase
    .from("commandes")
    .select("id")
    .eq("user_id", input.userId)
    .eq("statut", "en_attente_paiement")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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
