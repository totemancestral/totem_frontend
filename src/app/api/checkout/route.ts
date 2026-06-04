import { NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  offre: z.enum(["origine", "ancestral", "famille"]),
  answers: z.record(z.string(), z.unknown()),
  locale: z.enum(["fr", "en"]),
});

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 422 });
  }

  return NextResponse.json(
    { error: "Stripe Checkout will be connected in module M3", data: parsed.data },
    { status: 501 },
  );
}
