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
      return NextResponse.json({ error: "Requete de paiement invalide" }, { status: 422 });
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
  const priceId = env[config.priceEnv];

  const origin = (
    request.headers.get("origin") ||
    env.NEXT_PUBLIC_SITE_URL ||
    env.SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
  const supabase = createServiceClient();

  // Récupérer le prénom de l'utilisateur
  const profileResult = await supabase
    .from("profiles")
    .select("prenom")
    .eq("id", auth.userId)
    .maybeSingle();
  const prenom = (profileResult?.data as { prenom?: string } | null)?.prenom ?? "";

  const backendAnswers = toBackendAnswers(data.answers);
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
    return NextResponse.json({ error: "Reponses insuffisantes" }, { status: 422 });
  }

  if (env.TOTEM_BACKEND_URL) {
    const { data: commande, error: commandeError } = await supabase
      .from("commandes")
      .insert({
        user_id: auth.userId,
        reponses_id: parcours.id,
        offre: toCommandeOffre(data.offre),
        statut: "en_attente_paiement",
        montant_cents: config.amountCents,
        devise: "EUR",
        langue: data.locale,
      })
      .select("id")
      .single();

    if (commandeError) {
      return NextResponse.json({ error: commandeError.message }, { status: 500 });
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
          customerName: prenom || undefined,
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
      
      console.error(`[solvens_porta] Backend returned status ${backendResponse.status}, falling back to local Stripe.`);
      await supabase.from("commandes").delete().eq("id", commande.id);
    } catch (err) {
      console.error("[solvens_porta] Backend fetch failed, falling back to local Stripe:", err);
      await supabase.from("commandes").delete().eq("id", commande.id);
    }
  }

  if (!env.STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.json(
      { error: "Le paiement n'est pas configure. Contacte l'equipe technique." },
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
    const { data: commande, error: commandeError } = await supabase
      .from("commandes")
      .insert({
        user_id: auth.userId,
        reponses_id: parcours.id,
        offre: toCommandeOffre(data.offre),
        statut: "en_attente_paiement",
        montant_cents: config.amountCents,
        devise: "EUR",
        langue: data.locale,
      })
      .select("id")
      .single();

    if (commandeError) {
      return NextResponse.json({ error: commandeError.message }, { status: 500 });
    }

    const metadata = buildStripeMetadata(data, auth.userId, auth.email, prenom, commande.id);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
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
