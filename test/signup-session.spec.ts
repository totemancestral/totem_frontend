import { describe, expect, it, vi } from "vitest";
import { establishSignupSession } from "../lib/signup-session";

describe("signup session handoff", () => {
  it.each([{}, { accessToken: "access" }, { refreshToken: "refresh" }])("rejects incomplete tokens without touching the auth session", async payload => {
    const auth = { setSession: vi.fn() };
    expect(await establishSignupSession(payload, auth)).toBe(false);
    expect(auth.setSession).not.toHaveBeenCalled();
  });
  it("waits for session persistence before allowing navigation", async () => {
    let resolve!: (value: { error: null }) => void;
    const auth = { setSession: vi.fn(() => new Promise<{ error: null }>(done => { resolve = done; })) };
    let ready = false;
    const result = establishSignupSession({ accessToken: "access", refreshToken: "refresh" }, auth).then(value => { ready = value; });
    await Promise.resolve(); expect(ready).toBe(false);
    expect(auth.setSession).toHaveBeenCalledWith({ access_token: "access", refresh_token: "refresh" });
    resolve({ error: null }); await result; expect(ready).toBe(true);
  });
  it("blocks the handoff when auth rejects the session", async () => {
    expect(await establishSignupSession({ accessToken: "access", refreshToken: "refresh" }, { setSession: vi.fn().mockResolvedValue({ error: new Error("Rejected") }) })).toBe(false);
  });
});
