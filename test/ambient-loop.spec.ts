import { afterEach, describe, expect, it, vi } from "vitest";
import { AmbientLoop } from "@/lib/ambient-loop";

function fixture() {
  const params: { value: number; cancelScheduledValues: ReturnType<typeof vi.fn>; setValueAtTime: ReturnType<typeof vi.fn>; linearRampToValueAtTime: ReturnType<typeof vi.fn>; setTargetAtTime: ReturnType<typeof vi.fn> }[] = [];
  const context = {
    currentTime: 100, destination: {}, resume: vi.fn().mockResolvedValue(undefined), close: vi.fn().mockResolvedValue(undefined),
    createMediaElementSource: vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() })),
    createGain: vi.fn(() => {
      const gain = { value: 0, cancelScheduledValues: vi.fn(), setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn() };
      params.push(gain);
      return { gain, connect: vi.fn(), disconnect: vi.fn() };
    }),
  };
  vi.stubGlobal("AudioContext", class { constructor() { return context; } });
  const track = () => ({ currentTime: 0, duration: 1811, ended: false, preload: "none", play: vi.fn().mockResolvedValue(undefined), pause: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() });
  const tracks = [track(), track()] as const;
  const playing = vi.fn();
  const loop = new AmbientLoop([...tracks] as unknown as [HTMLAudioElement, HTMLAudioElement], playing);
  return { loop, tracks, params, playing, context };
}

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("ambient music overlap", () => {
  it("starts the incoming track before the end and schedules complementary fades", async () => {
    vi.useFakeTimers();
    const { loop, tracks, params } = fixture();
    await loop.play();
    tracks[0].currentTime = 1806;
    await loop.tick();
    expect(tracks[1].play).toHaveBeenCalledOnce();
    expect(tracks[0].pause).not.toHaveBeenCalled();
    expect(params[1].linearRampToValueAtTime).toHaveBeenCalledWith(0, 105);
    expect(params[2].linearRampToValueAtTime).toHaveBeenCalledWith(1, 105);
    tracks[0].ended = true;
    await loop.tick();
    expect(tracks[0].pause).toHaveBeenCalledOnce();
    // After the next cycle, the other player is reused, not a third player.
    tracks[1].currentTime = 1806;
    await loop.tick();
    expect(tracks[0].play).toHaveBeenCalledTimes(2);
    loop.dispose();
  });

  it("stops both players during a fade and resumes only the incoming one", async () => {
    vi.useFakeTimers();
    const { loop, tracks, playing } = fixture();
    await loop.play();
    tracks[0].currentTime = 1807;
    await loop.tick();
    loop.pause();
    expect(tracks.every(track => track.pause.mock.calls.length === 1)).toBe(true);
    expect(playing).toHaveBeenLastCalledWith(false);
    await loop.play();
    expect(tracks[0].play).toHaveBeenCalledOnce();
    expect(tracks[1].play).toHaveBeenCalledTimes(2);
    loop.dispose();
  });

  it("ducks both players together without cancelling the seam fades", async () => {
    vi.useFakeTimers();
    const { loop, params } = fixture();
    await loop.play();
    loop.setVolume(0.1);
    expect(params[0].setTargetAtTime).toHaveBeenCalledWith(0.1, 100, 0.08);
    expect(params[1].cancelScheduledValues).not.toHaveBeenCalled();
    loop.dispose();
  });

  it("keeps the outgoing track audible if the incoming play fails", async () => {
    vi.useFakeTimers();
    const { loop, tracks, params } = fixture();
    await loop.play();
    tracks[0].currentTime = 1806;
    tracks[1].play.mockRejectedValueOnce(new Error("interrupted"));
    await loop.tick();
    expect(params[1].linearRampToValueAtTime).not.toHaveBeenCalled();
    expect(tracks[0].pause).not.toHaveBeenCalled();
    await loop.tick();
    expect(params[1].linearRampToValueAtTime).toHaveBeenCalled();
    loop.dispose();
  });

  it("does not resume audio if pause occurs while play is pending", async () => {
    vi.useFakeTimers();
    const { loop, tracks, playing } = fixture();
    let resolve!: () => void;
    tracks[0].play.mockImplementationOnce(() => new Promise<void>(done => { resolve = done; }));
    const pending = loop.play();
    await Promise.resolve();
    loop.pause();
    resolve();
    await pending;
    expect(loop.paused).toBe(true);
    expect(playing).not.toHaveBeenCalledWith(true);
    loop.dispose();
  });
});
