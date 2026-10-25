/** Two streaming players overlap at the seam; the long track is never decoded into RAM. */
export class AmbientLoop {
  private active = 0;
  private context?: AudioContext;
  private master?: GainNode;
  private gains: GainNode[] = [];
  private sources: MediaElementAudioSourceNode[] = [];
  private timer?: ReturnType<typeof setInterval>;
  private transition = false;
  private pending = false;
  private generation = 0;
  private enabled = false;
  private volume = 0.5;
  private onTime = () => { void this.tick(); };

  constructor(private tracks: [HTMLAudioElement, HTMLAudioElement], private onPlaying: (playing: boolean) => void) {
    tracks.forEach(track => {
      track.addEventListener("timeupdate", this.onTime);
      track.addEventListener("ended", this.onTime);
    });
  }

  owns(media: HTMLMediaElement) { return this.tracks.includes(media as HTMLAudioElement); }
  get paused() { return !this.enabled; }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(volume, this.context.currentTime, 0.08);
    }
  }

  async play() {
    const generation = ++this.generation;
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.context.destination);
      this.tracks.forEach((track, index) => {
        const source = this.context!.createMediaElementSource(track);
        const gain = this.context!.createGain();
        gain.gain.value = index === this.active ? 1 : 0;
        source.connect(gain);
        gain.connect(this.master!);
        this.sources.push(source);
        this.gains.push(gain);
        track.preload = "auto";
      });
    }
    this.enabled = true;
    try {
      await this.context.resume();
      if (generation !== this.generation) return;
      await this.tracks[this.active].play();
      if (generation !== this.generation) { if (!this.enabled) this.tracks.forEach(track => track.pause()); return; }
      this.onPlaying(true);
      if (!this.timer) this.timer = setInterval(() => { void this.tick(); }, 100);
    } catch (error) {
      if (generation === this.generation) this.pause();
      throw error;
    }
  }

  pause() {
    this.enabled = false;
    ++this.generation;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.tracks.forEach(track => track.pause());
    // If paused mid-fade, resume the incoming track at its current position.
    if (this.transition) this.active = 1 - this.active;
    this.transition = false;
    this.pending = false;
    this.gains.forEach((node, index) => {
      node.gain.cancelScheduledValues(0);
      node.gain.setValueAtTime(index === this.active ? 1 : 0, this.context!.currentTime);
    });
    this.onPlaying(false);
  }

  async tick() {
    if (!this.enabled || !this.context || this.pending) return;
    const outgoing = this.tracks[this.active];
    const incoming = this.tracks[1 - this.active];
    if (this.transition) {
      if (outgoing.ended || outgoing.duration - outgoing.currentTime <= 0.05) {
        outgoing.pause();
        this.active = 1 - this.active;
        this.transition = false;
      }
      return;
    }
    const remaining = outgoing.duration - outgoing.currentTime;
    if (!Number.isFinite(remaining) || remaining > 5 || remaining < 0) return;
    this.pending = true;
    const generation = this.generation;
    try {
      incoming.currentTime = 0;
      await incoming.play();
      if (generation !== this.generation) { if (!this.enabled) incoming.pause(); return; }
      // Wait for actual playback before fading the outgoing track.
      const duration = Math.max(0.05, outgoing.duration - outgoing.currentTime);
      const now = this.context.currentTime;
      this.gains[this.active].gain.cancelScheduledValues(now);
      this.gains[this.active].gain.setValueAtTime(1, now);
      this.gains[this.active].gain.linearRampToValueAtTime(0, now + duration);
      this.gains[1 - this.active].gain.cancelScheduledValues(now);
      this.gains[1 - this.active].gain.setValueAtTime(0, now);
      this.gains[1 - this.active].gain.linearRampToValueAtTime(1, now + duration);
      this.transition = true;
    } catch {
      // Keep the outgoing track audible and retry if loading was interrupted.
    } finally {
      this.pending = false;
    }
  }

  dispose() {
    this.pause();
    this.tracks.forEach(track => {
      track.removeEventListener("timeupdate", this.onTime);
      track.removeEventListener("ended", this.onTime);
    });
    this.sources.forEach(source => source.disconnect());
    this.gains.forEach(gain => gain.disconnect());
    this.master?.disconnect();
    void this.context?.close();
  }
}
