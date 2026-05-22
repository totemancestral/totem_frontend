import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { MaskLogo } from "./MaskLogo";

const nav = [
  { to: "/", hash: "#experience", label: "L'expérience" },
  { to: "/", hash: "#offres", label: "Les offres" },
  { to: "/", hash: "#maison", label: "La maison" },
  { to: "/faq", hash: "", label: "FAQ" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"FR" | "EN">("FR");

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
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <MaskLogo size={28} />
          <span className="logo-wordmark text-[11px] md:text-[13px] hidden sm:inline">
            Totem Ancestral
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {nav.map((item) => (
            <a
              key={item.label}
              href={item.to === "/" ? item.hash : item.to}
              className="text-[13px] tracking-[0.14em] uppercase text-ivoire/80 hover:text-or transition-colors"
              style={{ color: "var(--ivoire)" }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[12px] tracking-[0.18em]">
            <button
              onClick={() => setLang("FR")}
              style={{ color: lang === "FR" ? "var(--or-ancestral)" : "#888" }}
              className="transition-colors"
            >
              FR
            </button>
            <span style={{ color: "#444" }}>·</span>
            <button
              onClick={() => setLang("EN")}
              style={{ color: lang === "EN" ? "var(--or-ancestral)" : "#888" }}
              className="transition-colors"
            >
              EN
            </button>
          </div>
          <a href="#offres" className="hidden md:inline-flex btn-primary !py-3 !px-6 !text-[11px]">
            Composer
          </a>
          <button
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
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
              <a
                key={item.label}
                href={item.to === "/" ? item.hash : item.to}
                onClick={() => setOpen(false)}
                className="text-sm tracking-[0.14em] uppercase"
                style={{ color: "var(--ivoire)" }}
              >
                {item.label}
              </a>
            ))}
            <a href="#offres" onClick={() => setOpen(false)} className="btn-primary w-full mt-2">
              Composer mon œuvre
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
