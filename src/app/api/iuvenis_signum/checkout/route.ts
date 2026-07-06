import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest } from "@/lib/server-auth";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const juniorCheckoutSchema = z.object({
  firstName: z.string().trim().max(40).optional(),
  locale: z.enum(["fr", "en"]).optional(),
  answers: z.record(
    z.string(),
    z.object({
      choice: z.enum(["A", "B", "C", "D"]),
    }),
  ),
});

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const rateLimitResponse = rateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = juniorCheckoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requete junior invalide" }, { status: 422 });
  }

  const env = getServerEnv();
  if (!env.TOTEM_BACKEND_URL) {
    return NextResponse.json({ error: "Backend non configure" }, { status: 503 });
  }

  const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
  const response = await fetch(`${backendUrl}/junior/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
    body: JSON.stringify(parsed.data),
  });

  const payload = (await response.json().catch(() => null)) as {
    id?: string;
    url?: string | null;
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
