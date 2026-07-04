type Osc = OscillatorNode;

class MysticAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private nodes: (Osc | AudioBufferSourceNode)[] = [];
  private started = false;
  private _muted = false;

  get muted() {
    return this._muted;
  }

  private ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this._muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  startAmbient() {
    const ctx = this.ensureCtx();
    if (!ctx || !this.master || this.started) return;
    this.started = true;

    const amb = ctx.createGain();
    amb.gain.value = 0;
    amb.connect(this.master);
    this.ambientGain = amb;
    amb.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 3.5);

    const freqs = [55, 82.4, 110];
    const detunes = [0, -6, 5];
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.detune.value = detunes[i];
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.5 : 0.22;

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.06 + i * 0.02;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.06;
      lfo.connect(lfoGain).connect(g.gain);

      o.connect(g).connect(amb);
      o.start();
      lfo.start();
      this.nodes.push(o, lfo);
    });

    const noise = this.createNoiseSource(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1600;
    bp.Q.value = 0.8;
    const nGain = ctx.createGain();
    nGain.gain.value = 0.04;
    noise.connect(bp).connect(nGain).connect(amb);
    noise.start();
    this.nodes.push(noise);
  }

  swell() {
    const ctx = this.ensureCtx();
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;

    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(110, now);
    o.frequency.exponentialRampToValueAtTime(880, now + 1.1);

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(500, now);
    lp.frequency.exponentialRampToValueAtTime(6000, now + 1.1);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.16, now + 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    o.connect(lp).connect(g).connect(this.master);
    o.start(now);
    o.stop(now + 1.7);
  }

  chime() {
    const ctx = this.ensureCtx();
    if (!ctx || !this.master) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => {
      const t = ctx.currentTime + i * 0.16;
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g).connect(this.master!);
      o.start(t);
      o.stop(t + 1.7);
    });
  }

  setMuted(muted: boolean) {
    this._muted = muted;
    const ctx = this.ensureCtx();
    if (!ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.9, ctx.currentTime + 0.4);
  }

  stop() {
    if (this.ambientGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.linearRampToValueAtTime(0, now + 1.2);
    }
    const nodes = this.nodes;
    this.nodes = [];
    this.started = false;
    window.setTimeout(() => {
      nodes.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* deja arrete */
        }
      });
    }, 1400);
  }

  private createNoiseSource(ctx: AudioContext) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    return src;
  }
}

export const mysticAudio = new MysticAudio();
