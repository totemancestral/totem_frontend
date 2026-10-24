"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useNavigationOverlay } from "@/lib/hooks/useNavigationOverlay";
import { interfaceCopy } from "@/lib/interface-copy";
import type { Locale, getDictionary } from "@/app/[lang]/dictionaries";

type NavProps = {
  lang: Locale;
  dict: Awaited<ReturnType<typeof getDictionary>>;
};

export default function Nav({ lang, dict }: NavProps) {
  const ui = interfaceCopy(lang);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [hidden, setHidden] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useNavigationOverlay(menuOpen, navRef, menuRef, menuButtonRef, setMenuOpen);
  // L'URL actuelle (ex: "/fr/offres"), pour savoir quel lien est "actif".
  const pathname = usePathname();
  const offresIsActive = pathname === `/${lang}/offres`;

  useEffect(() => {
    let lastY = window.scrollY;
    let movement = 0;
    let frame = 0;
    function handleScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = Math.max(0, window.scrollY);
        const delta = y - lastY;
        movement = Math.sign(delta) === Math.sign(movement) ? movement + delta : delta;
        setScrolled(y > 60);
        const keyboardFocus = navRef.current?.contains(document.activeElement)
          && document.activeElement?.matches(":focus-visible");
        if (y <= 80 || menuOpen || keyboardFocus) setHidden(false);
        else if (Math.abs(movement) >= 8) setHidden(movement > 0);
        lastY = y;
      });
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen, pathname]);

  // Permet au bouton "Composer" de se muer en "Mon espace" pour quelqu'un
  // déjà connecté, plutôt que de le renvoyer vers une inscription qu'il a
  // déjà faite.
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setLoggedIn(Boolean(data.session));
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session));
    });
    return () => {
      alive = false;
      subscription.subscription.unsubscribe();
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
        ref={navRef}
        data-site-nav
        data-nav-hidden={hidden && !menuOpen}
        aria-label={ui.navigation.main}
        onFocusCapture={() => setHidden(false)}
        className={`fixed top-0 left-0 z-50 flex h-[68px] w-full items-center justify-between px-6 transition-[transform,background-color,color] duration-300 motion-reduce:transition-none lg:h-20 lg:px-16 ${hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"} ${
          isLight ? "bg-ivoire text-nuit" : "bg-transparent text-ivoire"
        }`}
      >
        <Brand lang={lang} size={40} textClassName="text-[10px]! tracking-[0.28em]! sm:text-xs! sm:tracking-[0.50em]!" />

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
            href={loggedIn ? `/${lang}/espace` : `/${lang}/inscription`}
            className={isLight ? "text-nuit!" : ""}
          >
            {loggedIn ? dict.nav.mySpace : dict.nav.compose}
          </Button>
        </div>

        {/* hamburger / croix : visible uniquement sur mobile */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative flex h-11 w-11 shrink-0 flex-col items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-or lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="site-mobile-menu"
          aria-label={menuOpen ? ui.navigation.closeMenu : ui.navigation.openMenu}
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
        <div ref={menuRef} id="site-mobile-menu" role="navigation" aria-label={ui.navigation.mobile} className="fixed inset-0 top-[68px] z-40 flex flex-col gap-6 overflow-y-auto bg-ivoire p-8 text-nuit lg:hidden">
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
          <Button
            variant="outline"
            href={loggedIn ? `/${lang}/espace` : `/${lang}/inscription`}
            onClick={closeMenu}
            className="text-nuit!"
          >
            {loggedIn ? dict.nav.mySpace : dict.nav.compose}
          </Button>
        </div>
      )}
    </>
  );
}
