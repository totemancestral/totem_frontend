import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest, createServiceClient } from "@/lib/server-auth";

export async function GET(request: Request) {
  const env = getServerEnv();
  if (env.TOTEM_BACKEND_URL) {
    const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
    const response = await fetch(`${backendUrl}/junior/totems`, {
      headers: { authorization: request.headers.get("authorization") ?? "" },
    });

    const payload = await response.json().catch(() => null);
    return NextResponse.json(payload, { status: response.ok ? 200 : response.status || 502 });
  }

  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createServiceClient();
  const { data: oeuvres } = await supabase
    .from("oeuvres")
    .select("id, nom_totem, recit, metadata, created_at, numero_serie")
    .eq("user_id", auth.userId)
    .eq("statut", "livree")
    .not("metadata->>type", "is", null)
    .order("created_at", { ascending: false });

  if (!oeuvres) {
    return NextResponse.json([]);
  }

  const totems = oeuvres
    .filter((o) => (o.metadata as Record<string, unknown> | null)?.type === "junior")
    .map((o) => {
      const meta = (o.metadata ?? {}) as Record<string, unknown>;
      return {
        id: o.id,
        totemName: o.nom_totem || "Totem Junior",
        quality: (meta.totem as Record<string, unknown> | null)?.quality ?? "",
        phrase: o.recit || "",
        orderNumber: (meta.orderNumber as number) || 0,
        shareCount: 0,
        createdAt: o.created_at,
        scores: (meta.scores ?? {}) as Record<string, number>,
        dominant: (meta.dominant as string) || "",
        secondary: (meta.secondary as string) || "",
      };
    });

  return NextResponse.json(totems);
}
