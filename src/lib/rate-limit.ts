import { NextResponse } from "next/server";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate-limit BFF. Si UPSTASH_REDIS_URL + TOKEN sont présents (même instance
 * que le backend), le compteur est partagé entre instances serverless.
 * Sinon repli in-memory : inefficace sur Vercel (une Map par isolate).
 */
export async function rateLimit(
  request: Request,
  maxRequests: number = 20,
  windowMs: number = 60_000,
): Promise<NextResponse | null> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const redisLimited = await upstashLimit(ip, maxRequests, windowMs);
  if (redisLimited !== "skip") return redisLimited;

  return memoryLimit(ip, maxRequests, windowMs);
}

async function upstashLimit(
  ip: string,
  maxRequests: number,
  windowMs: number,
): Promise<NextResponse | null | "skip"> {
  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;
  if (!url || !token) return "skip";

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const key = `totem:rl:${ip}:${windowSec}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["INCR", key]),
    });
    if (!response.ok) return "skip";
    const payload = (await response.json()) as { result?: number };
    const count = Number(payload.result ?? 0);
    if (count === 1) {
      await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["EXPIRE", key, windowSec]),
      });
    }
    if (count > maxRequests) {
      return NextResponse.json(
        { error: "Trop de requetes. Reessaye dans quelques instants." },
        { status: 429 },
      );
    }
    return null;
  } catch {
    return "skip";
  }
}

function memoryLimit(ip: string, maxRequests: number, windowMs: number): NextResponse | null {
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
