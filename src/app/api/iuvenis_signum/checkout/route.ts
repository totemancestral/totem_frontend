import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest } from "@/lib/server-auth";
import { rateLimit } from "@/lib/rate-limit";
import { pagePath } from "@/lib/routes";

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth instanceof NextResponse) return auth;

    const rateLimitResponse = rateLimit(request, 10, 60_000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Requete invalide" }, { status: 422 });
    }

    const env = getServerEnv();

    const typed = body as { locale?: string };
    const locale = typed.locale === "en" ? "en" : "fr";

    const origin = (
      request.headers.get("origin") ||
      env.NEXT_PUBLIC_SITE_URL ||
      env.SITE_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");

    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_JUNIOR) {
      return NextResponse.json(
        { error: "Le paiement junior n'est pas configure" },
        { status: 503 },
      );
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: env.STRIPE_PRICE_JUNIOR, quantity: 1 }],
      customer_email: auth.email,
      success_url: `${origin}${pagePath(locale, "junior", "checkout=success&session_id={CHECKOUT_SESSION_ID}")}`,
      cancel_url: `${origin}${pagePath(locale, "junior", "checkout=cancelled")}`,
      metadata: {
        userId: auth.userId,
        email: auth.email,
        offer: "junior",
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      checkoutSessionId: session.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
