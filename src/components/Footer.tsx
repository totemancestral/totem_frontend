import Link from "next/link";
import { useTranslations } from "next-intl";

type Locale = "fr" | "en";

export function Footer({ locale }: { locale: Locale }) {
  const brand = useTranslations("brand");
  const t = useTranslations("footer");
  const composeHref = `/${locale}/janua_vitae?mode=signup&redirect=${encodeURIComponent(`/${locale}/via_sapientiae?restart=1`)}`;
  const labels =
    locale === "en"
      ? { experience: "Experience", order: "Order", legal: "Legal" }
      : { experience: "Expérience", order: "Commander", legal: "Légal" };

  return (
    <footer
      className="border-t px-5 py-20 md:px-10 md:py-28"
      style={{ background: "var(--nuit-profonde)", borderColor: "rgba(216,173,77,0.18)" }}
    >
      <div className="mx-auto grid max-w-[1200px] gap-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-4">
            <img src="/assets/totem-logo.png" alt="" className="h-12 w-12 object-contain" />
            <div className="h-display text-4xl uppercase" style={{ color: "var(--ivoire)" }}>
              {brand("name")}
            </div>
          </div>
          <p
            className="body-copy mt-8 max-w-sm text-[15px]"
            style={{ color: "rgba(226,225,238,0.72)" }}
          >
            {t("tagline")} {t("studioLine")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10">
          <nav className="space-y-5">
            <p className="eyebrow" style={{ color: "rgba(216,173,77,0.72)" }}>
              {labels.experience}
            </p>
            <Link
              className="block text-sm transition-colors hover:text-or"
              href={composeHref}
              style={{ color: "rgba(226,225,238,0.76)" }}
            >
              {labels.order}
            </Link>
            <Link
              className="block text-sm transition-colors hover:text-or"
              href={`/${locale}/#offres`}
              style={{ color: "rgba(226,225,238,0.76)" }}
            >
              {t("nav.offers")}
            </Link>
            <Link
              className="block text-sm transition-colors hover:text-or"
              href={`/${locale}/#faq`}
              style={{ color: "rgba(226,225,238,0.76)" }}
            >
              FAQ
            </Link>
          </nav>

          <nav className="space-y-5">
            <p className="eyebrow" style={{ color: "rgba(216,173,77,0.72)" }}>
              {labels.legal}
            </p>
            <Link
              className="block text-sm transition-colors hover:text-or"
              href={`/${locale}/lex_mercatoria`}
              style={{ color: "rgba(226,225,238,0.76)" }}
            >
              CGV
            </Link>
            <Link
              className="block text-sm transition-colors hover:text-or"
              href={`/${locale}/arcanum_privata`}
              style={{ color: "rgba(226,225,238,0.76)" }}
            >
              {t("legal.privacy")}
            </Link>
            <Link
              className="block text-sm transition-colors hover:text-or"
              href={`/${locale}/notitia_legalis`}
              style={{ color: "rgba(226,225,238,0.76)" }}
            >
              {t("legal.mentions")}
            </Link>
          </nav>
        </div>

        <div className="flex items-end md:justify-end">
          <p className="caption max-w-xs md:text-right">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
