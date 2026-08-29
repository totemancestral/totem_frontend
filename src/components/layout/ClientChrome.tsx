"use client";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { IntroVideo } from "@/components/IntroVideo";
import { AmbientAudio } from "@/components/AmbientAudio";
import { CookieConsent } from "@/components/CookieConsent";
import { MaintenanceCover } from "@/components/MaintenanceCover";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

type Locale = "fr" | "en";

export function ClientChrome({ children, locale }: { children: ReactNode; locale: Locale }) {
  const pathname = usePathname();
  const isDashboard = Boolean(pathname?.includes("/domus_animi"));
  // L'intro precede l'entree sur le site : elle est montee ici, au-dessus de
  // toute l'application. Dans HomePage elle restait prisonniere du contexte
  // d'empilement de .liquid-home-shell (isolation: isolate) et le header du
  // site s'affichait par-dessus.
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div
      style={{
        background: "var(--nuit-profonde)",
        minHeight: "100vh",
        maxWidth: "100%",
        overflowX: "clip",
      }}
    >
      <MaintenanceCover locale={locale} />
      {isHome && <IntroVideo />}
      <Header locale={locale} />
      <main style={{ maxWidth: "100%", overflowX: "clip" }}>{children}</main>
      {!isDashboard && <Footer locale={locale} />}
      <AmbientAudio active />
      <CookieConsent />
      <Toaster richColors position="top-right" />
    </div>
  );
}
