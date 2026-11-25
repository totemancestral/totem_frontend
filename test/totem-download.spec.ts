import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { createTotemDownload } from "@/lib/server/totem-download";

describe("private totem PNG composition", () => {
  it.each([
    "Dayo-Pita, Des Ancêtres Debout",
    "ZARA LE LÉOPARD DES OMBRES",
    "TrèsLongPrénom".repeat(12) + ", Qui garde les mémoires & les histoires <anciennes>",
  ])("renders a complete 1200 × 1600 PNG for %s", async name => {
    const original = await sharp({ create: { width: 200, height: 400, channels: 3, background: "#af7822" } }).png().toBuffer();
    const result = await createTotemDownload(original, name);
    const metadata = await sharp(result).metadata();
    expect(metadata).toMatchObject({ format: "png", width: 1200, height: 1600 });
    // Both the top and bottom of the source image survive; it is never cropped.
    for (const top of [42, 1196]) {
      const pixel = await sharp(result).extract({ left: 600, top, width: 1, height: 1 }).raw().toBuffer();
      expect([...pixel].slice(0, 3)).toEqual([175, 120, 34]);
    }
  });
  it("rejects empty names instead of delivering an unnamed artwork", async () => {
    await expect(createTotemDownload(Buffer.alloc(0), " ")).rejects.toThrow("Invalid ancestral name");
  });
});
