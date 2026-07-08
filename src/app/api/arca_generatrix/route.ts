import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { startPipeline } from "@/lib/services/pipeline";

const generateSchema = z.object({
  commandeId: z.string().uuid(),
});

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const parsed = generateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload de generation invalide" }, { status: 422 });
  }

  try {
    startPipeline(parsed.data.commandeId);

    return NextResponse.json({
      commandeId: parsed.data.commandeId,
      status: "enqueued",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json(
      { error: message, commandeId: parsed.data.commandeId },
      { status: 500 },
    );
  }
}
