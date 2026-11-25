import { afterEach, describe, expect, it, vi } from "vitest";
import { baseOpenGraph, baseTwitter, pageAlternates, siteUrl } from "@/lib/seo";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

afterEach(() => vi.unstubAllEnvs());
describe("public SEO URLs and sharing cards", () => {
  it("normalizes the redirecting production domain across all metadata", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://totem-ancestral.com/");
    expect(siteUrl()).toBe("https://www.totem-ancestral.com");
    expect(pageAlternates("fr", "/offres").canonical).toBe("https://www.totem-ancestral.com/fr/offres");
    expect(robots().sitemap).toBe("https://www.totem-ancestral.com/sitemap.xml");
    expect(sitemap().every(entry => entry.url.startsWith("https://www.totem-ancestral.com/"))).toBe(true);
  });
  it("keeps development and other configured hosts untouched", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    expect(siteUrl()).toBe("http://localhost:3000");
  });
  it.each(["fr", "en"] as const)("includes an explicit social image for %s", lang => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://totem-ancestral.com");
    const image = { url: `https://www.totem-ancestral.com/${lang}/opengraph-image`, width: 1200, height: 630, alt: "Totem Ancestral" };
    expect(baseOpenGraph(lang, "Totem Ancestral").images).toEqual([image]);
    expect(baseTwitter(lang)).toEqual({ card: "summary_large_image", images: [image] });
  });
  it("lists both language versions without including private or shared artworks", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.totem-ancestral.com");
    const entries = sitemap();
    expect(entries).toHaveLength(16);
    expect(new Set(entries.map(entry => entry.url)).size).toBe(16);
    expect(entries.some(entry => entry.url.endsWith("/en/offres"))).toBe(true);
    expect(entries.every(entry => !/\/(espace|totem|oeuvre|admin)(\/|$)/.test(new URL(entry.url).pathname))).toBe(true);
  });
});
