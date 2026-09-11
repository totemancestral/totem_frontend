"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";

type Props = {
  lang: Locale;
  dict: Dictionary["espaceNav"];
  children: ReactNode;
};

export default function EspaceNav({ lang, dict, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Tout l'espace personnel exige une session valide.
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      if (!data.session) {
        router.replace(`/${lang}/connexion?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      setCheckingAuth(false);
    });
    return () => {
      alive = false;
    };
  }, [lang, pathname, router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace(`/${lang}`);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  if (checkingAuth) {
    return <div className="min-h-screen bg-nuit" />;
  }

  const tabs = [
    {
      label: dict.navAccueil,
      href: `/${lang}/espace`,
      active: pathname === `/${lang}/espace`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M1 7 8 1l7 6" />
          <path d="M3 6v9h10V6" />
        </svg>
      ),
    },
    {
      label: dict.navCommandes,
      href: `/${lang}/commandes`,
      active: pathname === `/${lang}/commandes`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
          <rect x="1.5" y="4" width="13" height="10.5" />
          <path d="M1.5 4 8 0.5 14.5 4" />
          <path d="M1.5 4 8 7.5 14.5 4" />
          <line x1="8" y1="7.5" x2="8" y2="14.5" />
        </svg>
      ),
    },
    {
      label: dict.navOeuvres,
      href: `/${lang}/oeuvres`,
      active: pathname === `/${lang}/oeuvres`,
      icon: (
        <svg width="16" height="18" viewBox="0 0 200 320" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round">
          <polygon points="100,8 145,36 162,120 152,190 130,255 100,312 70,255 48,190 38,120 55,36" />
        </svg>
      ),
    },
    {
      label: dict.navConsultations,
      href: `/${lang}/consultations`,
      active: pathname === `/${lang}/consultations`,
      icon: (
        <div className="relative h-[12px] w-[18px]">
          <Image
            src="/images/cauris_site_trimmed.png"
            alt=""
            fill
            sizes="18px"
            className={`object-contain contrast-[1.1] saturate-[1.15] ${
              pathname === `/${lang}/consultations` ? "brightness-110" : "opacity-60 grayscale"
            }`}
          />
        </div>
      ),
    },
    {
      label: dict.navProfil,
      href: `/${lang}/profil`,
      active: pathname === `/${lang}/profil`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
          <circle cx="8" cy="5" r="3" />
          <path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-nuit">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-or focus:bg-nuit focus:px-4 focus:py-2 focus:text-ivoire"
      >
        Aller au contenu
      </a>
      {/* barre du haut : fixe. Bordure pleine largeur, contenu recentré dans
          une colonne — comme le reste du site, mais avec une marge un peu
          plus généreuse (dashboard = besoin de plus de respiration). */}
      <div className="shrink-0 border-b border-ombre">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-24">
          <Brand lang={lang} size={20} />

          {/* liens de droite : réservés au bureau */}
          <div className="hidden items-center gap-7 lg:flex">
            <div className="flex items-center gap-1.5 text-xs text-grisclair">
              <Link href="/fr" className={lang === "fr" ? "font-medium text-ivoire" : ""}>FR</Link>
              <span>·</span>
              <Link href="/en" className={lang === "en" ? "font-medium text-ivoire" : ""}>EN</Link>
            </div>
            <button onClick={logout} className="text-xs uppercase tracking-[0.14em] text-grisclair">
              {dict.logout}
            </button>
          </div>

          {/* hamburger / croix : visible uniquement sur mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative flex h-6 w-6 flex-col items-center justify-center lg:hidden"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? (
              <>
                <span className="absolute h-px w-6 rotate-45 bg-ivoire" />
                <span className="absolute h-px w-6 -rotate-45 bg-ivoire" />
              </>
            ) : (
              <div className="flex flex-col gap-1.5">
                <span className="h-px w-6 bg-ivoire" />
                <span className="h-px w-6 bg-ivoire" />
                <span className="h-px w-6 bg-ivoire" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* corps : même rail centré que la barre du haut (max-w-7xl), pour que
          la sidebar s'aligne et se déplace avec la même marge que le reste
          du site, au lieu de rester collée au bord de l'écran. */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto flex h-full max-w-7xl overflow-hidden px-0 lg:px-24">
          {/* sidebar : à onglets, réservée au bureau, fixe sur toute la hauteur du rail */}
          <aside className="hidden w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-ombre bg-indigo lg:flex">
            <nav className="flex flex-col gap-1 p-6">
              {tabs.map((tab) => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`flex items-center gap-3 border-l-2 py-2.5 pl-4 pr-3 text-sm font-medium ${
                    tab.active ? "border-or text-ivoire" : "border-transparent text-grisclair"
                  }`}
                >
                  <span className={tab.active ? "text-or" : "text-grisclair"}>{tab.icon}</span>
                  {tab.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-ombre p-6">
              <Button variant="outline" href={`/${lang}/offres`} className="w-full px-4! py-3! text-center text-sm">
                {dict.composeButton}
              </Button>
            </div>
          </aside>

          {/* contenu de l'onglet actif : seule zone qui défile */}
          <main id="main-content" className="min-w-0 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* panneau mobile plein écran : remplace la nav basse sur petit écran */}
      {menuOpen && (
        <div className="fixed inset-0 top-[76px] z-40 flex flex-col justify-between overflow-y-auto bg-nuit p-8 lg:hidden">
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                onClick={closeMenu}
                className={`flex items-center gap-4 border-b border-ombre py-4 text-base font-medium ${
                  tab.active ? "text-or" : "text-ivoire"
                }`}
              >
                <span className={tab.active ? "text-or" : "text-grisclair"}>{tab.icon}</span>
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <Button variant="outline" href={`/${lang}/offres`} onClick={closeMenu} className="w-full">
              {dict.composeButton}
            </Button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-grisclair">
                <Link href="/fr" onClick={closeMenu} className={lang === "fr" ? "font-medium text-ivoire" : ""}>FR</Link>
                <span>·</span>
                <Link href="/en" onClick={closeMenu} className={lang === "en" ? "font-medium text-ivoire" : ""}>EN</Link>
              </div>
              <button
                onClick={() => {
                  closeMenu();
                  logout();
                }}
                className="text-xs uppercase tracking-[0.14em] text-grisclair"
              >
                {dict.logout}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
