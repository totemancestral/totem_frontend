import { NextResponse } from "next/server";
import { relayConsultation } from "@/lib/server/consultations";
export async function GET(request: Request) {
  const before = new URL(request.url).searchParams.get("before");
  if (before && !/^\d{4}-\d{2}-\d{2}$/.test(before)) return NextResponse.json({ error: "invalid_cursor" }, { status: 422 });
  return relayConsultation(request, `historique${before ? `?before=${encodeURIComponent(before)}` : ""}`);
}
