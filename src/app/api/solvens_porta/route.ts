import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest, createServiceClient } from "@/lib/server-auth";
import { rateLimit } from "@/lib/rate-limit";
import { pagePath } from "@/lib/routes";
import { ADULT_OFFERS, toCommandeOffre } from "@/lib/offers";
import type { Json } from "@/integrations/supabase/types";
import { adultIndicators, toAdultBackendAnswers } from "@/lib/adult-answers";

const checkoutSchema = z.object({
  offre: z.enum(["origine", "ancestral", "famille"]),
  answers: z.record(z.string(), z.unknown()),
  sexe: z.enum(["homme", "femme"]).nullish(),
  locale: z.enum(["fr", "en"]),
});

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

    return await handleCheckout(request, parsed.data, auth);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleCheckout(
  request: Request,
  data: z.infer<typeof checkoutSchema>,
  auth: Awaited<ReturnType<typeof authenticateRequest>> & { userId: string; email: string },
) {
  const env = getServerEnv();
  const config = ADULT_OFFERS[data.offre];

    const origin = (env.NEXT_PUBLIC_SITE_URL || env.SITE_URL || "http://localhost:3000").replace(
      /\/$/,
      "",
    );
  const supabase = createServiceClient();

  // Nom et prénom : l'œuvre porte un numéro de série et doit pouvoir être
  // rattachée à une personne identifiée.
  const profileResult = await supabase
    .from("profiles")
    .select("prenom, nom, sexe")
    .eq("id", auth.userId)
    .maybeSingle();
  const profile =
    (profileResult?.data as { prenom?: string; nom?: string; sexe?: string | null } | null) ?? null;
  const prenom = profile?.prenom ?? "";
  const nomComplet = [prenom, profile?.nom ?? ""].map((part) => part.trim()).filter(Boolean).join(" ");

  // Le sexe vient du profil, declare a l'inscription : le questionnaire ne le
  // demande plus en cours de route.
  const backendAnswers = withGender(toAdultBackendAnswers(data.answers), profile?.sexe ?? null);
  const { data: parcours, error: parcoursError } = await supabase
    .from("reponses_parcours")
    .upsert(
      {
        user_id: auth.userId,
        session_id: auth.userId,
        reponses: data.answers as unknown as Json,
        termine: backendAnswers.length >= 10,
        langue: data.locale,
      },
      { onConflict: "user_id, session_id" },
    )
    .select("id")
    .single();

  if (parcoursError) {
    return NextResponse.json({ error: parcoursError.message }, { status: 500 });
  }

  if (backendAnswers.length < 4) {
    return NextResponse.json({ error: "Réponses insuffisantes" }, { status: 422 });
  }

  // Une seule commande en attente par visiteur : reprendre un parcours ou
  // changer d'offre ne doit jamais laisser une commande inachevée derrière soi.
  const reserved = await reservePendingCommande(supabase, {
    userId: auth.userId,
    reponsesId: parcours.id,
    offre: toCommandeOffre(data.offre),
    amountCents: config.amountCents,
    locale: data.locale,
  });

  if ("error" in reserved) {
    return NextResponse.json({ error: reserved.error }, { status: 500 });
  }
  const commande = reserved.commande;

  if (!env.TOTEM_BACKEND_URL) {
    return NextResponse.json(
      { error: "Le moteur de paiement n'est pas disponible. Réessaie dans un instant." },
      { status: 503 },
    );
  }

  const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");

  try {
    const backendResponse = await fetch(`${backendUrl}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") ?? "",
      },
      body: JSON.stringify({
        userId: auth.userId,
        email: auth.email,
        offer: data.offre,
        externalCommandId: commande.id,
        answers: backendAnswers,
        locale: data.locale,
        questionnaireVersion: "griot-v2",
        indicators: adultIndicators(data.answers),
        customerName: nomComplet || prenom || undefined,
        successUrl: `${origin}${pagePath(
          data.locale,
          "parcours",
          `checkout=success&session_id={CHECKOUT_SESSION_ID}&commande_id=${commande.id}`,
        )}`,
        cancelUrl: `${origin}${pagePath(data.locale, "parcours", "checkout=cancelled")}`,
      }),
    });

    const backendPayload = (await backendResponse.json().catch(() => null)) as {
      id?: string;
      url?: string | null;
    } | null;

    if (backendResponse.ok && backendPayload?.url) {
      return NextResponse.json({
        checkoutUrl: backendPayload.url,
        checkoutSessionId: backendPayload.id,
        commandeId: commande.id,
  });
}

    console.error(
      `[solvens_porta] Backend checkout failed (${backendResponse.status})`,
      backendPayload,
    );
    return NextResponse.json(
      {
        error:
          "Le paiement est temporairement indisponible. Aucun débit n'a été effectué. Réessaie dans un instant.",
      },
      { status: backendResponse.status >= 400 ? backendResponse.status : 502 },
    );
  } catch (err) {
    console.error("[solvens_porta] Backend fetch failed:", err);
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
 * Renvoie la commande en attente de paiement du visiteur, en la creant si elle
 * n'existe pas encore.
 *
 * Sans cela, chaque passage au paiement laissait une commande inachevee : un
 * parcours repris ou une offre changee produisait deux lignes dans le tableau
 * de bord, l'une abandonnee, l'autre honoree. Une seule commande reste ouverte
 * par visiteur, et elle est reconduite avec l'offre choisie en dernier.
 */
async function reservePendingCommande(
  supabase: ReturnType<typeof createServiceClient>,
  input: {
    userId: string;
    reponsesId: string;
    offre: ReturnType<typeof toCommandeOffre>;
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

/** Le sexe declare voyage comme reponse dediee : le backend le lit sous
 *  l'identifiant « sexe » et n'en tient pas compte dans le scoring. */
function withGender(
  answers: { questionId: string; answer: string }[],
  sexe: unknown,
): { questionId: string; answer: string }[] {
  const value = typeof sexe === "string" ? sexe.trim().toLowerCase() : "";
  if (value !== "homme" && value !== "femme") return answers;
  return [...answers, { questionId: "sexe", answer: value }];
}
