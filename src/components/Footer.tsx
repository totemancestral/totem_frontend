import Link from "next/link";
import { useTranslations } from "next-intl";
import { MaskLogo } from "./MaskLogo";

type Locale = "fr" | "en";

export function Footer({ locale }: { locale: Locale }) {
  const brand = useTranslations("brand");
  const t = useTranslations("footer");

  return (
    <footer
      className="px-5 pb-12 pt-20 md:px-10"
      style={{ background: "var(--nuit-profonde)", borderTop: "1px solid rgba(201,168,76,0.12)" }}
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center text-center gap-6">
          <MaskLogo size={44} />
          <div className="logo-wordmark text-sm md:text-base">{brand("name")}</div>
          <p className="quote-italic text-base md:text-lg max-w-xl">{t("tagline")}</p>

          <nav className="subtext flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-6 text-[12px] tracking-[0.16em] uppercase">
            <Link href={`/${locale}/#experience`} style={{ color: "var(--ivoire)" }}>
              {t("nav.experience")}
            </Link>
            <Link href={`/${locale}/#offres`} style={{ color: "var(--ivoire)" }}>
              {t("nav.offers")}
            </Link>
            <Link href={`/${locale}/#maison`} style={{ color: "var(--ivoire)" }}>
              {t("nav.about")}
            </Link>
            <Link href={`/${locale}/#faq`} style={{ color: "var(--ivoire)" }}>
              FAQ
            </Link>
            <Link href={`/${locale}/#contact`} style={{ color: "var(--ivoire)" }}>
              Contact
            </Link>
          </nav>

          <nav className="subtext flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-2 text-[12px]">
            <Link href={`/${locale}/lex_mercatoria`} style={{ color: "#888" }}>
              CGV
            </Link>
            <Link href={`/${locale}/arcanum_privata`} style={{ color: "#888" }}>
              {t("legal.privacy")}
            </Link>
            <Link href={`/${locale}/notitia_legalis`} style={{ color: "#888" }}>
              {t("legal.mentions")}
            </Link>
          </nav>

          <div
            className="text-2xl mt-8 tracking-[0.4em]"
            style={{ color: "var(--or-pale)" }}
            aria-hidden="true"
          >
            ✦
          </div>

          <p className="caption max-w-2xl leading-relaxed mt-2">
            {t("copyright")}
            <br />
            {t("studioLine")}
          </p>
        </div>
      </div>
    </footer>
  );
}
