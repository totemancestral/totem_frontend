"use client";
import { useEffect, useRef, useState } from "react";
import { useAmbientMusic } from "@/lib/hooks/useAmbientMusic";
import { MusicButton } from "@/components/ui/MusicButton";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export default function HeroVideo({ copy }: { copy: Dictionary["media"] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setHeroControls } = useAmbientMusic();
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const video = videoRef.current;
    if (video && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      void video.play().catch(() => {});
    }
    return () => video?.pause();
  }, []);

  function togglePlay() {
    if (!videoRef.current) return;
    if (!videoRef.current.paused) {
      videoRef.current.pause();
    } else {
      void videoRef.current.play().catch(() => {});
    }
  }

  return (
    <>
      {/* fond vidéo : occupe tout le conteneur parent (le Hero doit être "relative") */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 h-full w-full object-cover"
        src="/assets/totem-intro.mp4"
      />
      {/* voile sombre pour garder le texte lisible par-dessus la vidéo */}
      <div className="absolute inset-0 bg-nuit/40" />

      {/* contrôles : en bas à gauche sur mobile (sous le texte, grâce au padding
          bas du Hero), repositionnés en bas à droite à partir de lg */}
      <div ref={setHeroControls} data-hero-controls className="absolute bottom-6 left-6 z-20 flex gap-3 lg:left-auto lg:right-6">
        <MusicButton copy={copy} />

        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? copy.pauseVideo : copy.playVideo}
          title={playing ? copy.pauseVideo : copy.playVideo}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-nuit/70 text-ivoire transition-colors hover:bg-nuit/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-or"
        >
          {playing ? (
            // pause : deux barres
            <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
              <rect x="1" y="0" width="4" height="16" />
              <rect x="9" y="0" width="4" height="16" />
            </svg>
          ) : (
            // lecture : triangle
            <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
              <polygon points="0,0 14,8 0,16" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
