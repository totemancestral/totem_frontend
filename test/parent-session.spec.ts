import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { POST as exchange } from "../app/api/junior/parent/session/route";
import { POST as action } from "../app/api/junior/parent/[action]/route";

const mocks = vi.hoisted(() => ({ relay: vi.fn(), cookie: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: async () => null }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: mocks.cookie }) }));
vi.mock("@/lib/server/parent-relay", () => ({ parentBackend: mocks.relay, parentCookieName: (id: string) => `totem_parent_${id}`, PARENT_COOKIE_PATH: "/api/junior/parent" }));
const id = "00000000-0000-4000-8000-000000000001";
const token = "a".repeat(43);
const request = (body: unknown) => new Request("https://site.invalid/api/junior/parent/session", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
beforeEach(() => { vi.clearAllMocks(); mocks.relay.mockImplementation(async () => NextResponse.json({ requestId: id, confirmed: false })); });

describe("parent session relay", () => {
  it("exchanges a valid link for a scoped HttpOnly cookie without confirming", async () => {
    const response = await exchange(request({ token }));
    expect(mocks.relay).toHaveBeenCalledWith("status", { token });
    expect(response.cookies.get(`totem_parent_${id}`)).toMatchObject({ value: token, httpOnly: true, sameSite: "lax", path: "/api/junior/parent" });
  });
  it("does not forward malformed capabilities", async () => {
    expect((await exchange(request({ token: "bad" }))).status).toBe(410);
    expect(mocks.relay).not.toHaveBeenCalled();
  });
  it("requires the request-specific cookie before confirming or paying", async () => {
    mocks.cookie.mockReturnValue(undefined);
    expect((await action(request({ requestId: id }), { params: Promise.resolve({ action: "checkout" }) })).status).toBe(410);
    expect(mocks.relay).not.toHaveBeenCalled();
  });
  it("binds confirmation to the displayed request even with several tabs", async () => {
    mocks.cookie.mockReturnValue({ value: token });
    await action(request({ requestId: id }), { params: Promise.resolve({ action: "confirm" }) });
    expect(mocks.cookie).toHaveBeenCalledWith(`totem_parent_${id}`);
    expect(mocks.relay).toHaveBeenCalledWith("confirm", { token, requestId: id });
  });
});
