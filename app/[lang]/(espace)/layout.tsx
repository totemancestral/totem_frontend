import type { Metadata } from "next";
import EspaceNav from "@/components/sections/EspaceNav";
import { getDictionary, type Locale } from "../dictionaries";

// L'espace personnel exige une session : aucune valeur de référencement, et
// ces pages contiennent des données propres à chaque utilisateur.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function EspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return (
    <EspaceNav lang={locale} dict={dict.espaceNav}>
      {children}
    </EspaceNav>
  );
}
