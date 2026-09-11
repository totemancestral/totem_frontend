"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";

const DRAFT_KEY = "totem:parcours:answers";
const JUNIOR_DRAFT_KEY = "totem:parcours:junior:answers";

// aligné sur l'ordre de dict.offres.items (Origine, Révélation/Ancestral, Famille) —
// même liste que Offres.tsx, pour retrouver le bon tarif à afficher ici.
const OFFER_IDS = ["origine", "ancestral", "famille"] as const;

type Props = {
  dict: Dictionary["paiement"];
  offresDict: Dictionary["offres"];
  lang: Locale;
  variant: "adulte" | "junior";
};

// aligné sur l'ordre de dict.paiement.legalLinks (CGV, Confidentialité, Mentions)
const legalHrefs = ["/cgv", "/confidentialite", "/mentions"];

const ivoireScope = {
  background: "#FBF6EA",
  "--color-nuit": "#0D0D1A",
  "--color-indigo": "#F3EDDD",
  "--color-ombre": "#D8D0BC",
  "--color-or": "#B08A3E",
  "--color-orpale": "#8B6F2E",
  "--color-ivoire": "#0D0D1A",
  "--color-gris": "#6B6558",
  "--color-grisclair": "#948C78",
} as CSSProperties;

export default function Paiement({ dict, offresDict, lang, variant }: Props) {
  const searchParams = useSearchParams();
  const offre = searchParams.get("offre") ?? "ancestral";
  const offer = dict[variant];
  // Le récapitulatif doit refléter l'offre réellement choisie (Origine /
  // Révélation / Famille), pas un tarif fixe — sinon l'écran de paiement
  // affiche un prix différent de celui qui sera effectivement débité.
  const offerIndex = OFFER_IDS.indexOf(offre as (typeof OFFER_IDS)[number]);
  const adultOffre = offresDict.items[offerIndex >= 0 ? offerIndex : 1];
  const summary =
    variant === "junior"
      ? { name: offer.offerName, desc: offer.offerDesc, price: offer.price, priceCaption: offer.priceCaption }
      : { name: adultOffre.title, desc: adultOffre.lead, price: adultOffre.price, priceCaption: adultOffre.priceCaption };
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const allChecked = c1 && c2 && c3;

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const isJunior = variant === "junior";
      const raw = sessionStorage.getItem(isJunior ? JUNIOR_DRAFT_KEY : DRAFT_KEY);
      const draft = raw ? JSON.parse(raw) : {};
      // Le backend Junior n'accepte que {choice}, pas de texte libre.
      const answers = isJunior
        ? Object.fromEntries(
            Object.entries(draft as Record<string, { choice?: string }>).map(([key, value]) => [
              key,
              { choice: value.choice },
            ]),
          )
        : draft;

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError("Session expirée. Reconnecte-toi.");
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ offre: isJunior ? "junior" : offre, answers, locale: lang }),
      });
      const payload = (await response.json().catch(() => null)) as {
        checkoutUrl?: string;
        error?: string;
      } | null;

      if (!response.ok || !payload?.checkoutUrl) {
        setError(payload?.error ?? "Paiement indisponible. Réessaie dans un instant.");
        return;
      }

      window.location.href = payload.checkoutUrl;
    } catch {
      setError("Paiement indisponible. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={ivoireScope}>
      {/* motif tournant en arrière-plan, très discret sur une page de paiement */}
      <svg
        className="pointer-events-none absolute left-1/2 top-0 z-0 h-[900px] w-[900px] -translate-x-1/2 -translate-y-[30%] animate-[spin-slow_140s_linear_infinite] opacity-[0.22]"
        viewBox="0 0 760 760"
      >
        <g stroke="#B08A3E" strokeWidth="1">
          <line x1="380" y1="380" x2="380" y2="40" opacity="0.10" />
          <line x1="380" y1="380" x2="720" y2="380" opacity="0.10" />
          <line x1="380" y1="380" x2="380" y2="720" opacity="0.10" />
          <line x1="380" y1="380" x2="40" y2="380" opacity="0.10" />
          <line x1="380" y1="380" x2="592" y2="88" opacity="0.07" />
          <line x1="380" y1="380" x2="592" y2="672" opacity="0.07" />
          <line x1="380" y1="380" x2="168" y2="672" opacity="0.07" />
          <line x1="380" y1="380" x2="168" y2="88" opacity="0.07" />
        </g>
      </svg>

      {/* barre du haut */}
      <div className="relative z-10 flex items-center justify-between px-6 py-9 lg:px-16">
        <div className="flex items-center gap-3">
          <Brand lang={lang} />
          {variant === "junior" && (
            <span className="ml-1 bg-or px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#FBF6EA]">
              {dict.junior.badgeJunior}
            </span>
          )}
        </div>
        <Link href={`/${lang}/offres`} className="text-xs uppercase tracking-[0.14em] text-grisclair">
          {dict.cancel}
        </Link>
      </div>

      {/* contenu */}
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pb-24 lg:px-16">
        <div className="flex w-full max-w-xl flex-col gap-8">

          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
            <h1 className="font-display text-4xl text-ivoire lg:text-5xl">{dict.title}</h1>
            <p className="max-w-sm text-sm text-grisclair">{dict.text}</p>
          </div>

          {/* récapitulatif de commande */}
          <div className="border border-ombre bg-indigo">
            <div className="flex gap-5 border-b border-ombre p-7">
              <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden border border-ombre bg-nuit">
                <Image
                  src="/images/totem-mask-or-1024.png"
                  alt=""
                  fill
                  className="object-cover grayscale contrast-[1.15] brightness-110 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-or mix-blend-color" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="font-display text-2xl text-ivoire">{summary.name}</span>
                <span className="text-sm text-grisclair">{summary.desc}</span>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-display text-[28px] text-ivoire">{summary.price}</span>
                <p className="mt-0.5 text-xs text-grisclair">{summary.priceCaption}</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-7 py-5">
              <span className="text-xs uppercase tracking-wide text-grisclair">{dict.archetypeLabel}</span>
              <span className="font-display text-lg italic text-orpale">{dict.archetypeValue}</span>
            </div>
          </div>

          {/* consentements */}
          <div className="flex flex-col gap-4">
            <label className="flex cursor-pointer items-start gap-3.5">
              <input
                type="checkbox"
                checked={c1}
                onChange={() => setC1(!c1)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-or peer-focus-visible:ring-2 peer-focus-visible:ring-or peer-focus-visible:ring-offset-2 ${c1 ? "bg-or" : "bg-transparent"}`}
              >
                {c1 && (
                  <svg width="10" height="8" viewBox="0 0 10 8">
                    <polyline points="1,4 4,7 9,1" fill="none" stroke="#0D0D1A" strokeWidth="1.6" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-grisclair">
                {offer.consent1Before}
                <Link href={`/${lang}/cgv`} className="text-or">{offer.cgvLink}</Link>
                {offer.consent1Middle}
                <Link href={`/${lang}/confidentialite`} className="text-or">{offer.privacyLink}</Link>
                {offer.consent1After}
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3.5">
              <input
                type="checkbox"
                checked={c2}
                onChange={() => setC2(!c2)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-or peer-focus-visible:ring-2 peer-focus-visible:ring-or peer-focus-visible:ring-offset-2 ${c2 ? "bg-or" : "bg-transparent"}`}
              >
                {c2 && (
                  <svg width="10" height="8" viewBox="0 0 10 8">
                    <polyline points="1,4 4,7 9,1" fill="none" stroke="#0D0D1A" strokeWidth="1.6" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-grisclair">{offer.consent2}</span>
            </label>

            <label className="flex cursor-pointer items-start gap-3.5">
              <input
                type="checkbox"
                checked={c3}
                onChange={() => setC3(!c3)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-or peer-focus-visible:ring-2 peer-focus-visible:ring-or peer-focus-visible:ring-offset-2 ${c3 ? "bg-or" : "bg-transparent"}`}
              >
                {c3 && (
                  <svg width="10" height="8" viewBox="0 0 10 8">
                    <polyline points="1,4 4,7 9,1" fill="none" stroke="#0D0D1A" strokeWidth="1.6" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-grisclair">{offer.consent3}</span>
            </label>
          </div>

          {error && (
            <p className="text-center text-sm" style={{ color: "#B0473E" }} role="alert">
              {error}
            </p>
          )}

          <button
            disabled={!allChecked || loading}
            onClick={pay}
            className={`relative w-full overflow-hidden border-[1.5px] border-nuit px-10 py-4 font-body text-base text-nuit transition-opacity duration-300 ${
              allChecked && !loading ? "cursor-pointer opacity-100" : "pointer-events-none opacity-40"
            }`}
          >
            {loading ? "…" : `${dict.payButton} — ${summary.price}`}
          </button>

          <div className="flex items-center justify-center gap-2.5">
            <svg width="13" height="15" viewBox="0 0 13 15" fill="none" stroke="#6B6558" strokeWidth="1.2">
              <rect x="1" y="6" width="11" height="8" rx="0.5" />
              <path d="M3.5 6V4a3 3 0 0 1 6 0v2" />
            </svg>
            <p className="text-xs text-grisclair">{dict.secureNote}</p>
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <div className="flex gap-6">
              {dict.legalLinks.map((lien, i) => (
                <Link key={lien} href={`/${lang}${legalHrefs[i]}`} className="text-sm text-grisclair">
                  {lien}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
