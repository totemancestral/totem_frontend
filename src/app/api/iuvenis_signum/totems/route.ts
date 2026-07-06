import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

export async function GET(request: Request) {
  try {
    const env = getServerEnv();
    if (!env.TOTEM_BACKEND_URL) {
      return NextResponse.json([]);
    }

    const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
    const response = await fetch(`${backendUrl}/junior/totems`, {
      headers: {
        Authorization: request.headers.get("authorization") ?? "",
      },
    });

    const payload = await response.json().catch(() => null);
    return NextResponse.json(payload, { status: response.ok ? 200 : response.status || 502 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
