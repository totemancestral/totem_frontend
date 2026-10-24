import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { forwardRetryResponse } from "@/lib/server/response-limits";

const linksSchema = z.object({
  sessionId: z.string(),
  image_url: z.string().url().nullable(), audio_url: z.string().url().nullable(),
  pdf_url: z.string().url().nullable(), certificate_url: z.string().url().nullable(),
});
export type AssetLinks = z.infer<typeof linksSchema>;

/** Le backend garde la clé de signature et revérifie le propriétaire de chaque commande. */
export async function readAssetLinks(request: Request, sessionIds: string[]): Promise<Map<string, AssetLinks> | NextResponse> {
  const unique = [...new Set(sessionIds.filter(Boolean))];
  const result = new Map<string, AssetLinks>();
  if (!unique.length) return result;
  const { TOTEM_BACKEND_URL } = getServerEnv();
  if (!TOTEM_BACKEND_URL) return NextResponse.json({ error: "artwork_assets_unavailable" }, { status: 503 });
  try {
    // Un seul appel par lot plutôt qu'un appel par miniature.
    for (let i = 0; i < unique.length; i += 100) {
      const batch = unique.slice(i, i + 100);
      const response = await fetch(`${TOTEM_BACKEND_URL.replace(/\/$/, "")}/orders/asset-links`, {
        method: "POST", cache: "no-store",
        headers: { Authorization: request.headers.get("authorization") ?? "", "Content-Type": "application/json" },
        body: JSON.stringify({ sessionIds: batch }),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(10_000)]),
      });
      if (!response.ok) {
        const limited = forwardRetryResponse(response);
        if (limited) return limited;
        return NextResponse.json({ error: "artwork_assets_unavailable" }, { status: response.status === 401 ? 401 : 503 });
      }
      const parsed = z.array(linksSchema).safeParse(await response.json());
      if (!parsed.success) return NextResponse.json({ error: "artwork_assets_invalid" }, { status: 502 });
      for (const links of parsed.data) if (batch.includes(links.sessionId)) result.set(links.sessionId, links);
    }
    return result;
  } catch {
    return NextResponse.json({ error: "artwork_assets_unavailable" }, { status: 503 });
  }
}
