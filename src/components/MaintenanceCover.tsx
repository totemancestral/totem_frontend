"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Mail, Sparkles, Shield, Clock, Lock } from "lucide-react";
import { GoldParticles } from "@/components/GoldParticles";

type Locale = "fr" | "en";

const content = {
  fr: {
    badge: "✦ LE SANCTUAIRE EST EN RECUEILLEMENT",
    title: "RÉNOVATION SACRÉE EN COURS",
    subtitle:
      "Les esprits ancestraux et les maîtres artisans consacrent actuellement de nouvelles révélations sacrées. Notre sanctuaire numérique perfectionne ses mystères pour vous offrir une expérience encore plus noble et authentique.",
    statusTitle: "Travaux de perfectionnement",
    statusDesc: "Nos équipes œuvrent au renouveau des récits, des masques sculptés et des voix sacrées du Griot.",
    reopening: "Réouverture imminente",
    contactPrompt: "Une question urgente ou une commande en cours ?",
    contactBtn: "Contacter le Sanctuaire",
    footer: "Maison de création d'œuvres numériques ancestrales · Tous droits réservés",
  },
  en: {
    badge: "✦ THE SANCTUARY IS IN MEDITATION",
    title: "SACRED RENOVATION IN PROGRESS",
    subtitle:
      "The ancestral spirits and master artisans are currently consecrating new sacred revelations. Our digital sanctuary is refining its mysteries to offer you an even nobler and authentic experience.",
    statusTitle: "Enhancement Works",
    statusDesc: "Our team is working on the renewal of sacred narratives, carved masks, and ancestral voices.",
    reopening: "Imminent Reopening",
    contactPrompt: "An urgent question or an ongoing order?",
    contactBtn: "Contact the Sanctuary",
    footer: "House of Ancestral Digital Artworks · All rights reserved",
  },
};

