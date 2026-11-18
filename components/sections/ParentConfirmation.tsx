"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

type Status = { requestId: string; firstName: string; parentEmail: string; confirmed: boolean; paid: boolean; expiresAt: string };

export function ParentConfirmation({ copy, lang }: { copy: Dictionary["parental"]; lang: Locale }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
      const requestId = new URLSearchParams(window.location.search).get("demande");
      const response = await fetch(`/api/junior/parent/session${token ? "" : `?requestId=${encodeURIComponent(requestId ?? "")}`}`, {
        method: token ? "POST" : "GET", cache: "no-store", signal: AbortSignal.timeout(35_000),
        ...(token ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) } : {}),
      });
      if (!response.ok) { setExpired(response.status === 410); throw new Error("session_unavailable"); }
      const payload = await response.json() as Status;
      setStatus(payload);
      setError("");
      setExpired(false);
      if (token) {
        const search = new URLSearchParams(window.location.search);
        search.set("demande", payload.requestId);
        window.history.replaceState(null, "", `${window.location.pathname}?${search}`);
      }
    } catch { setError(copy.unavailable); }
    finally { setLoading(false); }
  }, [copy.unavailable]);

  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    if (!status?.confirmed || status.paid || expired) return;
    const timer = setInterval(() => { void load(); }, 5000);
    return () => clearInterval(timer);
  }, [status?.confirmed, status?.paid, expired, load]);

  async function act(action: "confirm" | "checkout") {
    if (busy || !status) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/junior/parent/${action}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: status.requestId }), signal: AbortSignal.timeout(35_000),
      });
      const payload = await response.json();
      if (!response.ok) { setExpired(response.status === 410); throw new Error("parent_action_unavailable"); }
      if (action === "confirm") setStatus(payload);
      else if (payload.paid) await load();
      else if (typeof payload.checkoutUrl === "string") window.location.assign(payload.checkoutUrl);
      else throw new Error("checkout_unavailable");
    } catch { setError(copy.unavailable); }
    finally { setBusy(false); }
  }

  return <main className="min-h-svh bg-nuit px-5 py-8 text-ivoire sm:px-8">
    <Brand lang={lang} />
    <div className="mx-auto my-10 w-full max-w-xl space-y-5 border border-or bg-indigo p-5 sm:p-8">
      <h1 className="font-display text-3xl">{status?.paid ? copy.paidTitle : copy.confirmTitle}</h1>
      {loading ? <p role="status">{copy.loading}</p> : expired ? <p role="alert">{copy.expired}</p> : status && <>
        {status.paid ? <p role="status" className="leading-relaxed">{copy.paid}</p> : <>
          <p className="text-sm leading-relaxed">{copy.confirmIntro} <strong>{status.firstName}</strong>.</p>
          <p className="break-all text-sm text-or">{status.parentEmail}</p>
          <p className="text-sm leading-relaxed">{copy.consent}</p>
          <p className="text-sm leading-relaxed">{copy.withdrawal}</p>
          <div className="flex flex-wrap gap-4 text-sm text-or">
            <Link href={`/${lang}/cgv`} target="_blank" rel="noreferrer">{copy.terms}</Link>
            <Link href={`/${lang}/confidentialite`} target="_blank" rel="noreferrer">{copy.privacy}</Link>
          </div>
          <Button disabled={busy} onClick={() => void act(status.confirmed ? "checkout" : "confirm")}>
            {busy ? copy.processing : status.confirmed ? copy.pay : copy.confirmButton}
          </Button>
          <p className="text-sm leading-relaxed text-grisclair">{copy.secure}</p>
        </>}
      </>}
      {error && !expired && <div className="space-y-3"><p role="alert" className="text-sm text-or">{error}</p>
        <button type="button" className="min-h-11 text-sm text-or underline" onClick={() => void load()}>{copy.retry}</button></div>}
    </div>
  </main>;
}
