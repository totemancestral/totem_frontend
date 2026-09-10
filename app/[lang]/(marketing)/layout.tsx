import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getDictionary, type Locale } from "../dictionaries";

export default async function MarketingLayout({
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
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-or focus:bg-nuit focus:px-4 focus:py-2 focus:text-ivoire"
      >
        Aller au contenu
      </a>
      <Nav lang={locale} dict={dict} />
      <main id="main-content">{children}</main>
      <Footer dict={dict.footer} lang={locale} />
    </>
  );
}
