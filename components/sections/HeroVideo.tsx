"use client";
import { useRef, useState } from "react";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  function toggleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  }

  function togglePlay() {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  }

  return (
    <>
      {/* fond vidéo : occupe tout le conteneur parent (le Hero doit être "relative") */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/hero.mp4"
      />
      {/* voile sombre pour garder le texte lisible par-dessus la vidéo */}
      <div className="absolute inset-0 bg-nuit/40" />

      {/* contrôles : en bas à gauche sur mobile (sous le texte, grâce au padding
          bas du Hero), repositionnés en bas à droite à partir de lg */}
      <div className="absolute bottom-2 left-6 z-20 flex gap-3 lg:bottom-6 lg:left-auto lg:right-6">
        <button
          onClick={toggleMute}
          aria-label={muted ? "Activer le son" : "Couper le son"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ombre bg-nuit/60 text-ivoire"
        >
          {muted ? (
            // haut-parleur barré
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9v6h4l5 5V4L7 9H3z" />
              <line x1="16" y1="9" x2="22" y2="15" />
              <line x1="22" y1="9" x2="16" y2="15" />
            </svg>
          ) : (
            // haut-parleur avec ondes sonores
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9v6h4l5 5V4L7 9H3z" />
              <path d="M16 8a5 5 0 0 1 0 8" />
              <path d="M19 5a9 9 0 0 1 0 14" />
            </svg>
          )}
        </button>

        <button
          onClick={togglePlay}
          aria-label={playing ? "Mettre en pause" : "Lire"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ombre bg-nuit/60 text-ivoire"
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
