import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest, createServiceClient } from "@/lib/server-auth";
import { rateLimit } from "@/lib/rate-limit";
import type { Json } from "@/integrations/supabase/types";

const checkoutSchema = z.object({
  offre: z.enum(["origine", "ancestral", "famille"]),
  answers: z.record(z.string(), z.unknown()),
  locale: z.enum(["fr", "en"]),
});

const offerConfig = {
  origine: { priceEnv: "STRIPE_PRICE_ORIGINE", amountCents: 4900 },
  ancestral: { priceEnv: "STRIPE_PRICE_ANCESTRAL", amountCents: 8900 },
  famille: { priceEnv: "STRIPE_PRICE_FAMILLE", amountCents: 19900 },
} as const;

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const rateLimitResponse = rateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requete de paiement invalide" }, { status: 422 });
  }

  const env = getServerEnv();
  const config = offerConfig[parsed.data.offre];
  const priceId = env[config.priceEnv];

  if (!env.STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.json(
      { error: "Le paiement n'est pas configure. Contacte l'equipe technique." },
      { status: 503 },
    );
  }

  const origin =
    request.headers.get("origin") || env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = createServiceClient();

  // Récupérer le prénom de l'utilisateur
  const profileResult = await supabase
    .from("profiles")
    .select("prenom")
    .eq("id", auth.userId)
    .maybeSingle();
  const prenom = (profileResult?.data as { prenom?: string } | null)?.prenom ?? "";

  const metadata = buildStripeMetadata(parsed.data, auth.userId, auth.email, prenom);

  try {
    await supabase.from("reponses_parcours").upsert(
      {
        user_id: auth.userId,
        session_id: auth.userId,
        reponses: parsed.data.answers as unknown as Json,
        termine: true,
        langue: parsed.data.locale,
      },
      { onConflict: "user_id, session_id" },
    );
  } catch {
    // Non bloquant — le parcours continue meme si la sauvegarde echoue
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      automatic_tax: { enabled: true },
      customer_email: auth.email,
      metadata,
      payment_intent_data: { metadata },
      success_url: `${origin}/${parsed.data.locale}/via_sapientiae?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${parsed.data.locale}/via_sapientiae?checkout=cancelled`,
    });

    return NextResponse.json({ checkoutUrl: session.url, checkoutSessionId: session.id });
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
) {
  const metadata: Record<string, string> = {
    userId,
    email,
    prenom,
    locale: data.locale,
    offre: data.offre,
    reponses: trimMetadataValue(JSON.stringify(data.answers)),
  };

  for (let index = 1; index <= 10; index += 1) {
    metadata[`q${index}`] = trimMetadataValue(formatAnswer(data.answers[String(index)]));
  }

  return metadata;
}

function formatAnswer(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const answer = value as { choice?: string; field?: string; skipped?: boolean };
  if (answer.skipped) return "skipped";
  return [answer.choice, answer.field?.trim()].filter(Boolean).join(" | ");
}

function trimMetadataValue(value: string) {
  return value.length > 480 ? `${value.slice(0, 477)}...` : value;
}
