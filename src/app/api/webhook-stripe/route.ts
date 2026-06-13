import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/server-auth";

const OFFER_MAP: Record<string, "essentiel" | "signature" | "heritage"> = {
  origine: "essentiel",
  ancestral: "signature",
  famille: "heritage",
};

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe manquante" }, { status: 400 });
  }

  const env = getServerEnv();

  // Forward to backend orchestrator if configured
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

  // Handle inline when backend is not deployed
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

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type }, { status: 202 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, status: session.payment_status }, { status: 202 });
  }

  const metadata = session.metadata ?? {};
  const userId = metadata.userId;
  const email = metadata.email ?? session.customer_details?.email ?? "";
  const offre = OFFER_MAP[metadata.offre] ?? "essentiel";
  const locale = metadata.locale ?? "fr";
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!userId) {
    return NextResponse.json({ error: "userId manquant dans les metadata" }, { status: 422 });
  }

  try {
    const supabase = createServiceClient();

    // Create commande
    const { data: commande, error: commandeError } = await supabase
      .from("commandes")
      .insert({
        user_id: userId,
        offre,
        statut: "paye",
        montant_cents: session.amount_total ?? 0,
        devise: session.currency?.toUpperCase() ?? "EUR",
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId ?? null,
        langue: locale,
      })
      .select()
      .single();

    if (commandeError) {
      throw new Error(`Erreur creation commande: ${commandeError.message}`);
    }

    // Create oeuvre placeholder
    const { error: oeuvreError } = await supabase.from("oeuvres").insert({
      user_id: userId,
      commande_id: commande.id,
      statut: "en_cours",
    });

    if (oeuvreError) {
      throw new Error(`Erreur creation oeuvre: ${oeuvreError.message}`);
    }

    // Try to trigger pipeline
    try {
      await fetch(`${new URL(request.url).origin}/api/generate-coffret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commandeId: commande.id }),
      });
    } catch {
      // Pipeline pas encore disponible -- la commande est sauvegardee
    }

    return NextResponse.json({ received: true, commandeId: commande.id }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