export function MaintenanceCover({ locale: initialLocale = "fr" }: { locale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [bypassed, setBypassed] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showSecretInput, setShowSecretInput] = useState(false);
  const [secretPass, setSecretPass] = useState("");

  useEffect(() => {
    // Vérifier si le bypass est déjà actif dans le stockage local ou URL
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("pass") === "totem2026" || urlParams.get("preview") === "1") {
        localStorage.setItem("totem_maintenance_bypass", "true");
        setBypassed(true);
        return;
      }
      if (localStorage.getItem("totem_maintenance_bypass") === "true") {
        setBypassed(true);
      }
    }
  }, []);

  const handleSecretClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount >= 5) {
      setShowSecretInput(true);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretPass === "totem2026" || secretPass === "ancestral") {
      localStorage.setItem("totem_maintenance_bypass", "true");
      setBypassed(true);
    } else {
      alert("Clé d'accès incorrecte");
    }
  };

  if (bypassed) {
    return (
      <div className="fixed bottom-4 right-4 z-[999999] flex items-center gap-2 rounded-full border border-amber-500/40 bg-black/90 px-4 py-1.5 text-xs text-amber-300 shadow-2xl backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Mode Développeur Actif (Maintenance masquée)</span>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("totem_maintenance_bypass");
            setBypassed(false);
          }}
          className="ml-2 text-amber-500 hover:text-white underline"
        >
          Réactiver
        </button>
      </div>
    );
  }

  const t = content[locale] || content.fr;

  return (
    <div
      className="fixed inset-0 z-[999999] flex min-h-screen w-full flex-col justify-between overflow-y-auto bg-[#07080e] px-4 py-8 text-[#f5f0e8] select-none md:p-12"
      style={{
        background:
          "radial-gradient(circle at 50% 25%, rgba(216,173,77,0.14) 0%, rgba(13,14,24,0.98) 65%, #05060a 100%)",
      }}
    >
      {/* Particules d'or flottantes */}
      <GoldParticles count={32} />

      {/* Header avec logo et sélecteur de langue */}
      <header className="relative z-10 flex w-full items-center justify-between border-b border-amber-500/15 pb-6 max-w-6xl mx-auto">
        <div
          className="flex items-center gap-3.5 cursor-pointer"
          onClick={handleSecretClick}
          title="TOTEM ANCESTRAL"
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-full border border-amber-500/40 bg-black/60 p-1 shadow-[0_0_20px_rgba(216,173,77,0.25)]">
            <Image
              src="/assets/totem-logo.png"
              alt="Totem Ancestral Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div>
            <div className="font-['Bebas_Neue',sans-serif] text-2xl tracking-[0.22em] text-[#e8c368] drop-shadow-[0_2px_10px_rgba(216,173,77,0.3)]">
              TOTEM ANCESTRAL
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-200/50">
              Sanctuaire Numérique
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-black/40 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setLocale("fr")}
            className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wider transition-all ${
              locale === "fr"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20"
                : "text-amber-200/60 hover:text-amber-200"
            }`}
          >
            FR
          </button>
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wider transition-all ${
              locale === "en"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20"
                : "text-amber-200/60 hover:text-amber-200"
            }`}
          >
            EN
          </button>
        </div>
      </header>

      {/* Contenu Principal */}
      <main className="relative z-10 my-auto flex flex-col items-center text-center max-w-3xl mx-auto py-10">
        {/* Badge supérieur */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#f2d07e] shadow-[0_0_30px_rgba(216,173,77,0.15)] mb-8 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span>{t.badge}</span>
        </div>

        {/* Masque Fang Ngil Sculpté en médaillon d'or */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="relative h-32 w-32 md:h-40 md:w-40 overflow-hidden rounded-full border-2 border-amber-500/50 bg-[#121422] p-2 shadow-[0_0_50px_rgba(216,173,77,0.3)] transition-transform duration-700 hover:scale-105">
            <Image
              src="/assets/masque-ngil-authentique.webp"
              alt="Masque Fang Ngil Ancestral"
              fill
              className="object-cover rounded-full"
              priority
            />
          </div>
        </div>

        {/* Titre et typographie d'exception */}
        <h1 className="font-['Bebas_Neue',sans-serif] text-4xl sm:text-5xl md:text-6xl tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-b from-[#fff6d8] via-[#e5bc5c] to-[#9c782b] drop-shadow-[0_4px_25px_rgba(216,173,77,0.35)] leading-tight mb-6">
          {t.title}
        </h1>

        {/* Paragraphe poétique */}
        <p className="text-base md:text-lg leading-relaxed text-[#eae5dc]/85 font-light max-w-2xl mb-10">
          {t.subtitle}
        </p>

        {/* Carte de statut et réouverture */}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-10">
          <div className="rounded-2xl border border-amber-500/20 bg-[#121424]/70 p-5 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3 text-amber-400 mb-2">
              <Sparkles size={18} />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-amber-300">
                {t.statusTitle}
              </h3>
            </div>
            <p className="text-xs text-amber-100/70 leading-relaxed">
              {t.statusDesc}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-[#121424]/70 p-5 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div className="flex items-center gap-3 text-amber-400 mb-2">
              <Clock size={18} />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-amber-300">
                Statut
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <span className="text-sm font-medium text-emerald-300 tracking-wide">
                {t.reopening}
              </span>
            </div>
          </div>
        </div>

        {/* Bouton Contact */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a
            href="mailto:contact@totemancestral.com?subject=Demande%20Sanctuaire%20Totem"
            className="group inline-flex items-center gap-3 rounded-xl border border-amber-400/60 bg-gradient-to-r from-[#d8ad4d] via-[#f0c868] to-[#c79836] px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-[#0a0b12] shadow-[0_0_30px_rgba(216,173,77,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_45px_rgba(216,173,77,0.55)]"
          >
            <Mail size={17} className="transition-transform group-hover:-translate-y-0.5" />
            <span>{t.contactBtn}</span>
          </a>
        </div>

        {/* Modal discret de déverrouillage pour l'administrateur */}
        {showSecretInput && (
          <form
            onSubmit={handleUnlock}
            className="mt-8 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-black/80 p-2 backdrop-blur-lg animate-fade-in"
          >
            <Lock size={16} className="text-amber-400 ml-2" />
            <input
              type="password"
              placeholder="Code d'accès équipe..."
              value={secretPass}
              onChange={(e) => setSecretPass(e.target.value)}
              className="bg-transparent px-3 py-1 text-xs text-white placeholder-amber-200/40 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-black hover:bg-amber-400"
            >
              Entrer
            </button>
          </form>
        )}
      </main>

      {/* Footer sobre et prestigieux */}
      <footer className="relative z-10 flex flex-col items-center justify-between border-t border-amber-500/15 pt-6 text-center text-xs text-amber-200/40 max-w-6xl mx-auto w-full md:flex-row gap-2">
        <div className="flex items-center gap-2">
          <Shield size={13} className="text-amber-500/60" />
          <span>TOTEM ANCESTRAL &copy; {new Date().getFullYear()}</span>
        </div>
        <p>{t.footer}</p>
        <a
          href="mailto:contact@totemancestral.com"
          className="text-amber-400/60 hover:text-amber-300 transition-colors"
        >
          contact@totemancestral.com
        </a>
      </footer>
    </div>
  );
}
