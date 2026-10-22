import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/supabase/server";
import { getServerEnv } from "@/lib/env";
import { internalError } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";

export async function relayConsultation(request: Request, path: string, body?: unknown) {
  try {
    const auth = await authenticateRequest(request);
    if (auth instanceof NextResponse) return auth;
    if (body !== undefined) {
      const limited = await rateLimit(request, 10, 60_000, "cauris.draw");
      if (limited) return limited;
    }
    const url = getServerEnv().TOTEM_BACKEND_URL;
    if (!url) return NextResponse.json({ error: "consultation_unavailable" }, { status: 503 });
    const response = await fetch(`${url.replace(/\/$/, "")}/consultations/${path}`, {
      method: body === undefined ? "GET" : "POST", cache: "no-store",
      headers: { Authorization: request.headers.get("authorization") ?? "", "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload) {
      const code = typeof payload?.message === "string" ? payload.message : payload?.code;
      return NextResponse.json({ error: ["oeuvre_required", "serie_indisponible"].includes(code) ? code : "consultation_unavailable" }, { status: response.ok ? 502 : response.status });
    }
    return NextResponse.json(payload, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return internalError("consultations.relay", error, 502); }
}
