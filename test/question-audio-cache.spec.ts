import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionAudioCache } from "../lib/question-audio-cache";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

describe("next question audio preparation", () => {
  it("reuses the prepared bytes without fetching the whole questionnaire", async () => {
    const fetcher = vi.fn(async (source: string) => {
      expect(source).toBe("q2");
      return new Response(new Uint8Array([1, 2]), { headers: { "Content-Type": "audio/mpeg" } });
    });
    vi.stubGlobal("fetch", fetcher);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:prepared");
    const cache = new QuestionAudioCache();
    cache.prepare(["q1", "q2"], ["q2"]); await settle();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]?.[0]).toBe("q2");
    expect(cache.source("q2")).toBe("blob:prepared");
    expect(cache.source("q1")).toBe("q1");
    cache.dispose();
  });
  it("releases old audio and aborts obsolete preloads", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bytes")));
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:old");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const cache = new QuestionAudioCache(); cache.prepare(["q1"]); await settle();
    cache.prepare(["q2"]); expect(revoke).toHaveBeenCalledWith("blob:old");
    cache.dispose();
    expect(cache.source("q1")).toBe("q1");
  });
  it("keeps normal playback available when preloading fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("error", { status: 503 })));
    const cache = new QuestionAudioCache(); cache.prepare(["q2"]); await settle();
    expect(cache.source("q2")).toBe("q2"); cache.dispose();
  });
});
