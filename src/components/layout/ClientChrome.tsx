"use client";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AmbientAudio } from "@/components/AmbientAudio";
import { CookieConsent } from "@/components/CookieConsent";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

type Locale = "fr" | "en";

export function ClientChrome({ children, locale }: { children: ReactNode; locale: Locale }) {
  const pathname = usePathname();
  const isDashboard = Boolean(pathname?.includes("/domus_animi"));

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
      <Header locale={locale} />
      <main style={{ maxWidth: "100%", overflowX: "clip" }}>{children}</main>
      {!isDashboard && <Footer locale={locale} />}
      <AmbientAudio active />
      <CookieConsent />
    </div>
  );
}
