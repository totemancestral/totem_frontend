import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { POST as single } from "../app/api/admin/relancer/route";
import { POST as batch } from "../app/api/admin/relancer-tout/route";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), env: vi.fn(), audit: vi.fn(), from: vi.fn(), order: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ requireAdmin: mocks.auth, createServiceClient: () => ({ from: mocks.from }) }));
vi.mock("@/lib/env", () => ({ getServerEnv: mocks.env }));
vi.mock("@/lib/admin-audit", () => ({ logAdminAction: mocks.audit }));
const id = "00000000-0000-4000-8000-000000000001";
const request = (body: unknown = { commandeId: id }) => new Request("https://site.invalid/api/admin/relancer", {
  method: "POST", headers: { Authorization: "Bearer admin-session", "Content-Type": "application/json" }, body: JSON.stringify(body),
});
const fetchMock = vi.fn();
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("fetch", fetchMock);
  mocks.auth.mockResolvedValue({ userId: "admin", email: "admin@example.invalid" });
  mocks.env.mockReturnValue({ TOTEM_BACKEND_URL: "https://backend.invalid/" });
  mocks.audit.mockResolvedValue(undefined);
  mocks.order.mockResolvedValue({ data: [{ id, statut: "erreur" }], error: null });
  // Only reads are available. Any reset/delete attempt would fail these tests.
  mocks.from.mockImplementation((table: string) => {
    if (table !== "commandes") throw Error("Business writes or error deletion are forbidden");
    return { select: () => ({ in: () => ({ order: mocks.order }) }) };
  });
  fetchMock.mockResolvedValue(Response.json({ orderId: "order", queued: true }));
});
afterEach(() => vi.unstubAllGlobals());

describe("safe administration retry relays", () => {
  it.each([single, batch])("requires admin authorization before doing anything", async handler => {
    mocks.auth.mockResolvedValue(NextResponse.json({ error: "mfa_required" }, { status: 403 }));
    expect((await handler(request())).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled(); expect(mocks.from).not.toHaveBeenCalled();
  });
  it.each([single, batch])("fails closed without a configured backend", async handler => {
    mocks.env.mockReturnValue({});
    expect((await handler(request())).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled(); expect(mocks.from).not.toHaveBeenCalled();
  });
  it.each([null, {}, { commandeId: [] }, { commandeId: "invalid" }])("rejects malformed input %s", async body => {
    expect((await single(request(body))).status).toBe(400); expect(fetchMock).not.toHaveBeenCalled();
  });
  it("preserves all business records and passes the actual session to the backend", async () => {
    const response = await single(request());
    expect(await response.json()).toMatchObject({ ok: true, outcome: "accepted" });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith("https://backend.invalid/orders/retry", expect.objectContaining({
      body: JSON.stringify({ externalCommandId: id }), headers: expect.objectContaining({ Authorization: "Bearer admin-session" }), signal: expect.any(AbortSignal),
    }));
    expect(mocks.audit).toHaveBeenCalledWith(expect.anything(), expect.anything(), "relancer", expect.objectContaining({ commandeId: id, status: "ok" }));
  });
  it.each([[false, undefined, "already_done"], [true, "already_running", "already_running"]])("reports a no-op correctly", async (queued, outcome, expected) => {
    fetchMock.mockResolvedValue(Response.json({ orderId: "order", queued, outcome }));
    expect(await (await single(request())).json()).toMatchObject({ ok: true, outcome: expected });
  });
  it("does not expose the backend's internal error", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "private database detail" }, { status: 400 }));
    const response = await single(request()); expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("private database detail");
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("rejects a successful HTTP response without an acknowledged order", async () => {
    fetchMock.mockResolvedValue(Response.json({}));
    expect((await single(request())).status).toBe(502);
  });
  it("does not mistake a network failure for success", async () => {
    fetchMock.mockRejectedValue(new Error("timeout"));
    expect((await single(request())).status).toBe(502); expect(mocks.from).not.toHaveBeenCalled();
  });
  it("retains accepted batch results and stops after a quota refusal", async () => {
    mocks.order.mockResolvedValue({ data: [{ id }, { id: "second" }, { id: "third" }], error: null });
    fetchMock.mockResolvedValueOnce(Response.json({ orderId: "first", queued: true }))
      .mockResolvedValueOnce(Response.json({ message: "private" }, { status: 429, headers: { "Retry-After": "37" } }));
    const response = await batch(request()); expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("37");
    expect(await response.json()).toMatchObject({ ok: false, total: 3, accepted: 1, failed: 1, notAttempted: 1, results: [
      { commandeId: id, status: "ok" }, { commandeId: "second", status: "ko" }, { commandeId: "third", status: "not_attempted" },
    ] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("does not count already completed or running orders as new accepted retries", async () => {
    mocks.order.mockResolvedValue({ data: [{ id }, { id: "second" }], error: null });
    fetchMock.mockResolvedValueOnce(Response.json({ orderId: "first", queued: false }))
      .mockResolvedValueOnce(Response.json({ orderId: "second", queued: true, outcome: "already_running" }));
    expect(await (await batch(request())).json()).toMatchObject({ ok: true, accepted: 0, alreadyDone: 1, alreadyRunning: 1 });
  });
});
