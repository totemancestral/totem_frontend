import { describe, expect, it, vi } from "vitest";
import { AdultSaveQueue, adultLocalKey, localAdultDraftSchema } from "../lib/adult-save-queue";

describe("ordered adult saves", () => {
  it("does not let a newer snapshot overtake a slow save", async () => {
    let release!: () => void;
    const write = vi.fn().mockImplementationOnce(() => new Promise<void>(resolve => { release = resolve; }))
      .mockResolvedValueOnce(undefined);
    const status = vi.fn();
    const queue = new AdultSaveQueue(write, status);
    const first = queue.save({ "1": "A" });
    const last = queue.save({ "1": "B", "2": "C" });
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(write).toHaveBeenCalledTimes(1);
    release(); await first; await last;
    expect(write.mock.calls.map(call => call[0])).toEqual([{ "1": "A" }, { "1": "B", "2": "C" }]);
    expect(status.mock.calls.filter(call => call[0] === "saved")).toHaveLength(1);
  });
  it("retries with the full latest snapshot after an offline failure", async () => {
    const write = vi.fn().mockRejectedValueOnce(Error("offline")).mockResolvedValueOnce("draft-id");
    const status = vi.fn(); const queue = new AdultSaveQueue(write, status);
    await expect(queue.save({ "1": "A" })).rejects.toThrow("offline");
    expect(status).toHaveBeenLastCalledWith("pending");
    await expect(queue.save({ "1": "A", "2": "B" })).resolves.toBe("draft-id");
    expect(status).toHaveBeenLastCalledWith("saved");
  });
  it("keeps final confirmation pending until all older snapshots have finished", async () => {
    let release!: () => void;
    const queue = new AdultSaveQueue(async (snapshot: number) => {
      if (snapshot === 1) await new Promise<void>(resolve => { release = resolve; });
      return snapshot;
    }, () => {});
    void queue.save(1); const completed = vi.fn();
    const boundary = queue.save(4).then(completed);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(completed).not.toHaveBeenCalled(); release(); await boundary;
    expect(completed).toHaveBeenCalledWith(4);
  });
  it("isolates accounts and rejects malformed restored answers", () => {
    expect(adultLocalKey("one")).not.toBe(adultLocalKey("two"));
    expect(localAdultDraftSchema.safeParse({ parcoursId: null, sessionId: null, updatedAt: Date.now(), answers: { "11": { choice: "Z" } } }).success).toBe(false);
  });
});
