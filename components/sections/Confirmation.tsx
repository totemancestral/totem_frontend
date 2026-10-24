"use client";
import { interfaceCopy } from "@/lib/interface-copy";
import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { supabase } from "@/lib/supabase/client";
import { retryNotice } from "@/lib/retry-after";
import { REQUEST_TIMING, requestSignal } from "@/lib/request-timing";

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
  "--color-ombre": "#857A63",
  "--color-or": "#806020",
  "--color-orpale": "#7B612E",
  "--color-ivoire": "#0D0D1A",
  "--color-gris": "#6B6558",
  "--color-grisclair": "#706655",
} as CSSProperties;

type OrderStatus = "pending" | "processing" | "done" | "error";

export default function Confirmation({ dict, offerName, lang }: Props) {
  const ui = interfaceCopy(lang);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState<OrderStatus | "loading" | "unpaid" | "delayed">(
    sessionId ? "loading" : "error",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    sessionId ? null : ui.errors.paymentSessionMissing,
  );
  const [commandeId, setCommandeId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    let windowTimer: ReturnType<typeof setTimeout>;
    let paidConfirmed = false;
    function startBudget(duration: number) {
      clearTimeout(windowTimer);
      windowTimer = setTimeout(() => {
      controller.abort();
      clearTimeout(timer);
      if (alive) setStatus("delayed");
      }, duration);
    }
    startBudget(REQUEST_TIMING.paymentWindow);

    async function poll() {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!alive || controller.signal.aborted) return;
      if (!token) {
        clearTimeout(windowTimer);
        if (alive) setStatus("error");
        return;
      }

      try {
        const response = await fetch(`/api/orders/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: requestSignal(REQUEST_TIMING.read, controller.signal),
        });
        const payload = (await response.json().catch(() => null)) as {
          status?: OrderStatus;
          errorMessage?: string | null;
          error?: string;
          commandeId?: string | null;
          paid?: boolean;
          requiresQuestionnaire?: boolean;
        } | null;

        if (!alive || controller.signal.aborted) return;

        if (response.status === 402) {
          setStatus("unpaid");
          timer = setTimeout(poll, REQUEST_TIMING.paymentInterval);
          return;
        }
        if (!response.ok || !payload) {
          setErrorMessage(retryNotice(response, lang) ?? ui.errors.orderUnavailable);
          setStatus("error");
          clearTimeout(windowTimer);
          return;
        }

        if (payload.paid && payload.requiresQuestionnaire) {
          clearTimeout(windowTimer);
          router.replace(`/${lang}/parcours?session_id=${encodeURIComponent(sessionId!)}`);
          return;
        }
        if (payload.paid && !paidConfirmed) {
          paidConfirmed = true;
          startBudget(REQUEST_TIMING.artworkWindow);
        }
        setStatus(payload.status ?? "pending");
        if (payload.commandeId) setCommandeId(payload.commandeId);
        if (payload.status === "error") setErrorMessage(dict.errorText);
        if (payload.status !== "done" && payload.status !== "error") {
          timer = setTimeout(poll, REQUEST_TIMING.paymentInterval);
        } else clearTimeout(windowTimer);
      } catch {
        if (alive && !controller.signal.aborted) { setStatus("error"); clearTimeout(windowTimer); }
      }
    }

    poll();
    return () => {
      alive = false;
      controller.abort();
      clearTimeout(windowTimer);
      clearTimeout(timer);
    };
  }, [sessionId, lang, router, dict.errorText, ui.errors.orderUnavailable, revision]);

  const statusCopy = {
    delayed: { title: dict.statusTitle, text: lang === "fr" ? "Le traitement prend plus de temps que prévu. Vous pouvez vérifier à nouveau dans un instant." : "Processing is taking longer than expected. You can check again shortly." },
    loading: { title: dict.statusTitle, text: dict.checkingPayment },
    unpaid: { title: dict.statusTitle, text: dict.waitingPayment },
    pending: { title: dict.statusTitle, text: dict.statusText },
    processing: { title: dict.statusTitle, text: dict.statusText },
    done: { title: dict.readyTitle, text: dict.readyText },
    error: {
      title: dict.errorTitle,
      text: errorMessage ?? dict.errorText,
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
            <p role={status === "error" ? "alert" : "status"} className="text-xs text-grisclair">{statusCopy.text}</p>
            {(status === "delayed" || status === "error") && sessionId && <button type="button" className="text-sm text-or underline underline-offset-4" onClick={() => { setStatus("loading"); setErrorMessage(null); setRevision(n => n + 1); }}>{lang === "fr" ? "Vérifier à nouveau" : "Check again"}</button>}
          </div>

          <Link
            href={status === "done" && commandeId ? `/${lang}/oeuvre?commande=${commandeId}` : `/${lang}/espace`}
            className="relative overflow-hidden border border-nuit px-9 py-4 font-body text-sm text-nuit"
          >
            {status === "done" ? dict.buttonReady : dict.button}
          </Link>

          <div className="mt-1 flex flex-wrap gap-x-6 gap-y-3">
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
