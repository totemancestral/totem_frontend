/** Keep only the current question and the next audio, never the full journey. */
export class QuestionAudioCache {
  private entries = new Map<string, { abort: AbortController; url?: string }>();

  prepare(sources: string[], preload = sources) {
    for (const [source, entry] of this.entries) {
      if (!sources.includes(source)) {
        entry.abort.abort();
        if (entry.url) URL.revokeObjectURL(entry.url);
        this.entries.delete(source);
      }
    }
    for (const source of preload) {
      if (this.entries.has(source)) continue;
      const entry: { abort: AbortController; url?: string } = { abort: new AbortController() };
      this.entries.set(source, entry);
      void fetch(source, { signal: entry.abort.signal }).then(async response => {
        if (!response.ok) throw Error("audio_unavailable");
        const blob = await response.blob();
        if (!entry.abort.signal.aborted) entry.url = URL.createObjectURL(blob);
      }).catch(() => { if (this.entries.get(source) === entry) this.entries.delete(source); });
    }
  }

  source(source: string) { return this.entries.get(source)?.url ?? source; }

  dispose() { this.prepare([]); }
}
