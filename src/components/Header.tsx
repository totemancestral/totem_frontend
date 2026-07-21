"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Session } from "@supabase/supabase-js";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { hasAdminRole } from "@/lib/admin-client";
import { authPath } from "@/lib/routes";

type Locale = "fr" | "en";

const nav = [
  { to: "/", hash: "#experience", labelKey: "experience" },
  { to: "/", hash: "#offres", labelKey: "offers" },
  { to: "/", hash: "#faq", labelKey: "faq" },
];

function getAccountNav(locale: Locale) {
  const labels =
    locale === "fr"
      ? { home: "Accueil", orders: "Commandes", artworks: "Œuvres", profile: "Profil" }
      : { home: "Home", orders: "Orders", artworks: "Artworks", profile: "Profile" };

  return [
    { href: `/${locale}/domus_animi`, label: labels.home },
    { href: `/${locale}/domus_animi/commandes`, label: labels.orders },
    { href: `/${locale}/domus_animi/oeuvres`, label: labels.artworks },
    { href: `/${locale}/domus_animi/profil`, label: labels.profile },
  ];
}

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations("header");
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [session, setSession] = useState<boolean | null>(null);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [juniorSession, setJuniorSession] = useState(false);
  const isAccountArea = Boolean(pathname?.includes("/domus_animi"));

  useEffect(() => {
    let alive = true;

    async function applySession(nextSession: Session | null) {
      if (!alive) return;
      setSession(Boolean(nextSession));

      if (!nextSession) {
        setIsAdminSession(false);
        setJuniorSession(false);
        return;
      }

      const nextIsAdmin = await hasAdminRole(nextSession.user.id);
      if (alive) {
        setIsAdminSession(nextIsAdmin);
        setJuniorSession(nextSession.user.user_metadata?.role === "junior");
      }
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      applySession(s);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      applySession(s);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
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

  const accountNav = getAccountNav(locale);
  const composeHref = session
    ? juniorSession
      ? `/${locale}/iuvenis_signum`
      : `/${locale}/via_sapientiae?restart=1`
    : authPath(locale, "signup", `/${locale}/via_sapientiae?restart=1`);

  const openDashboardMenu = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("totem:dashboard-menu-toggle", {
        detail: { source: isAdminSession ? "admin" : "user" },
      }),
    );
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
            {!isAccountArea && (
              <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 md:flex">
                {isAdminSession ? (
                  <Link
                    href="/fgh55_fh"
                    className="subtext text-[12px] uppercase transition-colors hover:text-or"
                    style={{ color: "rgba(209,197,177,0.92)" }}
                  >
                    Admin
                  </Link>
                ) : (
                  accountNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="subtext text-[12px] uppercase transition-colors hover:text-or"
                      style={{ color: "rgba(209,197,177,0.92)" }}
                    >
                      {item.label}
                    </Link>
                  ))
                )}
              </nav>
            )}

            <div className="flex items-center gap-3">
              {isAccountArea && !isAdminSession && (
                <button
                  type="button"
                  onClick={openDashboardMenu}
                  className="inline-flex h-10 w-10 items-center justify-center border transition-colors hover:bg-ombre lg:hidden"
                  aria-label={t("menu")}
                  title={t("menu")}
                  style={{ borderColor: "rgba(216,173,77,0.28)", color: "var(--or-ancestral)" }}
                >
                  <Menu size={17} />
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary hidden !px-5 !py-2 !text-[11px] md:inline-flex"
              >
                <LogOut size={14} />
                {t("logout")}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 w-10 items-center justify-center border transition-colors hover:bg-ombre md:hidden"
                aria-label={t("logout")}
                title={t("logout")}
                style={{ borderColor: "rgba(216,173,77,0.28)", color: "var(--or-ancestral)" }}
              >
                <LogOut size={17} />
              </button>
              {!isAccountArea && (
                <button
                  className="md:hidden"
                  onClick={() => setOpen((v) => !v)}
                  aria-label={t("menu")}
                  style={{ color: "var(--or-ancestral)" }}
                >
                  {open ? <X size={22} /> : <Menu size={22} />}
                </button>
              )}
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
                href={composeHref}
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

      {open && !isAccountArea && (
        <div
          className="max-h-[calc(100svh-72px)] overflow-y-auto border-t md:hidden"
          style={{ background: "var(--nuit-profonde)", borderColor: "rgba(216,173,77,0.18)" }}
        >
          <div className="px-6 py-6 flex flex-col gap-5">
            {session ? (
              <>
                {isAdminSession ? (
                  <Link
                    href="/fgh55_fh"
                    onClick={() => setOpen(false)}
                    className="subtext text-sm uppercase"
                    style={{ color: "var(--ivoire)" }}
                  >
                    Admin
                  </Link>
                ) : (
                  accountNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="subtext text-sm uppercase"
                      style={{ color: "var(--ivoire)" }}
                    >
                      {item.label}
                    </Link>
                  ))
                )}
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
                  href={composeHref}
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
