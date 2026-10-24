import { describe, expect, it, vi } from "vitest";
import { REQUEST_TIMING, requestSignal } from "../lib/request-timing";

describe("request waiting budgets", () => {
  it("keeps the request deadline separate from a generation waiting window", () => {
    expect(REQUEST_TIMING.read).toBeLessThan(REQUEST_TIMING.paymentWindow);
    expect(REQUEST_TIMING.draw).toBeLessThan(REQUEST_TIMING.artworkWindow);
  });
  it("aborts a pending request when its owner is disposed", () => {
    const owner = new AbortController();
    const signal = requestSignal(REQUEST_TIMING.read, owner.signal);
    expect(signal.aborted).toBe(false);
    owner.abort(); expect(signal.aborted).toBe(true);
  });
  it("also aborts when the deadline expires without disposing the owner", () => {
    const deadline = new AbortController();
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(deadline.signal);
    try {
      const owner = new AbortController(); const signal = requestSignal(20_000, owner.signal);
      deadline.abort(new DOMException("Expired", "TimeoutError"));
      expect(signal.aborted).toBe(true); expect(owner.signal.aborted).toBe(false);
      expect(timeout).toHaveBeenCalledWith(20_000);
    } finally { timeout.mockRestore(); }
  });
});
