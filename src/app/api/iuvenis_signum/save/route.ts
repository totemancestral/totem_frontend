import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

export async function POST(request: Request) {
  const env = getServerEnv();
  if (!env.TOTEM_BACKEND_URL) {
    return NextResponse.json({ error: "Backend non configure" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corps requis" }, { status: 400 });
  }

  const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
  const response = await fetch(`${backendUrl}/junior/reveal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: request.headers.get("authorization") ?? "",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload, { status: response.ok ? 200 : response.status || 502 });
}
