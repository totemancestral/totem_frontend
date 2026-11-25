import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { GET } from "@/app/api/oeuvre/[commandeId]/totem/route";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), single: vi.fn(), eq: vi.fn(), assets: vi.fn(), render: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ authenticateRequest: mocks.auth, createServiceClient: () => ({ from: () => {
  const query = { select: () => query, eq: (...args: unknown[]) => { mocks.eq(...args); return query; }, maybeSingle: mocks.single };
  return query;
} }) }));
vi.mock("@/lib/server/asset-links", () => ({ readAssetLinks: mocks.assets }));
vi.mock("@/lib/server/totem-download", () => ({ createTotemDownload: mocks.render }));
const id = "12345678-1234-4234-8234-123456789abc";
const context = { params: Promise.resolve({ commandeId: id }) };
const request = () => new Request(`https://example.invalid/api/oeuvre/${id}/totem`);
const fetchMock = vi.fn();
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("fetch", fetchMock);
  mocks.auth.mockResolvedValue({ userId: "owner" });
  mocks.single.mockResolvedValue({ data: { stripe_session_id: "cs_owned", oeuvres: [{ nom_totem: "Dayo-Pita, Des Ancêtres Debout" }] }, error: null });
  mocks.assets.mockResolvedValue(new Map([["cs_owned", { image_url: "https://assets.example.invalid/signed" }]]));
  fetchMock.mockResolvedValue(new Response(new Uint8Array([1, 2, 3])));
  mocks.render.mockResolvedValue(Buffer.from("png"));
});
afterEach(() => vi.unstubAllGlobals());
describe("private named totem download", () => {
  it("requires authentication before reading an order", async () => {
    mocks.auth.mockResolvedValue(NextResponse.json({ error: "unauthenticated" }, { status: 401 }));
    expect((await GET(request(), context)).status).toBe(401);
    expect(mocks.single).not.toHaveBeenCalled();
  });
  it("never fetches or renders another owner's artwork", async () => {
    mocks.single.mockResolvedValue({ data: null, error: null });
    expect((await GET(request(), context)).status).toBe(404);
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "owner");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mocks.render).not.toHaveBeenCalled();
  });
  it.each(["Dayo-Pita, Des Ancêtres Debout", "DAYO LE LION DU FEU"])("serves the stored adult or Junior name: %s", async name => {
    mocks.single.mockResolvedValue({ data: { stripe_session_id: "cs_owned", oeuvres: [{ nom_totem: name }] }, error: null });
    const response = await GET(request(), context);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("content-disposition")).toContain("attachment;");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.render).toHaveBeenCalledWith(Buffer.from([1, 2, 3]), name);
  });
  it("does not fall back to stale or public image URLs", async () => {
    mocks.assets.mockResolvedValue(new Map());
    expect((await GET(request(), context)).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
