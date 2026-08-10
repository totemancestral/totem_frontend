import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

export async function POST(request: Request) {
  const env = getServerEnv();
  if (!env.TOTEM_BACKEND_URL) {
    return NextResponse.json({ error: "Backend non configuré" }, { status: 503 });
  }

  const { id } = await request.json().catch(() => ({}));
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
  const response = await fetch(`${backendUrl}/junior/share/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: {
      Authorization: request.headers.get("authorization") ?? "",
    },
  });

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload, { status: response.ok ? 200 : response.status || 502 });
}
