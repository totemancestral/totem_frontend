import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../app/api/orders/session/[sessionId]/route";

const auth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({ authenticateRequest: auth, createServiceClient: () => ({ from: () => {
  const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: { id: "command" } }) };
  return query;
} }) }));
vi.mock("@/lib/env", () => ({ getServerEnv: () => ({ TOTEM_BACKEND_URL: "https://backend.invalid" }) }));
const fetchMock = vi.fn();
const request = () => new Request("https://site.invalid/api/orders/session/test", { headers: { Authorization: "Bearer test" } });
const params = () => ({ params: Promise.resolve({ sessionId: "test" }) });
beforeEach(() => { vi.stubGlobal("fetch", fetchMock); auth.mockResolvedValue({ userId: "owner" }); });
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("public order status errors", () => {
  it("hides an old backend's raw exception even in a successful status response", async () => {
    fetchMock.mockResolvedValue(Response.json({ id: "order", status: "error", paid: true, errorMessage: "provider private diagnostic", detail: "private stack", secretField: "private" }));
    const response = await GET(request(), params());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ status: "error", errorMessage: "generation_failed", commandeId: "command" });
    expect(JSON.stringify(body)).not.toContain("private");
  });
  it("does not relay backend exception messages on HTTP errors", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "private schema and query", detail: "private" }, { status: 403 }));
    const response = await GET(request(), params());
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "order_status_unavailable" });
  });
  it("preserves quota status and Retry-After without revealing the upstream body", async () => {
    fetchMock.mockResolvedValue(Response.json({ detail: "private" }, { status: 429, headers: { "Retry-After": "20" } }));
    const response = await GET(request(), params());
    expect(response.status).toBe(429); expect(response.headers.get("Retry-After")).toBe("20");
    expect(await response.text()).not.toContain("private");
  });
});
