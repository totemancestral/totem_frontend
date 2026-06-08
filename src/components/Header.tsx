"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Menu, UserRound, X } from "lucide-react";

type Locale = "fr" | "en";

const nav = [
  { to: "/", hash: "#experience", labelKey: "experience" },
  { to: "/", hash: "#offres", labelKey: "offers" },
  { to: "/", hash: "#maison", labelKey: "house" },
  { to: "/faq", hash: "", labelKey: "faq" },
];

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations("header");
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const buildLocaleHref = (nextLocale: Locale) => {
    const nextPath = pathname
      ? pathname.replace(/^\/(fr|en)(?=\/|$)/, `/${nextLocale}`)
      : `/${nextLocale}`;
    const query = typeof window === "undefined" ? "" : window.location.search;
    const hash = typeof window === "undefined" ? "" : window.location.hash;
    return `${nextPath}${query}${hash}`;
  };

  const changeLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    startTransition(() => {
      router.replace(buildLocaleHref(nextLocale), { scroll: false });
    });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-500"
      style={{
        background: scrolled ? "rgba(13,13,26,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(201,168,76,0.12)" : "1px solid transparent",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-4 flex items-center justify-between gap-6">
        <Link
          href={`/${locale}`}
          aria-label="Totem Ancestral"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="logo-wordmark text-[18px] leading-none md:text-[22px]">T</span>
          <img
            src="/assets/totem-logo.png"
            alt=""
            aria-hidden="true"
            className="h-8 w-auto md:h-10"
          />
          <span className="logo-wordmark text-[18px] leading-none md:text-[22px]">A</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {nav.map((item) => (
            <Link
              key={item.labelKey}
              href={item.to === "/" ? `/${locale}${item.hash}` : `/${locale}${item.to}`}
              className="subtext text-[13px] tracking-[0.14em] uppercase text-ivoire/80 hover:text-or transition-colors"
              style={{ color: "var(--ivoire)" }}
            >
              {t(`nav.${item.labelKey}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="subtext flex items-center gap-1 text-[12px] tracking-[0.18em]">
            <button
              type="button"
              onClick={() => changeLocale("fr")}
              disabled={isPending}
              aria-current={locale === "fr" ? "true" : undefined}
              style={{ color: locale === "fr" ? "var(--or-ancestral)" : "#888" }}
              className="transition-colors disabled:cursor-wait"
            >
              FR
            </button>
            <span style={{ color: "#444" }}>·</span>
            <button
              type="button"
              onClick={() => changeLocale("en")}
              disabled={isPending}
              aria-current={locale === "en" ? "true" : undefined}
              style={{ color: locale === "en" ? "var(--or-ancestral)" : "#888" }}
              className="transition-colors disabled:cursor-wait"
            >
              EN
            </button>
          </div>
          <Link
            href={`/${locale}/espace-personnel`}
            aria-label={t("account")}
            title={t("account")}
            className="hidden h-10 w-10 items-center justify-center rounded-sm border transition-colors hover:bg-ombre md:inline-flex"
            style={{ borderColor: "rgba(201,168,76,0.28)", color: "var(--or-ancestral)" }}
          >
            <UserRound size={17} />
          </Link>
          <Link
            href={`/${locale}/parcours`}
            className="hidden md:inline-flex btn-primary !py-3 !px-6 !text-[11px]"
          >
            {t("compose")}
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("menu")}
            style={{ color: "var(--or-ancestral)" }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="lg:hidden border-t"
          style={{ background: "var(--nuit-profonde)", borderColor: "rgba(201,168,76,0.15)" }}
        >
          <div className="px-6 py-6 flex flex-col gap-5">
            {nav.map((item) => (
              <Link
                key={item.labelKey}
                href={item.to === "/" ? `/${locale}${item.hash}` : `/${locale}${item.to}`}
                onClick={() => setOpen(false)}
                className="subtext text-sm tracking-[0.14em] uppercase"
                style={{ color: "var(--ivoire)" }}
              >
                {t(`nav.${item.labelKey}`)}
              </Link>
            ))}
            <Link
              href={`/${locale}/espace-personnel`}
              onClick={() => setOpen(false)}
              className="subtext text-sm tracking-[0.14em] uppercase"
              style={{ color: "var(--ivoire)" }}
            >
              {t("account")}
            </Link>
            <Link
              href={`/${locale}/parcours`}
              onClick={() => setOpen(false)}
              className="btn-primary w-full mt-2"
            >
              {t("composeWork")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
