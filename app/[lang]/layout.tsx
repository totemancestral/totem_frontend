import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales } from "./dictionaries";
import { getServerEnv } from "@/lib/env";
import "../globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "fr";
  const dict = await getDictionary(locale);
  const siteUrl = (getServerEnv().NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const ogLocale = locale === "en" ? "en_US" : "fr_FR";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: dict.seo.defaultTitle,
      template: `%s — ${dict.seo.siteName}`,
    },
    description: dict.seo.defaultDescription,
    openGraph: {
      type: "website",
      siteName: dict.seo.siteName,
      title: dict.seo.defaultTitle,
      description: dict.seo.ogDescription,
      locale: ogLocale,
      url: `/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.seo.defaultTitle,
      description: dict.seo.ogDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Pré-génère les deux versions du site à la compilation (une par langue).
export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Si quelqu'un visite une URL avec une langue qu'on ne gère pas
  // (ex: /de), on affiche une vraie page 404 plutôt qu'une erreur.
  if (!hasLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      className={`${cormorantGaramond.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
