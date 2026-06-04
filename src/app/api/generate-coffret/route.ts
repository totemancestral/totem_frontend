import { NextResponse } from "next/server";
import { z } from "zod";

const generateSchema = z.object({
  commandeId: z.string().uuid(),
});

export async function POST(request: Request) {
  const parsed = generateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid generation payload" }, { status: 422 });
  }

  return NextResponse.json(
    {
      error: "Pipeline generation will be connected in module M4",
      commandeId: parsed.data.commandeId,
    },
    { status: 501 },
  );
}
