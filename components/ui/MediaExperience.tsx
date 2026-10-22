"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { MusicButton } from "@/components/ui/MusicButton";
import { AmbientMusicContext } from "@/lib/hooks/useAmbientMusic";

const MUSIC_KEY = "totem_ambient_enabled";
const INTRO_KEY = "totem_intro_seen";

export function MediaExperience({ children, copy, homePath }: {
  children: ReactNode;
  copy: Dictionary["media"];
  homePath: string;
}) {
  const pathname = usePathname();
  const musicRef = useRef<HTMLAudioElement>(null);
  const introRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const enabledRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [introMuted, setIntroMuted] = useState(true);
  const [introPlaying, setIntroPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [heroControls, setHeroControls] = useState<HTMLDivElement | null>(null);
  const [heroControlsVisible, setHeroControlsVisible] = useState(true);
  const showFloatingMusic = pathname !== homePath || (heroControls !== null && !heroControlsVisible);

  useEffect(() => {
    if (!heroControls) return;
    let observer: IntersectionObserver;
    const observe = () => {
      observer?.disconnect();
      const navBottom = document.querySelector("[data-site-nav]")?.getBoundingClientRect().bottom ?? 0;
      observer = new IntersectionObserver(([entry]) => {
        setHeroControlsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.99);
      }, { threshold: [0, 0.99, 1], rootMargin: `-${Math.max(0, navBottom)}px 0px 0px 0px` });
      observer.observe(heroControls);
    };
    observe();
    window.addEventListener("resize", observe);
    const nav = document.querySelector("[data-site-nav]");
    const navResize = new ResizeObserver(observe);
    if (nav) navResize.observe(nav);
    return () => {
      observer.disconnect();
      navResize.disconnect();
      window.removeEventListener("resize", observe);
    };
  }, [heroControls]);

  const startMusic = useCallback(() => {
    const music = musicRef.current;
    if (!music || dialogRef.current?.open) return;
    const voicePlaying = Array.from(document.querySelectorAll<HTMLMediaElement>("audio, video"))
      .some((media) => media !== music && !media.paused && !media.ended && !media.muted);
    music.volume = voicePlaying ? 0.1 : 0.5;
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
    // Called from a user gesture when skipping; browsers may still require the music button after autoplay.
    if (enabledRef.current) startMusic();
  }

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;
    try { enabledRef.current = localStorage.getItem(MUSIC_KEY) !== "false"; } catch { enabledRef.current = true; }
    const otherAudio = new Set<HTMLMediaElement>();
    const updateVolume = (event: Event) => {
      const media = event.target;
      if (!(media instanceof HTMLMediaElement) || media === music) return;
      if (media.paused || media.ended || media.muted) otherAudio.delete(media);
      else otherAudio.add(media);
      for (const active of otherAudio) {
        if (!active.isConnected || active.paused || active.ended || active.muted) otherAudio.delete(active);
      }
      music.volume = otherAudio.size ? 0.1 : 0.5;
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
      music.pause();
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
      <audio ref={musicRef} src="/assets/totem-music.mp3" loop preload="none"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onError={() => { setPlaying(false); setError(true); }} />
      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2" data-floating-music>
        {error && <p role="status" className="bg-nuit px-3 py-2 text-sm text-ivoire">{copy.audioError}</p>}
        {showFloatingMusic && <MusicButton copy={copy} className="shadow-lg" />}
      </div>
      <dialog ref={dialogRef} aria-labelledby="totem-intro-title"
        onCancel={(event) => { event.preventDefault(); finishIntro(); }}
        className="totem-intro m-0 h-dvh max-h-none w-screen max-w-none bg-nuit p-0 text-ivoire backdrop:bg-nuit">
        <h2 id="totem-intro-title" className="sr-only">{copy.introTitle}</h2>
        <video ref={introRef} src="/assets/intro/totem-intro.mp4" muted={introMuted} playsInline preload="none"
          onPlay={() => setIntroPlaying(true)} onPause={() => setIntroPlaying(false)}
          onEnded={finishIntro} onError={finishIntro} className="h-full w-full object-contain" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-3 bg-nuit/90 p-6">
          <button type="button" onClick={() => {
            const video = introRef.current;
            if (!video) return;
            if (video.paused) void video.play().catch(() => {});
            else video.pause();
          }} className="border border-or px-5 py-3">{introPlaying ? copy.pauseVideo : copy.playVideo}</button>
          <button type="button" onClick={() => {
            const video = introRef.current;
            if (!video) return;
            video.muted = !video.muted;
            setIntroMuted(video.muted);
            if (video.paused) void video.play().catch(() => {});
          }} className="border border-or px-5 py-3">{introMuted ? copy.soundOn : copy.soundOff}</button>
          <button type="button" onClick={finishIntro} autoFocus className="border border-or bg-or px-5 py-3 text-nuit">{copy.skipIntro}</button>
        </div>
      </dialog>
    </AmbientMusicContext.Provider>
  );
}
