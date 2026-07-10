import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe manquante" }, { status: 400 });
  }

  const env = getServerEnv();
  if (!env.TOTEM_BACKEND_URL) {
    return NextResponse.json(
      { error: "TOTEM_BACKEND_URL non configuré" },
      { status: 503 },
    );
  }

  const body = await request.text();
  const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
  const contentType = request.headers.get("content-type") ?? "application/json";

  try {
    const response = await fetch(`${backendUrl}/webhooks/stripe`, {
      method: "POST",
      headers: {
        "content-type": contentType,
        "stripe-signature": signature,
      },
      body,
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.ok ? 202 : response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de proxy webhook";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
