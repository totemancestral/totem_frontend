"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { MusicButton, SoundIcon } from "@/components/ui/MusicButton";
import { AmbientMusicContext } from "@/lib/hooks/useAmbientMusic";
import { AmbientLoop } from "@/lib/ambient-loop";

const MUSIC_KEY = "totem_ambient_enabled";
const INTRO_KEY = "totem_intro_seen";

export function MediaExperience({ children, copy, homePath }: {
  children: ReactNode;
  copy: Dictionary["media"];
  homePath: string;
}) {
  const pathname = usePathname();
  const introSource = homePath === "/en" ? "/assets/intro/totem-intro-en.mp4" : "/assets/intro/totem-intro.mp4";
  const musicRef = useRef<AmbientLoop | null>(null);
  const introRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const enabledRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [introMuted, setIntroMuted] = useState(true);
  const [error, setError] = useState(false);
  const [heroControls, setHeroControls] = useState<HTMLDivElement | null>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const showFloatingMusic = pathname !== homePath || (heroControls !== null && !heroVisible);

  useEffect(() => {
    if (!heroControls) return;
    const hero = heroControls.closest("[data-hero]");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      setHeroVisible(entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroControls]);

  const startMusic = useCallback(() => {
    const music = musicRef.current;
    if (!music || dialogRef.current?.open) return;
    const voicePlaying = Array.from(document.querySelectorAll<HTMLMediaElement>("audio, video"))
      .some((media) => !music.owns(media) && !media.paused && !media.ended && !media.muted);
    music.setVolume(voicePlaying ? 0.1 : 0.5);
    void music.play().then(() => setError(false)).catch(() => setPlaying(false));
  }, []);

  function toggle() {
    const music = musicRef.current;
    if (!music) return;
    enabledRef.current = music.paused;
    try { localStorage.setItem(MUSIC_KEY, String(enabledRef.current)); } catch { /* Storage is optional. */ }
    if (enabledRef.current) startMusic();
    else music.pause();
  }

  function finishIntro() {
    introRef.current?.pause();
    try { sessionStorage.setItem(INTRO_KEY, "true"); } catch { /* Storage is optional. */ }
    dialogRef.current?.close();
    document.getElementById("main-content")?.focus({ preventScroll: true });
    // Called from a user gesture when skipping; browsers may still require the music button after autoplay.
    if (enabledRef.current) startMusic();
  }

  useEffect(() => {
    const tracks: [HTMLAudioElement, HTMLAudioElement] = [
      new Audio("/assets/totem-music.mp3?v=20261025-continu1"),
      new Audio("/assets/totem-music.mp3?v=20261025-continu1"),
    ];
    tracks.forEach(track => { track.preload = "none"; });
    const music = new AmbientLoop(tracks, setPlaying);
    musicRef.current = music;
    const onError = () => { music.pause(); setError(true); };
    tracks.forEach(track => track.addEventListener("error", onError));
    try { enabledRef.current = localStorage.getItem(MUSIC_KEY) !== "false"; } catch { enabledRef.current = true; }
    const otherAudio = new Set<HTMLMediaElement>();
    const updateVolume = (event: Event) => {
      const media = event.target;
      if (!(media instanceof HTMLMediaElement) || music.owns(media)) return;
      if (media.paused || media.ended || media.muted) otherAudio.delete(media);
      else otherAudio.add(media);
      for (const active of otherAudio) {
        if (!active.isConnected || active.paused || active.ended || active.muted) otherAudio.delete(active);
      }
      music.setVolume(otherAudio.size ? 0.1 : 0.5);
    };
    const resume = (event: Event) => {
      if (event.target instanceof Element && event.target.closest("button, a, input, select, textarea")) return;
      if (enabledRef.current && music.paused) startMusic();
    };
    for (const type of ["play", "pause", "ended", "volumechange"]) document.addEventListener(type, updateVolume, true);
    document.addEventListener("pointerdown", resume);
    document.addEventListener("keydown", resume);
    return () => {
      for (const type of ["play", "pause", "ended", "volumechange"]) document.removeEventListener(type, updateVolume, true);
      document.removeEventListener("pointerdown", resume);
      document.removeEventListener("keydown", resume);
      tracks.forEach(track => track.removeEventListener("error", onError));
      music.dispose();
      musicRef.current = null;
    };
  }, [startMusic]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const video = introRef.current;
    if (!dialog || !video || pathname !== homePath) return;
    let seen = false;
    try { seen = sessionStorage.getItem(INTRO_KEY) === "true"; } catch { /* Storage is optional. */ }
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    dialog.showModal();
    // Garder le focus dans l'introduction sans sélectionner un bouton à l'ouverture.
    dialog.focus({ preventScroll: true });
    musicRef.current?.pause();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const restoreScroll = () => { document.body.style.overflow = overflow; };
    dialog.addEventListener("close", restoreScroll);
    void video.play().catch(() => {});
    return () => {
      video.pause();
      dialog.close();
      restoreScroll();
      dialog.removeEventListener("close", restoreScroll);
    };
  }, [homePath, pathname]);

  return (
    <AmbientMusicContext.Provider value={{ playing, toggle, setHeroControls }}>
      {children}
      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2" data-floating-music>
        {error && <p role="status" className="bg-nuit px-3 py-2 text-sm text-ivoire">{copy.audioError}</p>}
        {showFloatingMusic && <MusicButton copy={copy} className="shadow-lg" />}
      </div>
      <dialog ref={dialogRef} aria-labelledby="totem-intro-title"
        onCancel={(event) => { event.preventDefault(); finishIntro(); }}
        className="totem-intro m-0 h-dvh max-h-none w-screen max-w-none bg-nuit p-0 text-ivoire outline-none backdrop:bg-nuit">
        <h2 id="totem-intro-title" className="sr-only">{copy.introTitle}</h2>
        <video ref={introRef} src={introSource} muted={introMuted} playsInline preload="none"
          onEnded={finishIntro} onError={finishIntro} className="h-full w-full object-contain" />
        <div data-intro-controls className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] flex items-center gap-3 sm:bottom-6 sm:right-6">
          <button type="button" aria-label={introMuted ? copy.soundOn : copy.soundOff}
            title={introMuted ? copy.soundOn : copy.soundOff} aria-pressed={!introMuted} onClick={() => {
            const video = introRef.current;
            if (!video) return;
            video.muted = !video.muted;
            setIntroMuted(video.muted);
            if (video.paused) void video.play().catch(() => {});
          }} className="flex h-11 w-11 items-center justify-center border-0 bg-transparent text-ivoire transition-colors hover:text-orpale focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-or">
            <SoundIcon muted={introMuted} />
          </button>
          <button type="button" onClick={finishIntro} className="min-h-11 border-0 bg-transparent px-5 py-2 text-sm text-ivoire transition-colors hover:text-orpale focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-or">{copy.skipIntro}</button>
        </div>
      </dialog>
    </AmbientMusicContext.Provider>
  );
}
