import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { hasLocale } from "next-intl";
import type { ReactNode } from "react";

import { ClientChrome } from "@/components/layout/ClientChrome";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Totem Ancestral · L'Africain que vous auriez pu être, enfin révélé",
  description:
    "Une œuvre unique, tissée dans la langue des origines. Répondez à l'appel du griot, recevez le portrait de votre ancêtre qui est en vous, votre ancêtre qui n'est jamais parti.",
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
