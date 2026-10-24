import { afterEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { relayConsultation } from "@/lib/server/consultations";
import { readAdultPayment } from "@/lib/server/adult-parcours";
import { readAssetLinks } from "@/lib/server/asset-links";

vi.mock("@/lib/env", () => ({ getServerEnv: () => ({ TOTEM_BACKEND_URL: "https://backend.invalid" }) }));
vi.mock("@/lib/supabase/server", () => ({ authenticateRequest: async () => ({ userId: "test-user" }), createServiceClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: async () => null }));
afterEach(() => vi.unstubAllGlobals());
describe("upstream quota relays", () => {
  for (const status of [429, 503]) {
    it.each(["draw", "payment", "assets"])(`forwards ${status} and the backend delay for %s`, async (route) => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status, headers: { "Retry-After": "37" } })));
      const request = new Request("https://site.invalid/api/test", { headers: { Authorization: "Bearer test" } });
      const response = route === "draw" ? await relayConsultation(request, "tirer", {})
        : route === "payment" ? await readAdultPayment(request, "session") : await readAssetLinks(request, ["session"]);
      expect(response).toBeInstanceOf(NextResponse);
      const forwarded = response as NextResponse;
      expect(forwarded.status).toBe(status);
      expect(forwarded.headers.get("Retry-After")).toBe("37");
      expect((await forwarded.json()).retryAfter).toBe(37);
    });
  }
});
