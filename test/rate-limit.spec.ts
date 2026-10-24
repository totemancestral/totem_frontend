import { afterEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });
function setup(result: unknown = [1, 60_000]) {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("RATE_LIMIT_REDIS_REST_URL", "https://redis.invalid");
  vi.stubEnv("RATE_LIMIT_REDIS_REST_TOKEN", "test-only-token");
  vi.stubEnv("RATE_LIMIT_IP_HEADER", "x-trusted-ip");
  const fetcher = vi.fn().mockResolvedValue(Response.json({ result }));
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}
const req = () => new Request("https://totem.invalid", { headers: { "x-trusted-ip": "192.0.2.1" } });
describe("shared rate limits", () => {
  it("uses atomic expiring counters without raw IP addresses", async () => {
    const fetcher = setup();
    expect(await rateLimit(req(), 5, 60_000, "auth.signup")).toBeNull();
    const options = fetcher.mock.calls[0][1];
    const body = JSON.parse(options.body);
    expect(body[0]).toBe("EVAL");
    expect(body[1]).toContain("PEXPIRE");
    expect(body[3]).toContain("totem:rate-limit:v1:auth.signup:");
    expect(options.body).not.toContain("192.0.2.1");
    expect(options.cache).toBe("no-store");
  });
  it("separates actions", async () => {
    const fetcher = setup();
    // Each mock response needs its own unread body.
    fetcher.mockImplementation(async () => Response.json({ result: [1, 60_000] }));
    await rateLimit(req(), 5, 60_000, "contact");
    await rateLimit(req(), 5, 60_000, "auth.recover");
    expect(JSON.parse(fetcher.mock.calls[0][1].body)[3]).not.toBe(JSON.parse(fetcher.mock.calls[1][1].body)[3]);
  });
  it("returns the actual retry delay on excess requests", async () => {
    setup([6, 12_100]);
    const response = await rateLimit(req(), 5);
    expect(response?.status).toBe(429);
    expect(response?.headers.get("Retry-After")).toBe("13");
    expect(response?.headers.get("Cache-Control")).toContain("no-store");
  });
  it.each([null, [1, -1], ["1", 1000], [1], [0, 1000]])("refuses invalid Redis results %s", async (result) => {
    setup(result);
    expect((await rateLimit(req()))?.status).toBe(503);
  });
  it("does not silently allow requests during an outage", async () => {
    const fetcher = setup();
    fetcher.mockRejectedValue(new Error("network"));
    expect((await rateLimit(req()))?.status).toBe(503);
  });
  it("requires Redis in production", async () => {
    setup();
    vi.stubEnv("RATE_LIMIT_REDIS_REST_TOKEN", "");
    expect((await rateLimit(req()))?.status).toBe(503);
  });
  it("expires the development counter and separates scopes", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("RATE_LIMIT_REDIS_REST_URL", "");
    vi.stubEnv("RATE_LIMIT_REDIS_REST_TOKEN", "");
    vi.useFakeTimers();
    expect(await rateLimit(req(), 1, 1000, "local-test")).toBeNull();
    expect((await rateLimit(req(), 1, 1000, "local-test"))?.status).toBe(429);
    expect(await rateLimit(req(), 1, 1000, "other-test")).toBeNull();
    vi.advanceTimersByTime(1000);
    expect(await rateLimit(req(), 1, 1000, "local-test")).toBeNull();
  });
});
