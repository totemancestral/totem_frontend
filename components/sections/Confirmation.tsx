"use client";
import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";

type Props = {
  dict: Dictionary["confirmation"];
  offerName: string;
  lang: Locale;
};

// aligné sur l'ordre de dict.confirmation.legalLinks (CGV, Confidentialité, Contact)
const legalHrefs = ["/cgv", "/confidentialite", "/contact"];

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

type OrderStatus = "pending" | "processing" | "done" | "error";

export default function Confirmation({ dict, offerName, lang }: Props) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<OrderStatus | "loading" | "unpaid">(
    sessionId ? "loading" : "error",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    sessionId ? null : "Session de paiement introuvable",
  );
  const [commandeId, setCommandeId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        if (alive) setStatus("error");
        return;
      }

      try {
        const response = await fetch(`/api/orders/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = (await response.json().catch(() => null)) as {
          status?: OrderStatus;
          errorMessage?: string | null;
          error?: string;
          commandeId?: string | null;
        } | null;

        if (!alive) return;

        if (response.status === 402) {
          setStatus("unpaid");
          return;
        }
        if (!response.ok || !payload) {
          setErrorMessage(payload?.error ?? "Commande introuvable");
          setStatus("error");
          return;
        }

        setStatus(payload.status ?? "pending");
        if (payload.commandeId) setCommandeId(payload.commandeId);
        if (payload.status === "error") setErrorMessage(payload.errorMessage ?? null);
        if (payload.status !== "done" && payload.status !== "error") {
          timer = setTimeout(poll, 4000);
        }
      } catch {
        if (alive) setStatus("error");
      }
    }

    poll();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [sessionId]);

  const statusCopy = {
    loading: { title: dict.statusTitle, text: "Vérification du paiement…" },
    unpaid: { title: dict.statusTitle, text: "Paiement en cours de confirmation…" },
    pending: { title: dict.statusTitle, text: dict.statusText },
    processing: { title: dict.statusTitle, text: dict.statusText },
    done: { title: "Ton œuvre est prête", text: "Retrouve-la dans ton espace personnel." },
    error: {
      title: "Un problème est survenu",
      text: errorMessage ?? "La génération a échoué. Contacte-nous si le problème persiste.",
    },
  }[status];

  return (
    <div className="flex min-h-screen flex-col" style={ivoireScope}>
      {/* barre du haut */}
      <div className="flex items-center px-6 py-9 lg:px-16">
        <Brand lang={lang} />
      </div>

      {/* contenu */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 lg:px-16">
        <div className="flex w-full max-w-xl flex-col items-center gap-7 text-center">

          {/* icône check, avec deux anneaux qui pulsent en décalé */}
          <div className="relative flex h-18 w-18 items-center justify-center">
            <span className="absolute inset-0 animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full border border-or" />
            <span className="absolute inset-0 animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full border border-or [animation-delay:1.2s]" />
            <svg width="30" height="22" viewBox="0 0 30 22" fill="none" stroke="#B08A3E" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="relative">
              <polyline points="2,12 11,20 28,2" />
            </svg>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-or">{dict.eyebrow}</p>
            <h1 className="font-display text-4xl text-ivoire lg:text-5xl">{dict.title}</h1>
            <p className="font-display text-xl italic text-orpale">{dict.quote}</p>
          </div>

          {/* récapitulatif */}
          <div className="flex w-full flex-col gap-2.5 border border-ombre bg-indigo px-7 py-6">
            <div className="flex justify-between">
              <span className="text-sm text-grisclair">{dict.offerLabel}</span>
              <span className="text-sm text-ivoire">{offerName}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-gris">{statusCopy.title}</p>
            <p className="text-xs text-grisclair">{statusCopy.text}</p>
          </div>

          <Link
            href={status === "done" && commandeId ? `/${lang}/oeuvre?commande=${commandeId}` : `/${lang}/espace`}
            className="relative overflow-hidden border border-nuit px-9 py-4 font-body text-sm text-nuit"
          >
            {status === "done" ? dict.buttonReady : dict.button}
          </Link>

          <div className="mt-1 flex gap-6">
            {dict.legalLinks.map((lien, i) => (
              <Link key={lien} href={`/${lang}${legalHrefs[i]}`} className="text-sm text-grisclair">
                {lien}
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
