import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { BYPASS_TTL, createMaintenanceToken, verifyMaintenanceToken } from "@/lib/maintenance-access";
import { GET, POST } from "@/app/api/bypass-maintenance/route";
import { proxy } from "@/proxy";

vi.mock("@/app/[lang]/dictionaries", () => ({ locales: ["fr", "en"] }));

const secret = "test-only-maintenance-secret";
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
function request(key: string, origin = "https://totem.invalid", ip = "test") {
  return new Request("https://totem.invalid/api/bypass-maintenance", {
    method: "POST", headers: { origin, "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": ip },
    body: new URLSearchParams({ key }),
  });
}
describe("maintenance access", () => {
  it("issues distinct signed tokens without storing the key", () => {
    const token = createMaintenanceToken(secret);
    expect(token).not.toContain(secret);
    expect(createMaintenanceToken(secret)).not.toBe(token);
    expect(verifyMaintenanceToken(token, secret)).toBe(true);
  });
  it("rejects expiry, forgery, old cookies and key rotation", () => {
    const now = Date.now();
    const token = createMaintenanceToken(secret, now);
    expect(verifyMaintenanceToken(token, secret, now + BYPASS_TTL * 1000)).toBe(false);
    expect(verifyMaintenanceToken(token.replace("v1.", "v2."), secret)).toBe(false);
    expect(verifyMaintenanceToken(token.slice(0, -1) + (token.endsWith("0") ? "1" : "0"), secret)).toBe(false);
    expect(verifyMaintenanceToken(secret, secret)).toBe(false);
    expect(verifyMaintenanceToken(token, "rotated")).toBe(false);
    expect(verifyMaintenanceToken(token, undefined)).toBe(false);
  });
  it("serves a labelled POST form without issuing a cookie", async () => {
    const response = GET(new Request("https://totem.invalid/api/bypass-maintenance"));
    expect(await response.text()).toContain('method="post"');
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("strips legacy query keys without granting access", () => {
    const response = GET(new Request(`https://totem.invalid/api/bypass-maintenance?key=${secret}`));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://totem.invalid/api/bypass-maintenance");
    expect(response.headers.get("set-cookie")).toBeNull();
  });
  it("grants a secure eight-hour cookie for a valid POST", async () => {
    vi.stubEnv("MAINTENANCE_BYPASS_SECRET", secret);
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RATE_LIMIT_REDIS_REST_URL", "https://redis.invalid");
    vi.stubEnv("RATE_LIMIT_REDIS_REST_TOKEN", "test-token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ result: [1, 60_000] })));
    const response = await POST(request(secret));
    expect(response.status).toBe(303);
    const cookie = response.cookies.get("totem_bypass");
    expect(verifyMaintenanceToken(cookie?.value, secret)).toBe(true);
    const header = response.headers.get("set-cookie")!;
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Secure");
    expect(header).toContain("SameSite=lax");
    expect(header).toContain("Max-Age=28800");
    expect(header).not.toContain(secret);
  });
  it("refuses wrong keys, cross-origin submissions and absent configuration", async () => {
    vi.stubEnv("MAINTENANCE_BYPASS_SECRET", secret);
    for (const req of [request("wrong"), request(secret, "https://evil.invalid")]) {
      const response = await POST(req);
      expect(response.status).toBe(403);
      expect(response.headers.get("set-cookie")).toBeNull();
      expect(await response.text()).not.toContain(secret);
    }
    vi.stubEnv("MAINTENANCE_BYPASS_SECRET", "");
    expect((await POST(request(secret))).status).toBe(403);
  });
  it("limits repeated attempts", async () => {
    for (let index = 0; index < 10; index++) await POST(request("wrong", undefined, "rate-limit-test"));
    expect((await POST(request("wrong", undefined, "rate-limit-test"))).status).toBe(429);
  });
  it("bounds the submitted body", async () => {
    expect((await POST(request("a".repeat(5000), undefined, "large-body"))).status).toBe(413);
  });
  it("enforces signed access in the proxy for pages and API", () => {
    vi.stubEnv("MAINTENANCE_MODE", "true");
    vi.stubEnv("MAINTENANCE_BYPASS_SECRET", secret);
    for (const path of ["/fr/espace", "/api/commandes"]) {
      const url = `https://totem.invalid${path}`;
      expect(proxy(new NextRequest(url, { headers: { cookie: `totem_bypass=${secret}` } }))?.status).toBe(503);
      expect(proxy(new NextRequest(url, { headers: { cookie: `totem_bypass=${createMaintenanceToken(secret)}` } }))?.status ?? 200).toBe(200);
    }
    expect(proxy(new NextRequest("https://totem.invalid/api/bypass-maintenance"))?.status).toBe(200);
  });
});
