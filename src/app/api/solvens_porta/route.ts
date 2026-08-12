import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest, createServiceClient } from "@/lib/server-auth";
import { rateLimit } from "@/lib/rate-limit";
import { pagePath } from "@/lib/routes";
import { ADULT_OFFERS, toCommandeOffre } from "@/lib/offers";
import type { Json } from "@/integrations/supabase/types";

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

    const rateLimitResponse = rateLimit(request, 10, 60_000);
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
  const backendAnswers = withGender(toBackendAnswers(data.answers), profile?.sexe ?? null);
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

  if (env.TOTEM_BACKEND_URL) {
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
          customerName: nomComplet || prenom || undefined,
          successUrl: `${origin}${pagePath(
            data.locale,
            "parcours",
            `checkout=success&session_id={CHECKOUT_SESSION_ID}&commande_id=${commande.id}`,
          )}`,
          cancelUrl: `${origin}${pagePath(data.locale, "parcours", "checkout=cancelled")}`,
        }),
      });

      if (backendResponse.ok) {
        const backendPayload = (await backendResponse.json().catch(() => null)) as {
          id?: string;
          url?: string | null;
        } | null;

        if (backendPayload?.url) {
          return NextResponse.json({
            checkoutUrl: backendPayload.url,
            checkoutSessionId: backendPayload.id,
            commandeId: commande.id,
          });
        }
      }
      
      // La commande reste en attente : le paiement Stripe local prend le
      // relais sur la même ligne, sans en créer une seconde.
      console.error(
        `[solvens_porta] Backend returned status ${backendResponse.status}, falling back to local Stripe.`,
      );
    } catch (err) {
      console.error("[solvens_porta] Backend fetch failed, falling back to local Stripe:", err);
    }
  }

  if (!env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Le paiement n'est pas configuré. Contacte l'équipe technique." },
      { status: 503 },
    );
  }

  try {
    await supabase
      .from("reponses_parcours")
      .update({ termine: backendAnswers.length >= 10 })
      .eq("id", parcours.id);
  } catch {
    // Non bloquant — le parcours continue meme si la sauvegarde echoue
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

  try {
    const metadata = buildStripeMetadata(data, auth.userId, auth.email, prenom, commande.id);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: config.amountCents,
            product_data: { name: config.label },
          },
        },
      ],
      automatic_tax: { enabled: true },
      customer_email: auth.email,
      metadata,
      payment_intent_data: { metadata },
      success_url: `${origin}${pagePath(
        data.locale,
        "parcours",
        `checkout=success&session_id={CHECKOUT_SESSION_ID}&commande_id=${commande.id}`,
      )}`,
      cancel_url: `${origin}${pagePath(data.locale, "parcours", "checkout=cancelled")}`,
    });

    await supabase
      .from("commandes")
      .update({ stripe_session_id: session.id })
      .eq("id", commande.id);

    return NextResponse.json({
      checkoutUrl: session.url,
      checkoutSessionId: session.id,
      commandeId: commande.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de paiement";
    return NextResponse.json({ error: message }, { status: 500 });
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

function buildStripeMetadata(
  data: z.infer<typeof checkoutSchema>,
  userId: string,
  email: string,
  prenom: string,
  commandeId: string,
) {
  const metadata: Record<string, string> = {
    userId,
    email,
    prenom,
    commandeId,
    locale: data.locale,
    offre: data.offre,
    reponses: trimMetadataValue(JSON.stringify(data.answers)),
  };

  for (let index = 1; index <= 10; index += 1) {
    const val = trimMetadataValue(formatAnswer(data.answers[String(index)]));
    if (val) {
      metadata[`q${index}`] = val;
    }
  }

  return metadata;
}

function formatAnswer(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const answer = value as { choice?: string; field?: string; skipped?: boolean };
  if (answer.skipped) return "skipped";
  return [answer.choice, answer.field?.trim()].filter(Boolean).join(" | ");
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

function toBackendAnswers(answers: Record<string, unknown>) {
  return Array.from({ length: 10 }, (_, index) => {
    const questionId = `q${index + 1}`;
    const answer = formatAnswer(answers[String(index + 1)]).trim();
    return answer ? { questionId, answer } : null;
  }).filter((answer): answer is { questionId: string; answer: string } => Boolean(answer));
}

function trimMetadataValue(value: string) {
  return value.length > 480 ? `${value.slice(0, 477)}...` : value;
}
