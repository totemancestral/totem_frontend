"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { LogOut, LayoutDashboard, Menu, UserRound, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Locale = "fr" | "en";

const nav = [
  { to: "/", hash: "#experience", labelKey: "experience" },
  { to: "/", hash: "#offres", labelKey: "offers" },
  { to: "/", hash: "#faq", labelKey: "faq" },
];

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations("header");
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(!!s);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(!!s);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(false);
    setOpen(false);
    router.push(`/${locale}`);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 border-b transition-all duration-500"
      style={{
        background: scrolled ? "rgba(12,14,22,0.92)" : "rgba(12,14,22,0.82)",
        backdropFilter: "blur(16px)",
        borderColor: "rgba(216,173,77,0.18)",
      }}
    >
      <div
        className={`mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 transition-all duration-300 md:px-8 ${scrolled ? "py-3" : "py-4"}`}
      >
        <Link
          href={`/${locale}`}
          aria-label="Totem Ancestral"
          className="group flex shrink-0 items-center gap-3 transition-colors"
        >
          <img
            src="/assets/totem-logo.png"
            alt="Totem Ancestral"
            className="h-8 w-auto transition-transform duration-300 group-hover:scale-105 md:h-9"
          />
          <span
            className="hidden text-[24px] uppercase leading-none sm:block"
            style={{ color: "var(--or-pale)", fontFamily: "var(--font-display)" }}
          >
            Totem Ancestral
          </span>
        </Link>

        {session ? (
          <>
            <nav className="hidden items-center gap-3 lg:flex">
              <Link
                href={`/${locale}/domus_animi`}
                className="subtext flex items-center gap-2 px-4 py-2 text-[12px] uppercase transition-colors hover:bg-ombre"
                style={{ color: "var(--or-ancestral)" }}
              >
                <LayoutDashboard size={16} />
                {t("dashboard")}
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}/domus_animi`}
                className="btn-primary hidden !px-5 !py-2 !text-[11px] md:inline-flex"
              >
                <LayoutDashboard size={14} />
                {t("dashboard")}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary hidden !px-5 !py-2 !text-[11px] md:inline-flex"
              >
                <LogOut size={14} />
                {t("logout")}
              </button>
              <button
                className="md:hidden"
                onClick={() => setOpen((v) => !v)}
                aria-label={t("menu")}
                style={{ color: "var(--or-ancestral)" }}
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </>
        ) : (
          <>
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
              {nav.map((item) => (
                <Link
                  key={item.labelKey}
                  href={item.to === "/" ? `/${locale}${item.hash}` : `/${locale}${item.to}`}
                  className="subtext text-[12px] uppercase transition-colors hover:text-or"
                  style={{ color: "rgba(209,197,177,0.92)" }}
                >
                  {t(`nav.${item.labelKey}`)}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 md:gap-5">
              <div
                className="subtext flex items-center gap-1 border px-3 py-1 text-[11px] uppercase"
                style={{ borderColor: "rgba(216,173,77,0.28)" }}
              >
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
                href={`/${locale}/domus_animi`}
                aria-label={t("account")}
                title={t("account")}
                className="hidden h-10 w-10 items-center justify-center border transition-colors hover:bg-ombre md:inline-flex"
                style={{ borderColor: "rgba(216,173,77,0.28)", color: "var(--or-ancestral)" }}
              >
                <UserRound size={17} />
              </Link>
              <Link
                href={`/${locale}/janua_vitae?mode=signup&redirect=/${locale}/via_sapientiae`}
                className="btn-primary hidden !px-6 !py-2.5 !text-[11px] md:inline-flex"
              >
                {t("compose")}
              </Link>
              <button
                className="md:hidden"
                onClick={() => setOpen((v) => !v)}
                aria-label={t("menu")}
                style={{ color: "var(--or-ancestral)" }}
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </>
        )}
      </div>

      {open && (
        <div
          className="max-h-[calc(100svh-72px)] overflow-y-auto border-t md:hidden"
          style={{ background: "var(--nuit-profonde)", borderColor: "rgba(216,173,77,0.18)" }}
        >
          <div className="px-6 py-6 flex flex-col gap-5">
            {session ? (
              <>
                <Link
                  href={`/${locale}/domus_animi`}
                  onClick={() => setOpen(false)}
                  className="subtext flex items-center gap-2 text-sm uppercase"
                  style={{ color: "var(--or-ancestral)" }}
                >
                  <LayoutDashboard size={18} />
                  {t("dashboard")}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="subtext flex items-center gap-2 text-sm uppercase"
                  style={{ color: "var(--ivoire)" }}
                >
                  <LogOut size={18} />
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                {nav.map((item) => (
                  <Link
                    key={item.labelKey}
                    href={item.to === "/" ? `/${locale}${item.hash}` : `/${locale}${item.to}`}
                    onClick={() => setOpen(false)}
                    className="subtext text-sm uppercase"
                    style={{ color: "var(--ivoire)" }}
                  >
                    {t(`nav.${item.labelKey}`)}
                  </Link>
                ))}
                <Link
                  href={`/${locale}/domus_animi`}
                  onClick={() => setOpen(false)}
                  className="subtext text-sm uppercase"
                  style={{ color: "var(--ivoire)" }}
                >
                  {t("account")}
                </Link>
                <Link
                  href={`/${locale}/janua_vitae?mode=signup&redirect=/${locale}/via_sapientiae`}
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full mt-2"
                >
                  {t("composeWork")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
