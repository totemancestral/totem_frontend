import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { hasLocale } from "next-intl";
import type { ReactNode } from "react";

import { ClientChrome } from "@/components/layout/ClientChrome";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Totem Ancestral - Le portrait imaginaire de l'Africain que vous auriez pu être",
  description:
    "Une œuvre numérique unique, assistée par intelligence artificielle, inspirée des cosmogonies africaines.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ClientChrome locale={locale}>{children}</ClientChrome>
    </NextIntlClientProvider>
  );
}
