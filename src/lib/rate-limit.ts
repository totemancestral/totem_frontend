import { NextResponse } from "next/server";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  request: Request,
  maxRequests: number = 20,
  windowMs: number = 60_000,
): NextResponse | null {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    return NextResponse.json(
      { error: "Trop de requetes. Reessaye dans quelques instants." },
      { status: 429 },
    );
  }

  return null;
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [ip, entry] of requestCounts) {
        if (now > entry.resetAt) {
          requestCounts.delete(ip);
        }
      }
    },
    5 * 60 * 1000,
  ).unref();
}
