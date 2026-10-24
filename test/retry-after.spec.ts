import { describe, expect, it } from "vitest";
import { retryAfterSeconds, retryNotice, RetryAfterError, retryErrorNotice } from "@/lib/retry-after";
import { forwardRetryResponse } from "@/lib/server/response-limits";

describe("retry delays", () => {
  it.each(["30", "1", "0"])("reads seconds %s", (value) => {
    expect(retryAfterSeconds(new Response(null, { headers: { "Retry-After": value } }))).toBe(Math.max(1, Number(value)));
  });
  it("reads an HTTP date relative to the response time", () => {
    const now = Date.UTC(2026, 9, 23, 12);
    expect(retryAfterSeconds(new Response(null, { headers: { "Retry-After": new Date(now + 45000).toUTCString() } }), now)).toBe(45);
  });
  it.each(["", "-5", "1.5", "NaN", "Infinity", "tomorrow", "99999999999999999999"])("rejects invalid delays %s", (value) => {
    expect(retryAfterSeconds(new Response(null, { headers: { "Retry-After": value } }))).toBeNull();
  });
  it("localizes a quota or temporary outage without exposing server details", () => {
    const response = new Response(null, { status: 429, headers: { "Retry-After": "37" } });
    expect(retryNotice(response, "fr")).toContain("37 secondes");
    expect(retryNotice(response, "en")).toContain("37 seconds");
    expect(retryErrorNotice(new RetryAfterError(response), "en")).toContain("37 seconds");
    expect(retryErrorNotice(new Error("network"), "en")).toBeNull();
    expect(retryNotice(new Response(null, { status: 503, headers: { "Retry-After": "1" } }), "en")).toContain("1 second before");
  });
  it("never invents a duration or alters unrelated errors", () => {
    expect(retryNotice(new Response(null, { status: 429 }), "fr")).toBe("Trop de tentatives. Réessayez plus tard.");
    expect(retryNotice(new Response(null, { status: 503 }), "en")).toBeNull();
    expect(retryNotice(new Response(null, { status: 401, headers: { "Retry-After": "30" } }), "fr")).toBeNull();
  });
  it.each([429, 503])("preserves upstream status %s, TTL and no-store", async (status) => {
    const response = forwardRetryResponse(new Response(null, { status, headers: { "Retry-After": "37" } }))!;
    expect(response.status).toBe(status);
    expect(response.headers.get("Retry-After")).toBe("37");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect((await response.json()).retryAfter).toBe(37);
  });
});
