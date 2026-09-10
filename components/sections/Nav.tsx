"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import Link from "next/link";
import type { Locale, getDictionary } from "@/app/[lang]/dictionaries";

type NavProps = {
  lang: Locale;
  dict: Awaited<ReturnType<typeof getDictionary>>;
};

export default function Nav({ lang, dict }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // L'URL actuelle (ex: "/fr/offres"), pour savoir quel lien est "actif".
  const pathname = usePathname();
  const offresIsActive = pathname === `/${lang}/offres`;

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Une fois le menu ouvert, la nav bascule en ivoire quoi qu'il arrive,
  // pour rester cohérente avec le panneau plein écran en dessous.
  const isLight = scrolled || menuOpen;

  // Appelé par chaque lien du panneau mobile : referme le menu, puisque
  // Nav reste monté (il vit dans le layout partagé) et ne se réinitialise
  // pas tout seul quand on change de page.
  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 z-50 flex w-full items-center justify-between px-6 py-7 transition-colors duration-300 lg:px-16 ${
          isLight ? "bg-ivoire text-nuit" : "bg-transparent text-ivoire"
        }`}
      >
        <Brand lang={lang} size={50} textClassName="" />

        {/* contenu complet : caché sur mobile, visible à partir de lg */}
        <div className="hidden items-center gap-9 lg:flex">
          <Link
            href={`/${lang}/offres`}
            className={`text-xs uppercase tracking-wide ${
              offresIsActive
                ? "border-b border-or text-or"
                : isLight
                  ? "text-gris"
                  : "text-grisclair"
            }`}
          >
            {dict.nav.links.offres}
          </Link>
          <Link
            href={`/${lang}/la-maison`}
            className={`text-xs uppercase tracking-wide ${
              pathname === `/${lang}/la-maison`
                ? "border-b border-or text-or"
                : isLight
                  ? "text-gris"
                  : "text-grisclair"
            }`}
          >
            {dict.nav.links.maison}
          </Link>
          <Link
            href={`/${lang}/faq`}
            className={`text-xs uppercase tracking-wide ${
              pathname === `/${lang}/faq`
                ? "border-b border-or text-or"
                : isLight
                  ? "text-gris"
                  : "text-grisclair"
            }`}
          >
            {dict.nav.links.faq}
          </Link>
          <div className={`flex items-center gap-1.5 text-xs ${isLight ? "text-gris" : "text-grisclair"}`}>
            <Link href="/fr" className={lang === "fr" ? "font-medium" : "opacity-50"}>
              FR
            </Link>
            <span className="opacity-50">·</span>
            <Link href="/en" className={lang === "en" ? "font-medium" : "opacity-50"}>
              EN
            </Link>
          </div>
          <Button
            variant="outline"
            href={`/${lang}/inscription`}
            className={isLight ? "text-nuit!" : ""}
          >
            {dict.nav.compose}
          </Button>
        </div>

        {/* hamburger / croix : visible uniquement sur mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative flex h-6 w-6 flex-col items-center justify-center lg:hidden"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {menuOpen ? (
            <>
              <span
                className={`absolute h-px w-6 rotate-45 ${isLight ? "bg-nuit" : "bg-ivoire"}`}
              />
              <span
                className={`absolute h-px w-6 -rotate-45 ${isLight ? "bg-nuit" : "bg-ivoire"}`}
              />
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className={`h-px w-6 ${isLight ? "bg-nuit" : "bg-ivoire"}`} />
              <span className={`h-px w-6 ${isLight ? "bg-nuit" : "bg-ivoire"}`} />
              <span className={`h-px w-6 ${isLight ? "bg-nuit" : "bg-ivoire"}`} />
            </div>
          )}
        </button>
      </nav>

      {/* panneau mobile plein écran : couvre tout le reste de la page tant qu'il est ouvert */}
      {menuOpen && (
        <div className="fixed inset-0 top-[76px] z-40 flex flex-col gap-6 overflow-y-auto bg-ivoire p-8 text-nuit lg:hidden">
          <Link
            href={`/${lang}/offres`}
            onClick={closeMenu}
            className={`text-sm uppercase tracking-wide ${offresIsActive ? "text-or" : "text-gris"}`}
          >
            {dict.nav.links.offres}
          </Link>
          <Link
            href={`/${lang}/la-maison`}
            onClick={closeMenu}
            className={`text-sm uppercase tracking-wide ${pathname === `/${lang}/la-maison` ? "text-or" : "text-gris"}`}
          >
            {dict.nav.links.maison}
          </Link>
          <Link
            href={`/${lang}/faq`}
            onClick={closeMenu}
            className={`text-sm uppercase tracking-wide ${pathname === `/${lang}/faq` ? "text-or" : "text-gris"}`}
          >
            {dict.nav.links.faq}
          </Link>
          <div className="flex items-center gap-1.5 text-sm text-gris">
            <Link href="/fr" onClick={closeMenu} className={lang === "fr" ? "font-medium" : "opacity-50"}>
              FR
            </Link>
            <span className="opacity-50">·</span>
            <Link href="/en" onClick={closeMenu} className={lang === "en" ? "font-medium" : "opacity-50"}>
              EN
            </Link>
          </div>
          <Button variant="outline" href={`/${lang}/inscription`} onClick={closeMenu} className="text-nuit!">
            {dict.nav.compose}
          </Button>
        </div>
      )}
    </>
  );
}
