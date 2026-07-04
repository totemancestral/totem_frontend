/** Sceau / insigne rond rouge & or "TA" (Totem Ancestral). */
export function Seal({ size = 84 }: { size?: number }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 35% 30%, #9e1b13, #6e120c 70%)",
        border: "3px solid var(--gold)",
        boxShadow:
          "0 4px 14px rgba(0,0,0,0.4), inset 0 0 12px rgba(0,0,0,0.35), 0 0 0 1px var(--gold-dark)",
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          inset: size * 0.11,
          border: "1px dashed rgba(232,193,90,0.7)",
        }}
      />
      <span
        className="font-serif font-bold leading-none"
        style={{
          color: "var(--gold-light)",
          fontSize: size * 0.42,
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          letterSpacing: "0.02em",
        }}
      >
        TA
      </span>
    </div>
  );
}
