import { Link } from "@tanstack/react-router";
import { MaskLogo } from "./MaskLogo";

export function Footer() {
  return (
    <footer
      className="pt-24 pb-12 px-5 md:px-10"
      style={{ background: "var(--nuit-profonde)", borderTop: "1px solid rgba(201,168,76,0.12)" }}
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center text-center gap-6">
          <MaskLogo size={44} />
          <div className="logo-wordmark text-sm md:text-base">Totem Ancestral</div>
          <p className="quote-italic text-base md:text-lg max-w-xl">
            Le portrait imaginaire de l'Africain que vous auriez pu être.
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-6 text-[12px] tracking-[0.16em] uppercase">
            <a href="/#experience" style={{ color: "var(--ivoire)" }}>L'expérience</a>
            <a href="/#offres" style={{ color: "var(--ivoire)" }}>Les offres</a>
            <Link to="/a-propos" style={{ color: "var(--ivoire)" }}>À propos</Link>
            <Link to="/faq" style={{ color: "var(--ivoire)" }}>FAQ</Link>
            <Link to="/contact" style={{ color: "var(--ivoire)" }}>Contact</Link>
          </nav>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-2 text-[12px]">
            <Link to="/cgv" style={{ color: "#888" }}>CGV</Link>
            <Link to="/confidentialite" style={{ color: "#888" }}>Politique de confidentialité</Link>
            <Link to="/mentions" style={{ color: "#888" }}>Mentions légales</Link>
          </nav>

          <div
            className="text-2xl mt-8 tracking-[0.4em]"
            style={{ color: "var(--or-pale)" }}
            aria-hidden="true"
          >
            ✦
          </div>

          <p className="caption max-w-2xl leading-relaxed mt-2">
            SENYCE PARTNERS © 2026 — Tous droits réservés.
            <br />
            Une maison de création artistique. Une œuvre assistée par intelligence artificielle.
          </p>
        </div>
      </div>
    </footer>
  );
}
