"use client";

import { useEffect, useState, type RefObject } from "react";

function timestamp(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

export function AudioSeekBar({ audioRef, lang }: {
  audioRef: RefObject<HTMLAudioElement | null>;
  lang: string;
}) {
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const en = lang === "en";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const sync = () => {
      const length = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
      setDuration(length);
      setPosition(length ? Math.min(length, Math.max(0, audio.currentTime)) : 0);
    };
    const events = ["loadedmetadata", "durationchange", "timeupdate", "seeking", "seeked", "ended", "emptied", "error"];
    events.forEach(event => audio.addEventListener(event, sync));
    sync();
    return () => events.forEach(event => audio.removeEventListener(event, sync));
  }, [audioRef]);

  function seek(seconds: number) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const next = Math.max(0, Math.min(duration, seconds));
    audio.currentTime = next;
    setPosition(next);
  }

  const buttonClass = "min-h-11 min-w-11 shrink-0 border-0 bg-transparent px-2 text-sm text-orpale disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-or";

  return (
    <div className="w-full min-w-0">
      <div className="flex items-center gap-2">
        <button type="button" disabled={!duration} onClick={() => seek((audioRef.current?.currentTime ?? 0) - 10)}
          aria-label={en ? "Rewind 10 seconds" : "Reculer de 10 secondes"} className={buttonClass}>−10 s</button>
        <input type="range" min={0} max={duration || 1} step="any" value={position} disabled={!duration}
          aria-label={en ? "Playback position" : "Position de lecture"}
          aria-valuetext={`${timestamp(position)} / ${timestamp(duration)}`}
          onChange={event => seek(Number(event.currentTarget.value))}
          onKeyDown={event => {
            if (event.key === "ArrowLeft" || event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "ArrowUp") {
              event.preventDefault();
              seek(position + (event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 1));
            }
          }}
          className="h-11 min-w-0 flex-1 cursor-pointer accent-[#C9A84C] disabled:cursor-default disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-or" />
        <button type="button" disabled={!duration} onClick={() => seek((audioRef.current?.currentTime ?? 0) + 10)}
          aria-label={en ? "Forward 10 seconds" : "Avancer de 10 secondes"} className={buttonClass}>+10 s</button>
      </div>
      <div aria-hidden="true" className="flex justify-between px-2 text-xs tabular-nums text-grisclair">
        <span>{timestamp(position)}</span><span>{timestamp(duration)}</span>
      </div>
    </div>
  );
}
