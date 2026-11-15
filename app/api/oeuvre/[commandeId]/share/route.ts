import { NextResponse } from "next/server";
import { authenticateRequest, createServiceClient } from "@/lib/supabase/server";
import { internalError } from "@/lib/api-error";
import { readAssetLinks } from "@/lib/server/asset-links";
import { createShareImages } from "@/lib/server/share-images";
import { shareExcerpt, shareInputSchema, shareSlug, shareTokenSchema } from "@/lib/totem-sharing";

type Context = { params: Promise<{ commandeId: string }> };
const headers = { "Cache-Control": "private, no-store" };
const fields = "token, display_name, slug";

export async function GET(request: Request, { params }: Context) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;
  const { commandeId } = await params;
  if (!shareTokenSchema.safeParse(commandeId).success) return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  const { data, error } = await createServiceClient().from("totem_shares")
    .select(fields).eq("commande_id", commandeId).eq("user_id", auth.userId).maybeSingle();
  if (error) return internalError("share.GET", error);
  return NextResponse.json({ share: data }, { headers });
}

export async function POST(request: Request, { params }: Context) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;
  const { commandeId } = await params;
  if (!shareTokenSchema.safeParse(commandeId).success) return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  const input = shareInputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  const db = createServiceClient();
  const { data: order, error } = await db.from("commandes")
    .select("stripe_session_id, langue, oeuvres(nom_totem, recit)")
    .eq("id", commandeId).eq("user_id", auth.userId).maybeSingle();
  if (error) return internalError("share.owner", error);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const { data: existing, error: existingError } = await db.from("totem_shares")
    .select(fields).eq("commande_id", commandeId).eq("user_id", auth.userId).maybeSingle();
  if (existingError) return internalError("share.existing", existingError);
  if (existing) return NextResponse.json({ share: existing }, { headers });
  const artwork = Array.isArray(order.oeuvres) ? order.oeuvres[0] : order.oeuvres;
  if (!artwork?.nom_totem || !artwork.recit || !order.stripe_session_id) {
    return NextResponse.json({ error: "Artwork not ready" }, { status: 409 });
  }
  const assets = await readAssetLinks(request, [order.stripe_session_id]);
  if (assets instanceof NextResponse) return assets;
  const imageUrl = assets.get(order.stripe_session_id)?.image_url;
  if (!imageUrl) return NextResponse.json({ error: "Image unavailable" }, { status: 503 });
  try {
    // This URL is obtained from the authenticated backend, never from user input.
    const response = await fetch(imageUrl, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (!response.ok || !response.body) throw new Error("Image unavailable");
    const chunks: Uint8Array[] = [];
    let size = 0;
    const reader = response.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 15_000_000) throw new Error("Image too large");
        chunks.push(value);
      }
    } finally {
      await reader.cancel();
    }
    const images = await createShareImages(Buffer.concat(chunks), input.data.displayName, order.langue);
    const { data, error: insertError } = await db.from("totem_shares").insert({
      commande_id: commandeId, user_id: auth.userId,
      display_name: input.data.displayName, slug: shareSlug(input.data.displayName),
      totem_name: artwork.nom_totem, excerpt: shareExcerpt(artwork.recit),
      preview_jpeg: images.preview, social_jpeg: images.social,
    }).select(fields).single();
    if (insertError?.code === "23505") {
      // Concurrent clicks reuse the share that won the unique order constraint.
      const { data: winner, error: winnerError } = await db.from("totem_shares")
        .select(fields).eq("commande_id", commandeId).eq("user_id", auth.userId).single();
      if (winnerError) return internalError("share.concurrent", winnerError);
      return NextResponse.json({ share: winner }, { headers });
    }
    if (insertError) return internalError("share.POST", insertError);
    return NextResponse.json({ share: data }, { status: 201, headers });
  } catch (error) {
    return internalError("share.preview", error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) return auth;
  const { commandeId } = await params;
  if (!shareTokenSchema.safeParse(commandeId).success) return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  const { error } = await createServiceClient().from("totem_shares").delete()
    .eq("commande_id", commandeId).eq("user_id", auth.userId);
  if (error) return internalError("share.DELETE", error);
  return NextResponse.json({ share: null }, { headers });
}
