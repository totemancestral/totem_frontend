import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";

const checkoutSchema = z.object({
  offre: z.enum(["origine", "ancestral", "famille"]),
  answers: z.record(z.string(), z.unknown()),
  locale: z.enum(["fr", "en"]),
  userId: z.string().min(1).optional(),
  email: z.string().email().optional(),
  prenom: z.string().min(1).optional(),
});

const offerConfig = {
  origine: { priceEnv: "STRIPE_PRICE_ORIGINE", amountCents: 4900 },
  ancestral: { priceEnv: "STRIPE_PRICE_ANCESTRAL", amountCents: 8900 },
  famille: { priceEnv: "STRIPE_PRICE_FAMILLE", amountCents: 19900 },
} as const;

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 422 });
  }

  const env = getServerEnv();
  const config = offerConfig[parsed.data.offre];
  const priceId = env[config.priceEnv];
  const origin =
    request.headers.get("origin") || env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const metadata = buildStripeMetadata(parsed.data);

  if (!env.STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.json({
      mode: "local-test",
      checkoutSessionId: `local_checkout_${Date.now()}`,
      amountCents: config.amountCents,
      currency: "EUR",
      metadata,
    });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    automatic_tax: { enabled: true },
    customer_email: parsed.data.email,
    metadata,
    payment_intent_data: { metadata },
    success_url: `${origin}/${parsed.data.locale}/parcours?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${parsed.data.locale}/parcours?checkout=cancelled`,
  });

  return NextResponse.json({ checkoutUrl: session.url, checkoutSessionId: session.id });
}

function buildStripeMetadata(data: z.infer<typeof checkoutSchema>) {
  const metadata: Record<string, string> = {
    userId: data.userId ?? data.email ?? "local-user",
    locale: data.locale,
    offre: data.offre,
  };

  if (data.email) metadata.email = data.email;
  if (data.prenom) metadata.prenom = trimMetadataValue(data.prenom);

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
