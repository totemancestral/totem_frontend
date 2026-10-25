import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/env";

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;
  const backend = getServerEnv().TOTEM_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "eligibility_unavailable" }, { status: 503 });
  try {
    const response = await fetch(`${backend.replace(/\/$/, "")}/checkout/eligibility`, {
      headers: { Authorization: request.headers.get("authorization") ?? "" },
      cache: "no-store", signal: AbortSignal.any([request.signal, AbortSignal.timeout(10000)]),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || typeof result?.allowed !== "boolean") return NextResponse.json({ error: "eligibility_unavailable" }, { status: 503 });
    return NextResponse.json({ allowed: result.allowed }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "eligibility_unavailable" }, { status: 503 }); }
}
