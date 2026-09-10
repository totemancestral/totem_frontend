import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

type BrandProps = {
  lang: string;
  size?: number;
  className?: string;
  textClassName?: string;
};

// Le bloc "masque + TOTEM ANCESTRAL" tel qu'il apparaît dans la nav :
// même typographie partout sur le site (font-body, tracking large,
// majuscules), et toujours cliquable vers l'accueil.
export function Brand({ lang, size = 22, className = "", textClassName = "text-ivoire" }: BrandProps) {
  return (
    <Link href={`/${lang}`} className={`flex items-center gap-3 ${className}`}>
      <Logo size={size} />
      <span className={`font-body text-xs tracking-[0.50em] uppercase ${textClassName}`}>
        Totem Ancestral
      </span>
    </Link>
  );
}
