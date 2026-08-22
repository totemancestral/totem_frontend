import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest, createServiceClient } from "@/lib/server-auth";

export async function GET(request: Request) {
  const env = getServerEnv();
  if (env.TOTEM_BACKEND_URL) {
    const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
    try {
      const response = await fetch(`${backendUrl}/junior/totems`, {
        headers: { authorization: request.headers.get("authorization") ?? "" },
      });

      if (response.ok) {
        const payload = await response.json().catch(() => null);
        return NextResponse.json(payload, { status: 200 });
      }
      console.error(`[totems] Backend returned status ${response.status}, falling back to Supabase.`);
    } catch (error) {
      console.error("[totems] Backend fetch failed, falling back to Supabase:", error);
    }
  }

  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = createServiceClient();
  const { data: oeuvres } = await supabase
    .from("oeuvres")
    .select("id, nom_totem, recit, metadata, created_at, numero_serie, image_url")
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
        quality: (meta.totem as Record<string, unknown> | null)?.quality ?? (meta.attribut as string) ?? "",
        phrase: o.recit || "",
        orderNumber: (meta.orderNumber as number) || 0,
        shareCount: 0,
        createdAt: o.created_at,
        scores: (meta.scores ?? {}) as Record<string, number>,
        dominant: (meta.dominant as string) || "",
        secondary: (meta.secondary as string) || "",
        imageUrl: o.image_url || ((meta.imageUrl as string) ?? undefined),
      };
    });

  return NextResponse.json(totems);
}
