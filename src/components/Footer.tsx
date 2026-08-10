import Link from "next/link";
import { useTranslations } from "next-intl";
import { authPath, pagePath } from "@/lib/routes";
import { LEGAL, legalAddress } from "@/lib/legal";

type Locale = "fr" | "en";

export function Footer({ locale }: { locale: Locale }) {
  const brand = useTranslations("brand");
  const t = useTranslations("footer");
  const composeHref = authPath(locale, "signup", `/${locale}/via_sapientiae?restart=1`);
  const year = new Date().getFullYear();
  const labels =
    locale === "en"
      ? {
          order: "Order",
          offers: "Offers",
          faq: "FAQ",
          cgv: "Terms",
          privacy: "Privacy",
          mentions: "Legal notice",
          contact: "Contact",
        }
      : {
          order: "Commander",
          offers: "Offres",
          faq: "FAQ",
          cgv: "CGV",
          privacy: "Confidentialité",
          mentions: "Mentions",
          contact: "Contact",
        };

  return (
    <footer
      className="border-t px-5 py-8 md:px-10 md:py-10"
      style={{ background: "var(--nuit-profonde)", borderColor: "rgba(216,173,77,0.14)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          {/* Marque */}
          <Link href={`/${locale}`} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/totem-logo.png" alt="" className="h-9 w-9 object-contain" />
            <div
              className="h-display text-xl uppercase tracking-wide"
              style={{ color: "var(--ivoire)" }}
            >
              {brand("name")}
            </div>
          </Link>

          {/* Nav compacte */}
          <nav
            className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs uppercase"
            style={{ letterSpacing: "0.08em" }}
          >
            <Link href={composeHref} className="footer-link">
              {labels.order}
            </Link>
            <Link href={`/${locale}#offres`} className="footer-link">
              {labels.offers}
            </Link>
            <Link href={`/${locale}#faq`} className="footer-link">
              {labels.faq}
            </Link>
            <Link href={pagePath(locale, "contact")} className="footer-link">
              {labels.contact}
            </Link>
            <span
              aria-hidden="true"
              className="h-3 w-px"
              style={{ background: "rgba(216,173,77,0.28)" }}
            />
            <Link href={pagePath(locale, "cgv")} className="footer-link">
              {labels.cgv}
            </Link>
            <Link href={pagePath(locale, "confidentialite")} className="footer-link">
              {labels.privacy}
            </Link>
            <Link href={pagePath(locale, "mentions")} className="footer-link">
              {labels.mentions}
            </Link>
          </nav>
        </div>

        {/* Identification de l'editeur — mentions obligatoires (art. 6 LCEN),
            alimentees par la source unique src/lib/legal.ts. */}
        <address
          className="caption not-italic border-t pt-4 leading-relaxed"
          style={{ borderColor: "rgba(216,173,77,0.10)", color: "rgba(226,225,238,0.45)" }}
        >
          <strong style={{ color: "rgba(226,225,238,0.62)", fontWeight: 600 }}>
            {LEGAL.company}
          </strong>
          , {LEGAL.form} au capital de {LEGAL.capital} · Siège social : {legalAddress()}
          <br />
          {locale === "en" ? "Registration" : "Immatriculation"} : {LEGAL.rcs} ·{" "}
          {locale === "en" ? "VAT number" : "N° TVA intracommunautaire"} : {LEGAL.tva}
        </address>

        <div
          className="flex flex-col-reverse items-start justify-between gap-3 border-t pt-4 md:flex-row md:items-center"
          style={{ borderColor: "rgba(216,173,77,0.10)" }}
        >
          <p className="caption" style={{ color: "rgba(226,225,238,0.55)" }}>
            © {year} {LEGAL.company} — {t("copyright")}
          </p>
          <p className="caption" style={{ color: "rgba(226,225,238,0.42)" }}>
            {t("tagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
