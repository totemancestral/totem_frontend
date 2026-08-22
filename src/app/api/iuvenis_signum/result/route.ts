import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { authenticateRequest } from "@/lib/server-auth";
import { JUNIOR_TOTEMS } from "@/lib/totem-v3";

/**
 * Révélation Junior uniquement après confirmation de paiement Nest.
 * Ne calcule rien localement : le payload vient de la commande payée.
 */
export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;

  const env = getServerEnv();
  if (!env.TOTEM_BACKEND_URL) {
    return NextResponse.json({ error: "Moteur de paiement indisponible" }, { status: 503 });
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id requis" }, { status: 422 });
  }

  const backendUrl = env.TOTEM_BACKEND_URL.replace(/\/$/, "");
  try {
    const response = await fetch(
      `${backendUrl}/orders/session/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: request.headers.get("authorization") ?? "" } },
    );
    const payload = (await response.json().catch(() => null)) as {
      paid?: boolean;
      offer?: string;
      juniorPayload?: Record<string, unknown> | null;
      imageUrl?: string | null;
      status?: string;
      error?: string;
    } | null;

    if (response.status === 402 || payload?.paid === false) {
      return NextResponse.json({ error: "Paiement non confirmé" }, { status: 402 });
    }
    if (payload?.status === "error") {
      return NextResponse.json(
        { error: payload.error || "Échec de la génération du totem Junior" },
        { status: 500 },
      );
    }
    if (
      response.status === 202 ||
      (response.ok && (payload?.status === "processing" || payload?.status === "pending"))
    ) {
      return NextResponse.json({ error: "Révélation Junior en préparation" }, { status: 202 });
    }
    if (!response.ok || !payload) {
      return NextResponse.json(
        { error: payload?.error || "Commande introuvable" },
        { status: response.status >= 400 ? response.status : 502 },
      );
    }
    if (payload.offer !== "junior" || !payload.juniorPayload) {
      return NextResponse.json({ error: "Révélation Junior en préparation" }, { status: 202 });
    }

    return NextResponse.json({
      reveal: mapJuniorReveal({ ...payload.juniorPayload, imageUrl: payload.imageUrl }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de lecture";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function mapJuniorReveal(payload: Record<string, unknown>) {
  const totemId = typeof payload.totemId === "string" ? payload.totemId : "";
  const totemName = typeof payload.totemName === "string" ? payload.totemName : "";
  const catalog =
    (totemId && JUNIOR_TOTEMS[totemId as keyof typeof JUNIOR_TOTEMS]) ||
    Object.values(JUNIOR_TOTEMS).find((totem) => totem.name === totemName);
  const quality =
    (typeof payload.quality === "string" && payload.quality) || catalog?.quality || "";

  return {
    orderNumber: typeof payload.orderNumber === "number" ? payload.orderNumber : 0,
    firstName: typeof payload.firstName === "string" ? payload.firstName : "Toi",
    scores: payload.scores ?? {},
    dominant: payload.dominant ?? "",
    secondary: payload.secondary ?? "",
    totem: {
      name: totemName || catalog?.name || "Totem Junior",
      animal: catalog?.animal ?? "",
      colors: catalog?.colors ?? [],
      quality,
    },
    nomComplet: totemName || catalog?.name || "Totem Junior",
    phrase: typeof payload.phrase === "string" ? payload.phrase : "",
    attribut: quality,
    messageClan: typeof payload.phrase === "string" ? payload.phrase : "",
    share:
      payload.share && typeof payload.share === "object"
        ? payload.share
        : { caption: "", messageDefi: "" },
    imageUrl: typeof payload.imageUrl === "string" ? payload.imageUrl : undefined,
  };
}
