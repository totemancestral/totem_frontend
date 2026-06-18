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
  { to: "/", hash: "#maison", labelKey: "house" },
  { to: "/", hash: "#faq", labelKey: "faq" },
  { to: "/", hash: "#contact", labelKey: "contact" },
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

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(13,13,26,0.86)" : "rgba(13,13,26,0.68)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled ? "1px solid rgba(201,168,76,0.14)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-3 md:px-10">
        <Link
          href={`/${locale}`}
          aria-label="Totem Ancestral"
          className="group flex shrink-0 items-center gap-3 rounded-full border px-3 py-2 transition-colors"
          style={{
            borderColor: "rgba(201,168,76,0.22)",
            background: "rgba(254,252,240,0.03)",
          }}
        >
          <img
            src="/assets/totem-logo.png"
            alt="Totem Ancestral"
            className="h-8 w-auto transition-transform duration-300 group-hover:scale-105 md:h-9"
          />
          <span
            className="hidden text-[13px] uppercase leading-none tracking-[0.16em] sm:block"
            style={{ color: "var(--or-pale)", fontFamily: "var(--font-display)" }}
          >
            Totem Ancestral
          </span>
        </Link>

        {session ? (
          <>
            <nav
              className="hidden items-center gap-2 rounded-full border px-2 py-2 lg:flex"
              style={{ borderColor: "rgba(201,168,76,0.16)", background: "rgba(26,26,46,0.62)" }}
            >
              <Link
                href={`/${locale}/domus_animi`}
                className="subtext flex items-center gap-2 rounded-full px-4 py-2 text-[12px] uppercase tracking-[0.14em] transition-colors hover:bg-ombre"
                style={{ color: "var(--or-ancestral)" }}
              >
                <LayoutDashboard size={16} />
                {t("dashboard")}
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}/domus_animi`}
                className="btn-primary !py-2 !px-5 !text-[11px] hidden md:inline-flex"
              >
                <LayoutDashboard size={14} />
                {t("dashboard")}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary !py-2 !px-5 !text-[11px] hidden md:inline-flex"
              >
                <LogOut size={14} />
                {t("logout")}
              </button>
              <button
                className="lg:hidden"
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
            <nav
              className="hidden items-center gap-1 rounded-full border p-1 lg:flex"
              style={{ borderColor: "rgba(201,168,76,0.16)", background: "rgba(26,26,46,0.62)" }}
            >
              {nav.map((item) => (
                <Link
                  key={item.labelKey}
                  href={item.to === "/" ? `/${locale}${item.hash}` : `/${locale}${item.to}`}
                  className="subtext rounded-full px-4 py-2 text-[12px] uppercase tracking-[0.12em] transition-colors hover:bg-ombre"
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
                href={`/${locale}/domus_animi`}
                aria-label={t("account")}
                title={t("account")}
                className="hidden h-10 w-10 items-center justify-center rounded-sm border transition-colors hover:bg-ombre md:inline-flex"
                style={{ borderColor: "rgba(201,168,76,0.28)", color: "var(--or-ancestral)" }}
              >
                <UserRound size={17} />
              </Link>
              <Link
                href={`/${locale}/janua_vitae?mode=signup&redirect=/${locale}/via_sapientiae`}
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
          </>
        )}
      </div>

      {open && (
        <div
          className="lg:hidden border-t"
          style={{ background: "var(--nuit-profonde)", borderColor: "rgba(201,168,76,0.15)" }}
        >
          <div className="px-6 py-6 flex flex-col gap-5">
            {session ? (
              <>
                <Link
                  href={`/${locale}/domus_animi`}
                  onClick={() => setOpen(false)}
                  className="subtext text-sm tracking-[0.14em] uppercase flex items-center gap-2"
                  style={{ color: "var(--or-ancestral)" }}
                >
                  <LayoutDashboard size={18} />
                  {t("dashboard")}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="subtext text-sm tracking-[0.14em] uppercase flex items-center gap-2"
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
                    className="subtext text-sm tracking-[0.14em] uppercase"
                    style={{ color: "var(--ivoire)" }}
                  >
                    {t(`nav.${item.labelKey}`)}
                  </Link>
                ))}
                <Link
                  href={`/${locale}/domus_animi`}
                  onClick={() => setOpen(false)}
                  className="subtext text-sm tracking-[0.14em] uppercase"
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
