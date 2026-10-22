import { NextResponse } from "next/server";
import { z } from "zod";
import { relayConsultation } from "@/lib/server/consultations";
const schema = z.object({ mood: z.enum(["apaise", "en_doute", "en_combat"]).optional() });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_mood" }, { status: 422 });
  return relayConsultation(request, "tirer", parsed.data);
}
