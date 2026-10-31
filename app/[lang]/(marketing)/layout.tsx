import Nav from "@/components/sections/Nav";
import { interfaceCopy } from "@/lib/interface-copy";
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
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:border focus:border-or focus:bg-nuit focus:px-4 focus:py-2 focus:text-ivoire"
      >
        {interfaceCopy(locale).navigation.skip}
      </a>
      <Nav lang={locale} dict={dict} />
      <main id="main-content" data-site-presentation tabIndex={-1} className="scroll-mt-24 focus-visible:outline-2 focus-visible:outline-or">{children}</main>
      <Footer dict={dict.footer} lang={locale} />
    </>
  );
}
