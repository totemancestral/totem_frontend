import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { GET } from "../app/api/totem/eligibility/route";
import { totemConflictMessage } from "../lib/totem-eligibility";
const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("../lib/supabase/server", () => ({ authenticateRequest: auth }));
vi.mock("../lib/env", () => ({ getServerEnv: () => ({ TOTEM_BACKEND_URL: "https://backend.example.invalid" }) }));
beforeEach(() => { vi.clearAllMocks(); auth.mockResolvedValue({ userId: "owner" }); });
afterEach(() => vi.unstubAllGlobals());
const request = () => new Request("http://localhost/api/totem/eligibility", { headers: { Authorization: "Bearer test" } });

describe("Totem eligibility", () => {
  it("requires authentication before contacting the backend", async () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    auth.mockResolvedValue(NextResponse.json({ error: "unauthorized" }, { status: 401 }));
    expect((await GET(request())).status).toBe(401); expect(fetch).not.toHaveBeenCalled();
  });
  it.each([true, false])("returns the authenticated eligibility %s without caching", async allowed => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ allowed })); vi.stubGlobal("fetch", fetch);
    const response = await GET(request());
    expect(await response.json()).toEqual({ allowed }); expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(fetch).toHaveBeenCalledWith("https://backend.example.invalid/checkout/eligibility", expect.objectContaining({ headers: { Authorization: "Bearer test" }, cache: "no-store" }));
  });
  it.each([Response.json({}), Response.json({ allowed: true }, { status: 500 })])("fails closed for unavailable or malformed eligibility", async response => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
    expect((await GET(request())).status).toBe(503);
  });
  it("localizes existing Totems and paid orders without exposing unknown errors", () => {
    expect(totemConflictMessage("totem_already_exists", "fr")).toContain("déjà son Totem");
    expect(totemConflictMessage("totem_already_exists", "en")).toContain("already has its Totem");
    expect(totemConflictMessage("totem_order_in_progress", "fr")).toContain("sans repayer");
    expect(totemConflictMessage("totem_order_in_progress", "en")).toContain("without paying again");
    expect(totemConflictMessage("internal database details", "fr")).toBeNull();
  });
});
