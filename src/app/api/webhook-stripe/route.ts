import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
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

  if (env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET) {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" });
    try {
      stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
    }
  }

  return NextResponse.json({ received: true, mode: "local-test" }, { status: 202 });
}
