import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

export const parentCookieName = (requestId: string) => `totem_parent_${requestId}`;
export const PARENT_COOKIE_PATH = "/api/junior/parent";

export async function parentBackend(action: "request" | "status" | "confirm" | "checkout", body?: unknown, authorization?: string) {
  const url = getServerEnv().TOTEM_BACKEND_URL;
  if (!url) return NextResponse.json({ code: "parent_unavailable" }, { status: 503 });
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/junior/parent/${action}`, {
      method: body === undefined ? "GET" : "POST", cache: "no-store", signal: AbortSignal.timeout(30_000),
      headers: { "Content-Type": "application/json", ...(authorization ? { Authorization: authorization } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const payload = await response.json().catch(() => null);
    const headers: Record<string, string> = { "Cache-Control": "private, no-store" };
    const retry = response.headers.get("Retry-After") ?? payload?.retryAfter;
    if (retry) headers["Retry-After"] = String(retry);
    if (!response.ok) {
      const code = payload?.code ?? payload?.message;
      const allowed = ["parent_link_expired", "parent_confirmation_required", "parent_email_recently_sent", "parent_email_unavailable", "parent_request_invalid", "totem_already_exists", "totem_order_in_progress", "totem_checkout_in_progress"];
      return NextResponse.json({ code: allowed.includes(code) ? code : "parent_unavailable" }, { status: response.status, headers });
    }
    if (!payload) return NextResponse.json({ code: "parent_unavailable" }, { status: 502, headers });
    return NextResponse.json(payload, { headers });
  } catch {
    return NextResponse.json({ code: "parent_unavailable" }, { status: 503 });
  }
}
