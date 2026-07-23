export function MaskLogo({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 80 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="maskGold" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0%" stopColor="var(--or-pale)" />
           <stop offset="100%" stopColor="var(--or-ancestral)" />
        </linearGradient>
        <radialGradient id="maskGlow" cx="50%" cy="40%" r="60%">
           <stop offset="0%" stopColor="var(--or-ancestral)" stopOpacity="0.18" />
           <stop offset="100%" stopColor="var(--or-ancestral)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="48" r="42" fill="url(#maskGlow)" />
      {/* Mask elongated oval — inspired by Ngil/Fang */}
      <path
        d="M40 4 C56 4 64 22 64 50 C64 78 54 104 40 104 C26 104 16 78 16 50 C16 22 24 4 40 4 Z"
        stroke="url(#maskGold)"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Forehead chevrons */}
      <path d="M28 22 L40 16 L52 22" stroke="url(#maskGold)" strokeWidth="1" fill="none" />
      <path d="M30 28 L40 23 L50 28" stroke="url(#maskGold)" strokeWidth="0.8" fill="none" />
      {/* Vertical bridge */}
      <line x1="40" y1="32" x2="40" y2="78" stroke="url(#maskGold)" strokeWidth="0.8" />
      {/* Eye slits */}
      <path
        d="M26 44 Q31 41 36 44"
        stroke="url(#maskGold)"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M44 44 Q49 41 54 44"
        stroke="url(#maskGold)"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      {/* Cheek scarification */}
      <path d="M22 58 L30 62" stroke="url(#maskGold)" strokeWidth="0.7" />
      <path d="M22 64 L29 67" stroke="url(#maskGold)" strokeWidth="0.7" />
      <path d="M58 58 L50 62" stroke="url(#maskGold)" strokeWidth="0.7" />
      <path d="M58 64 L51 67" stroke="url(#maskGold)" strokeWidth="0.7" />
      {/* Mouth */}
      <ellipse
        cx="40"
        cy="82"
        rx="5"
        ry="2.5"
        stroke="url(#maskGold)"
        strokeWidth="0.9"
        fill="none"
      />
      {/* Chin notch */}
      <path d="M36 96 L40 100 L44 96" stroke="url(#maskGold)" strokeWidth="0.8" fill="none" />
    </svg>
  );
}
