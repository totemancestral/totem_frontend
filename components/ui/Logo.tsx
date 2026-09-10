type LogoProps = {
  size?: number;
  className?: string;
};

// Le masque doré, remplace l'ancien pictogramme SVG dessiné à la main partout
// où il accompagnait le nom "Totem Ancestral".
export function Logo({ size = 60, className = "" }: LogoProps) {
  return (
    <img
      src="/images/logo_totem_1.svg"
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}
