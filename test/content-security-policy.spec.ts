import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "../lib/content-security-policy";
import config from "../next.config";

describe("CSP observation", () => {
  it("restricts resources to exact origins without exposing signed URLs", () => {
    const policy = contentSecurityPolicy({
      development: false,
      supabaseUrl: "https://project.supabase.co/storage/private?token=secret",
      backendUrl: "https://api.example.com/assets?key=secret",
    });
    expect(policy).toContain("wss://project.supabase.co");
    expect(policy).toContain("https://api.example.com");
    expect(policy).not.toMatch(/secret|token=|key=|unsafe-eval|\*|connect-src[^;]* wss?:;/);
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
  });

  it("allows development tooling only in development", () => {
    expect(contentSecurityPolicy({ development: true })).toContain("'unsafe-eval'");
    expect(contentSecurityPolicy({ development: false })).not.toContain("'unsafe-eval'");
  });

  it("rejects non-HTTP origins and embedded credentials", () => {
    for (const supabaseUrl of ["data:text/html,test", "https://user:password@example.com", "https://example.com; script-src *"]) {
      expect(() => contentSecurityPolicy({ development: false, supabaseUrl })).toThrow();
    }
  });

  it("installs observation without enabling enforcement", async () => {
    const rules = await config.headers!();
    const headers = rules.flatMap((rule) => rule.headers);
    expect(headers.some(({ key }) => key === "Content-Security-Policy-Report-Only")).toBe(true);
    expect(headers.some(({ key }) => key === "Content-Security-Policy")).toBe(false);
    expect(headers).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
  });
});
