import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { retryNotice } from "@/lib/retry-after";
import { BYPASS_COOKIE, BYPASS_TTL, createMaintenanceToken, matchesMaintenanceKey } from "@/lib/maintenance-access";

const headers = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};
function form(status = 200, error = "") {
  return new NextResponse(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Accès équipe — TOTEM</title>
<style>body{margin:0;padding:24px;background:#0d0d1a;color:#fefcf0;font:1rem/1.6 system-ui}main{max-width:28rem;margin:10vh auto}label,input,button{display:block}input,button{box-sizing:border-box;width:100%;padding:12px;font:inherit;margin:12px 0}input:focus-visible,button:focus-visible{outline:3px solid #c9a84c;outline-offset:3px}</style></head><body><main><h1>Accès équipe</h1><p>Saisissez la clé de maintenance. Cet accès est valable huit heures et ne remplace pas votre connexion à TOTEM.</p>
${error ? `<p role="alert">${error}</p>` : ""}<form method="post" action="/api/bypass-maintenance"><label for="key">Clé de maintenance</label><input id="key" name="key" type="password" required maxlength="512" autocomplete="off"><button type="submit">Accéder au site</button></form></main></body></html>`, {
    status, headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
  });
}
export function GET(request: Request) {
  if (new URL(request.url).search) {
    return NextResponse.redirect(new URL("/api/bypass-maintenance", request.url), { status: 303, headers });
  }
  return form();
}
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return form(403, "Origine refusée.");
  const limited = await rateLimit(request, 10, 60_000, "maintenance.bypass");
  if (limited) {
    const response = form(limited.status, retryNotice(limited, "fr") ?? "Service temporairement indisponible.");
    response.headers.set("Retry-After", limited.headers.get("Retry-After") || "30");
    return response;
  }
  if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return form(415, "Formulaire invalide.");
  const reader = request.body?.getReader();
  if (!reader) return form(400, "Formulaire invalide.");
  let body = "";
  let size = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) { await reader.cancel(); return form(413, "Formulaire trop volumineux."); }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
  } catch { return form(400, "Formulaire invalide."); }
  const key = new URLSearchParams(body).get("key");
  const secret = process.env.MAINTENANCE_BYPASS_SECRET;
  if (!secret || !key || key.length > 512 || !matchesMaintenanceKey(key, secret)) return form(403, "Clé invalide.");
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303, headers });
  response.cookies.set(BYPASS_COOKIE, createMaintenanceToken(secret), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: BYPASS_TTL, path: "/",
  });
  return response;
}
