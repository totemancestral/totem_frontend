import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  prenom: z.string().min(1),
  email: z.string().email(),
  sujet: z.string().min(1),
  message: z.string().min(10),
  consentement: z.boolean().optional(),
});

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact payload" }, { status: 422 });
  }

  return NextResponse.json({
    success: true,
    note: "Brevo contact email will be connected in module M5",
  });
}
