"use client";

import { useAmbientMusic } from "@/lib/hooks/useAmbientMusic";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function MusicButton({ copy, className = "" }: { copy: Dictionary["media"]; className?: string }) {
  const { playing, toggle } = useAmbientMusic();
  const label = playing ? copy.musicOff : copy.musicOn;
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} aria-pressed={playing}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-nuit/70 text-ivoire transition-colors hover:bg-nuit/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-or ${className}`}>
      <SoundIcon muted={!playing} />
    </button>
  );
}

export function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M3 9v6h4l5 5V4L7 9H3z" />
        {!muted ? <><path d="M16 8a5 5 0 0 1 0 8" /><path d="M19 5a9 9 0 0 1 0 14" /></> :
          <><line x1="16" y1="9" x2="22" y2="15" /><line x1="22" y1="9" x2="16" y2="15" /></>}
      </svg>
  );
}
