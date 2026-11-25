import { NextResponse } from "next/server";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { readAssetLinks } from "@/lib/server/asset-links";
import { createTotemDownload } from "@/lib/server/totem-download";
import { internalError } from "@/lib/api-error";
import { shareTokenSchema } from "@/lib/totem-sharing";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request, { params }: { params: Promise<{ commandeId: string }> }) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;
  const { commandeId } = await params;
  if (!shareTokenSchema.safeParse(commandeId).success) return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  const { data: order, error } = await createServiceClient().from("commandes")
    .select("stripe_session_id, oeuvres(nom_totem)")
    .eq("id", commandeId).eq("user_id", auth.userId).maybeSingle();
  if (error) return internalError("totem-download.owner", error);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const work = Array.isArray(order.oeuvres) ? order.oeuvres[0] : order.oeuvres;
  if (!work?.nom_totem || !order.stripe_session_id) return NextResponse.json({ error: "Artwork not ready" }, { status: 409 });
  const assets = await readAssetLinks(request, [order.stripe_session_id]);
  if (assets instanceof NextResponse) return assets;
  const imageUrl = assets.get(order.stripe_session_id)?.image_url;
  if (!imageUrl) return NextResponse.json({ error: "Image unavailable" }, { status: 503 });
  try {
    // The authenticated backend supplies this signed URL, never the client.
    const response = await fetch(imageUrl, { cache: "no-store", redirect: "error",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]) });
    if (!response.ok || !response.body) throw new Error("Image unavailable");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 15_000_000) throw new Error("Image too large");
        chunks.push(value);
      }
    } finally { await reader.cancel(); }
    const png = await createTotemDownload(Buffer.concat(chunks), work.nom_totem);
    return new Response(new Uint8Array(png), { headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="TOTEM-ANCESTRAL-Mon-Totem.png"',
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) { return internalError("totem-download.render", error); }
}
