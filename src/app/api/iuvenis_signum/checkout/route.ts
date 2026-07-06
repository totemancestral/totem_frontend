import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest } from "@/lib/server-auth";
import { rateLimit } from "@/lib/rate-limit";
import { pagePath } from "@/lib/routes";

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const rateLimitResponse = rateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requete invalide" }, { status: 422 });
  }

  let env;
  try {
    env = getServerEnv();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Configuration serveur invalide";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!env.TOTEM_BACKEND_URL) {
    return NextResponse.json({ error: "Backend non configure" }, { status: 503 });
  }

  const typed = body as { locale?: string };
  const locale = typed.locale === "en" ? "en" : "fr";

  const origin = (
    request.headers.get("origin") ||
    env.NEXT_PUBLIC_SITE_URL ||
    env.SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
  let response;
  try {
    response = await fetch(`${backendUrl}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") ?? "",
      },
      body: JSON.stringify({
        offer: "junior",
        ...(body as Record<string, unknown>),
        successUrl: `${origin}${pagePath(locale, "junior", "checkout=success&session_id={CHECKOUT_SESSION_ID}")}`,
        cancelUrl: `${origin}${pagePath(locale, "junior", "checkout=cancelled")}`,
      }),
    });
  } catch {
    return NextResponse.json({ error: "Backend indisponible" }, { status: 502 });
  }

  const payload = (await response.json().catch(() => null)) as {
    id?: string;
    url?: string | null;
    reveal?: Record<string, unknown>;
    message?: string;
    error?: string;
  } | null;

  if (!response.ok || !payload?.url) {
    return NextResponse.json(
      { error: payload?.message || payload?.error || "checkout_failed" },
      { status: response.ok ? 502 : response.status },
    );
  }

  return NextResponse.json({
    checkoutUrl: payload.url,
    checkoutSessionId: payload.id,
    reveal: payload.reveal,
  });
}
