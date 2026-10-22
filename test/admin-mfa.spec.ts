import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requireAdmin } from "../lib/supabase/server";

const mocks = vi.hoisted(() => ({ user: vi.fn(), role: vi.fn() }));
vi.mock("../lib/env", () => ({ getServerEnv: () => ({
  NEXT_PUBLIC_SUPABASE_URL: "https://example.invalid", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  SUPABASE_SERVICE_ROLE_KEY: "service",
}) }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({
  auth: { getUser: mocks.user },
  from: () => {
    const query = { select: () => query, eq: () => query, maybeSingle: mocks.role };
    return query;
  },
}) }));
const token = (payload: unknown) => `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;
const request = (jwt?: string) => new Request("https://example.invalid/api/admin/stats", {
  headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ data: { user: { id: "admin", email: "admin@example.invalid" } }, error: null });
  mocks.role.mockResolvedValue({ data: { id: "role" }, error: null });
});

describe("admin API MFA enforcement", () => {
  it.each([{ aal: "aal1" }, {}, { aal: "aal3" }])("rejects an admin without aal2: %j", async (payload) => {
    const result = await requireAdmin(request(token(payload)));
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
    expect(await (result as NextResponse).json()).toEqual({ error: "mfa_required" });
  });
  it("rejects a malformed payload", async () => {
    expect((await requireAdmin(request("invalid")) as NextResponse).status).toBe(401);
  });
  it("accepts an authenticated admin with aal2 without requiring enrollment API access", async () => {
    await expect(requireAdmin(request(token({ aal: "aal2" })))).resolves.toEqual({ userId: "admin", email: "admin@example.invalid" });
    expect(mocks.user).toHaveBeenCalledWith(token({ aal: "aal2" }));
  });
  it("rejects a non-admin even with aal2", async () => {
    mocks.role.mockResolvedValue({ data: null, error: null });
    expect((await requireAdmin(request(token({ aal: "aal2" }))) as NextResponse).status).toBe(403);
  });
  it("does not trust aal2 on an invalid token", async () => {
    mocks.user.mockResolvedValue({ data: { user: null }, error: { message: "invalid signature" } });
    expect((await requireAdmin(request(token({ aal: "aal2" }))) as NextResponse).status).toBe(401);
    expect(mocks.role).not.toHaveBeenCalled();
  });
  it("rejects missing authentication", async () => {
    expect((await requireAdmin(request()) as NextResponse).status).toBe(401);
    expect(mocks.user).not.toHaveBeenCalled();
  });
  it("fails closed when role lookup fails", async () => {
    mocks.role.mockResolvedValue({ data: null, error: { message: "unavailable" } });
    expect((await requireAdmin(request(token({ aal: "aal2" }))) as NextResponse).status).toBe(500);
  });
});
