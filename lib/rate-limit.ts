import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";

const counts = new Map<string, { count: number; resetAt: number }>();
// INCR + expiry + TTL are one atomic operation, across all instances.
const script = `local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return {n, redis.call('PTTL', KEYS[1])}`;

function limited(status: 429 | 503, seconds: number) {
  return NextResponse.json({
    error: status === 429 ? "Trop de requêtes. Réessaie dans quelques instants." : "Service temporairement indisponible. Réessaie dans un instant.",
    retryAfter: seconds,
  }, { status, headers: { "Retry-After": String(seconds), "Cache-Control": "private, no-store" } });
}

export async function rateLimit(request: Request, maxRequests = 20, windowMs = 60_000, scope = "default"): Promise<NextResponse | null> {
  const production = process.env.NODE_ENV === "production";
  // Only trust an IP header overwritten by the hosting reverse proxy.
  const header = process.env.RATE_LIMIT_IP_HEADER || (process.env.VERCEL ? "x-vercel-forwarded-for" : production ? "" : "x-forwarded-for");
  const ip = (header ? request.headers.get(header)?.split(",")[0]?.trim() : undefined) || "unknown";
  const url = process.env.RATE_LIMIT_REDIS_REST_URL;
  const token = process.env.RATE_LIMIT_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      if (new URL(url).protocol !== "https:") return limited(503, 30);
      const key = `totem:rate-limit:v1:${scope}:${maxRequests}:${windowMs}:${createHmac("sha256", token).update(ip).digest("hex")}`;
      const response = await fetch(url.replace(/\/$/, ""), {
        method: "POST", cache: "no-store", signal: AbortSignal.timeout(3000),
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(["EVAL", script, "1", key, String(windowMs)]),
      });
      if (!response.ok) return limited(503, 30);
      const data = await response.json();
      const result = data?.result;
      if (data?.error || !Array.isArray(result) || result.length !== 2 ||
          !Number.isSafeInteger(result[0]) || result[0] < 1 || !Number.isSafeInteger(result[1]) || result[1] < 0) return limited(503, 30);
      return result[0] > maxRequests ? limited(429, Math.max(1, Math.ceil(result[1] / 1000))) : null;
    } catch { return limited(503, 30); }
  }
  // Production must never silently fall back to per-process protection.
  if (production || url || token) return limited(503, 30);
  const key = `${scope}:${maxRequests}:${windowMs}:${ip}`;
  const now = Date.now();
  for (const [id, entry] of counts) if (entry.resetAt <= now) counts.delete(id);
  let entry = counts.get(key);
  if (!entry) {
    if (counts.size >= 10_000) return limited(503, 30);
    entry = { count: 0, resetAt: now + windowMs };
    counts.set(key, entry);
  }
  entry.count++;
  return entry.count > maxRequests ? limited(429, Math.max(1, Math.ceil((entry.resetAt - now) / 1000))) : null;
}
