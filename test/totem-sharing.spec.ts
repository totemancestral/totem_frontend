import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { createShareImages } from "@/lib/server/share-images";
import { shareExcerpt, shareInputSchema, sharePath, shareSlug, shareTitle } from "@/lib/totem-sharing";
import { GET, POST, DELETE } from "@/app/api/oeuvre/[commandeId]/share/route";
import { GET as imageGET } from "@/app/[lang]/totem/[slug]/[token]/image/route";

const { auth, from, assets } = vi.hoisted(() => ({ auth: vi.fn(), from: vi.fn(), assets: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ authenticateRequest: auth, createServiceClient: () => ({ from }) }));
vi.mock("@/lib/server/asset-links", () => ({ readAssetLinks: assets }));

const id = "b924c31f-cc7c-4ba2-ab5c-f92f2846ce3a";
const context = { params: Promise.resolve({ commandeId: id }) };
const imageContext = { params: Promise.resolve({ token: id }) };
const request = (method = "GET", displayName = "Nadia") => new Request("https://site.invalid/api/share", {
  method, ...(method === "POST" ? { body: JSON.stringify({ displayName }) } : {}),
});
function query(data: unknown, error: unknown = null) {
  const result = { data, error };
  const builder = {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(), insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result), maybeSingle: vi.fn().mockResolvedValue(result),
    then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
  };
  return builder;
}
beforeEach(() => { vi.clearAllMocks(); auth.mockResolvedValue({ userId: "owner" }); });
afterEach(() => vi.unstubAllGlobals());

describe("personal public sharing", () => {
  it("accepts Unicode names, rejects markup and creates readable personalized links", () => {
    expect(shareInputSchema.safeParse({ displayName: "Éloïse d’Or" }).success).toBe(true);
    expect(shareInputSchema.safeParse({ displayName: "<script>" }).success).toBe(false);
    expect(shareInputSchema.safeParse({ displayName: " " }).success).toBe(false);
    expect(shareSlug("Éloïse d’Or")).toBe("eloise-d-or");
    expect(shareSlug("你好")).toBe("totem");
    expect(sharePath("fr", "nadia", id)).toBe(`/fr/totem/nadia/${id}`);
    expect(shareTitle("Nadia", "Née dans les Braises", "fr")).toContain("Le totem de Nadia");
  });

  it("publishes only the first short excerpt from a long private story", () => {
    const excerpt = shareExcerpt(`L’ouverture\n${"Une histoire ancestrale. ".repeat(40)}\n\nPASSAGE PRIVÉ`);
    expect(excerpt.length).toBeLessThanOrEqual(280);
    expect(excerpt).not.toContain("PASSAGE PRIVÉ");
    expect(excerpt).toMatch(/…$/);
  });

  it("requires authentication for every owner operation", async () => {
    auth.mockResolvedValue(NextResponse.json({}, { status: 401 }));
    for (const handler of [GET, POST, DELETE]) expect((await handler(request(), context)).status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("checks the owner before reading original asset links", async () => {
    const order = query(null);
    from.mockReturnValue(order);
    expect((await POST(request("POST"), context)).status).toBe(404);
    expect(order.eq).toHaveBeenCalledWith("user_id", "owner");
    expect(assets).not.toHaveBeenCalled();
  });

  it("returns only the owner’s sharing settings without caching", async () => {
    const settings = { token: id, slug: "nadia", display_name: "Nadia" };
    const q = query(settings); from.mockReturnValue(q);
    const response = await GET(request(), context);
    expect(await response.json()).toEqual({ share: settings });
    expect(q.eq).toHaveBeenCalledWith("user_id", "owner");
    expect(q.select).toHaveBeenCalledWith("token, display_name, slug");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("reuses an existing share on retry", async () => {
    from.mockReturnValueOnce(query({ stripe_session_id: "session", oeuvres: [] }))
      .mockReturnValueOnce(query({ token: id, display_name: "Nadia", slug: "nadia" }));
    const response = await POST(request("POST"), context);
    expect(response.status).toBe(200);
    expect(assets).not.toHaveBeenCalled();
  });

  it("creates only sanitized snapshots and never returns the original asset URL", async () => {
    const source = await sharp({ create: { width: 64, height: 64, channels: 3, background: "#30251e" } }).png().toBuffer();
    const insertion = query({ token: id, slug: "nadia", display_name: "Nadia" });
    from.mockReturnValueOnce(query({ stripe_session_id: "session", langue: "fr", oeuvres: [{ nom_totem: "Les Braises", recit: `${"Notre histoire. ".repeat(50)}\n\nTexte privé` }] }))
      .mockReturnValueOnce(query(null)).mockReturnValueOnce(insertion);
    assets.mockResolvedValue(new Map([["session", { image_url: "https://private.invalid/original" }]]));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(source)));
    const response = await POST(request("POST"), context);
    expect(response.status).toBe(201);
    const inserted = insertion.insert.mock.calls[0][0];
    expect(inserted).toMatchObject({ commande_id: id, user_id: "owner", display_name: "Nadia" });
    expect(inserted.excerpt.length).toBeLessThanOrEqual(280);
    expect(inserted.excerpt).not.toContain("Texte privé");
    expect(Object.keys(inserted)).not.toContain("image_url");
    expect(JSON.stringify(await response.json())).not.toContain("private.invalid");
    expect(inserted.preview_jpeg).toBeTruthy();
  });

  it("revokes only the authenticated owner’s share", async () => {
    const q = query(null); from.mockReturnValue(q);
    expect((await DELETE(request("DELETE"), context)).status).toBe(200);
    expect(q.delete).toHaveBeenCalled();
    expect(q.eq).toHaveBeenCalledWith("user_id", "owner");
    expect(q.eq).toHaveBeenCalledWith("commande_id", id);
  });

  it("serves a watermarked JPEG and refuses revoked or invalid tokens", async () => {
    from.mockReturnValue(query({ preview_jpeg: Buffer.from("preview").toString("base64"), social_jpeg: Buffer.from("social").toString("base64") }));
    const response = await imageGET(new Request("https://site.invalid/image?format=social"), imageContext);
    expect(await response.text()).toBe("social");
    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    from.mockReturnValue(query(null));
    expect((await imageGET(request(), imageContext)).status).toBe(404);
    from.mockClear();
    expect((await imageGET(request(), { params: Promise.resolve({ token: "invalid" }) })).status).toBe(404);
    expect(from).not.toHaveBeenCalled();
  });

  it("bakes a name-specific watermark into reduced JPEGs and a 1200×630 social card", async () => {
    const source = await sharp({ create: { width: 1200, height: 1800, channels: 3, background: "#30251e" } }).png().toBuffer();
    const first = await createShareImages(source, "Nadia");
    const second = await createShareImages(source, "Éloïse");
    const preview = await sharp(Buffer.from(first.preview, "base64")).metadata();
    const social = await sharp(Buffer.from(first.social, "base64")).metadata();
    expect(preview.width).toBeLessThanOrEqual(800);
    expect(preview.height).toBeLessThanOrEqual(900);
    expect(social).toMatchObject({ width: 1200, height: 630, format: "jpeg" });
    expect(first.preview).not.toBe(second.preview);
    expect(Buffer.from(first.social, "base64").length).toBeLessThan(300_000);
  });
});
