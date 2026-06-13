"use client";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CookieConsent } from "@/components/CookieConsent";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

type Locale = "fr" | "en";

export function ClientChrome({ children, locale }: { children: ReactNode; locale: Locale }) {
  const pathname = usePathname();

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
      <Footer locale={locale} />
      <CookieConsent />
    </div>
  );
}
