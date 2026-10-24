import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { GET as artwork } from "../app/api/oeuvre/[commandeId]/route";
import { GET as commands } from "../app/api/commandes/route";
import { readAssetLinks } from "../lib/server/asset-links";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), single: vi.fn(), list: vi.fn(), eq: vi.fn(), env: vi.fn() }));
vi.mock("../lib/supabase/server", () => ({
  authenticateRequest: mocks.auth,
  createServiceClient: () => ({ from: () => {
    const query = { select: () => query, eq: (...args: unknown[]) => { mocks.eq(...args); return query; },
      maybeSingle: mocks.single, order: mocks.list };
    return query;
  } }),
}));
vi.mock("../lib/env", () => ({ getServerEnv: mocks.env }));
const fetchMock = vi.fn();
const request = () => new Request("https://frontend.example.invalid/api/oeuvre/owned", { headers: { Authorization: "Bearer verified-user" } });
const params = { params: Promise.resolve({ commandeId: "owned" }) };
const links = { sessionId: "cs_owned", image_url: "https://assets.example.invalid/fresh-image",
  audio_url: "https://assets.example.invalid/fresh-audio", pdf_url: "https://assets.example.invalid/fresh-pdf",
  certificate_url: "https://assets.example.invalid/fresh-certificate" };
const oldWork = { nom_totem: "Name", image_url: "https://assets.example.invalid/expired",
  audio_url: null, pdf_url: null, certificate_url: null, statut: "livree" };
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("fetch", fetchMock);
  mocks.auth.mockResolvedValue({ userId: "owner", email: "owner@example.invalid" });
  mocks.env.mockReturnValue({ TOTEM_BACKEND_URL: "https://backend.example.invalid/" });
  mocks.single.mockResolvedValue({ data: { id: "owned", offre: "ancestral", statut: "livree",
    stripe_session_id: "cs_owned", oeuvres: [oldWork] }, error: null });
  mocks.list.mockResolvedValue({ data: [{ id: "owned", offre: "ancestral", statut: "livree",
    stripe_session_id: "cs_owned", reponses_parcours: null, oeuvres: [oldWork] }], error: null });
  fetchMock.mockResolvedValue(Response.json([links]));
});
afterEach(() => vi.unstubAllGlobals());

describe("owned artwork link renewal", () => {
  it("returns fresh links for all files without persisting them", async () => {
    const response = await artwork(request(), params);
    const payload = await response.json();
    expect(payload.oeuvre).toMatchObject({ image_url: links.image_url, audio_url: links.audio_url,
      pdf_url: links.pdf_url, certificate_url: links.certificate_url });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.eq).toHaveBeenCalledWith("id", "owned");
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "owner");
    expect(fetchMock).toHaveBeenCalledWith("https://backend.example.invalid/orders/asset-links", expect.objectContaining({
      method: "POST", cache: "no-store", headers: expect.objectContaining({ Authorization: "Bearer verified-user" }),
      body: JSON.stringify({ sessionIds: ["cs_owned"] }),
    }));
  });
  it("returns 404 before renewing when the command is not owned or does not exist", async () => {
    mocks.single.mockResolvedValue({ data: null, error: null });
    expect((await artwork(request(), params)).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("does not renew unauthenticated requests", async () => {
    mocks.auth.mockResolvedValue(NextResponse.json({ error: "unauthenticated" }, { status: 401 }));
    expect((await artwork(request(), params)).status).toBe(401);
    expect((await commands(request())).status).toBe(401);
    expect(mocks.single).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("keeps the pending-work response without contacting the signer", async () => {
    mocks.single.mockResolvedValue({ data: { id: "owned", offre: "origine", statut: "paye", oeuvres: [] }, error: null });
    const response = await artwork(request(), params);
    expect(response.status).toBe(200);
    expect((await response.json()).oeuvre).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("renews thumbnails in the command list in one batch", async () => {
    const response = await commands(request());
    expect((await response.json())[0].oeuvres[0].image_url).toBe(links.image_url);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "owner");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it("does not reuse expired links when the backend is unavailable", async () => {
    fetchMock.mockResolvedValue(Response.json({ error: "internal" }, { status: 500 }));
    const response = await artwork(request(), params);
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("expired");
  });
  it("does not substitute assets from an unexpected session", async () => {
    fetchMock.mockResolvedValue(Response.json([{ ...links, sessionId: "cs_other" }]));
    expect((await artwork(request(), params)).status).toBe(503);
  });
  it("handles network failures without leaking server details", async () => {
    fetchMock.mockRejectedValue(new Error("sensitive network configuration"));
    const response = await artwork(request(), params);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "artwork_assets_unavailable" });
  });
  it("batches large lists and forwards authentication on every batch", async () => {
    fetchMock.mockResolvedValue(Response.json([]));
    await readAssetLinks(request(), Array.from({ length: 101 }, (_, i) => `cs_${i}`));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).sessionIds).toHaveLength(100);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).sessionIds).toHaveLength(1);
  });
});
