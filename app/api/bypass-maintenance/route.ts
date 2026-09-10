import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Pose le cookie qui laisse passer le mode maintenance (voir proxy.ts).
 * Usage : visiter /api/bypass-maintenance?key=<MAINTENANCE_BYPASS_SECRET>.
 * Limite basse : freine le bruteforce du secret même si celui-ci est déjà
 * un aléa de 48 caractères hexadécimaux.
 */
export async function GET(request: Request) {
  const rateLimitResponse = await rateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const key = new URL(request.url).searchParams.get("key");
  const secret = process.env.MAINTENANCE_BYPASS_SECRET;

  if (!secret || key !== secret) {
    return NextResponse.json({ error: "Clé invalide" }, { status: 403 });
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("totem_bypass", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
