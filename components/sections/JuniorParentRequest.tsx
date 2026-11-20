"use client";
import { MaskLoader } from "@/components/ui/MaskLoader";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase/client";
import { juniorParentAnswersSchema, PARENT_CONSENT_VERSION, type JuniorParentAnswers } from "@/lib/junior-parent";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

type ParentRequest = { id: string; parentEmail: string; confirmed: boolean; paid: boolean; answers: unknown; expiresAt: string };

export function JuniorParentRequest({ copy, lang }: { copy: Dictionary["parental"]; lang: Locale }) {
  const [answers, setAnswers] = useState<JuniorParentAnswers | null>(null);
  const [request, setRequest] = useState<ParentRequest | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [immediate, setImmediate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [revision, setRevision] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const initial = setTimeout(() => setNow(Date.now()), 0);
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const saved = juniorParentAnswersSchema.safeParse(JSON.parse(sessionStorage.getItem("totem:parcours:junior:answers") ?? "null"));
        if (saved.success) setAnswers(saved.data);
      } catch { /* Server snapshots also allow resuming on a different device. */ }
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) { setLoginRequired(true); return; }
        const response = await fetch("/api/junior/parent/request", {
          headers: { Authorization: `Bearer ${data.session.access_token}` }, cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) throw new Error("request_unavailable");
        const payload = await response.json() as { request: ParentRequest | null };
        if (controller.signal.aborted) return;
        setRequest(payload.request);
        if (payload.request) {
          setEmail(payload.request.parentEmail);
          setConsent(true);
          setImmediate(true);
          const stored = juniorParentAnswersSchema.safeParse(payload.request.answers);
          if (stored.success) setAnswers(current => current ?? stored.data);
        }
      } catch { if (!controller.signal.aborted) setError(copy.unavailable); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [copy.unavailable, revision]);

  async function send() {
    if (!answers || !consent || !immediate || busy) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { setLoginRequired(true); return; }
      const response = await fetch("/api/junior/parent/request", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ parentEmail: email, parentConsent: consent, immediateDelivery: immediate,
          consentVersion: PARENT_CONSENT_VERSION, locale: lang, answers }), signal: AbortSignal.timeout(35_000),
      });
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 429) { setSeconds(60); setError(copy.recent); }
        else if (payload.code === "parent_request_invalid") setError(copy.invalid);
        else if (String(payload.code).startsWith("totem_")) setError(copy.alreadyExists);
        else setError(copy.unavailable);
        return;
      }
      setRequest(payload.request);
      setSeconds(60);
    } catch { setError(copy.unavailable); }
    finally { setBusy(false); }
  }

  return <main className="min-h-svh bg-nuit px-5 py-8 text-ivoire sm:px-8">
    <Brand lang={lang} />
    <div className="mx-auto my-10 w-full max-w-xl space-y-6 border border-ombre bg-indigo p-5 sm:p-8">
      <h1 className="font-display text-3xl">{request?.paid ? copy.paidTitle : copy.title}</h1>
      {loading ? <MaskLoader label={copy.loading} /> : loginRequired ? <Link className="text-or underline" href={`/${lang}/connexion?next=${encodeURIComponent(`/${lang}/paiement-junior`)}`}>{copy.login}</Link>
        : request?.paid ? <p role="status">{copy.paid}</p>
        : request ? <div className="space-y-4">
          <p className="text-sm leading-relaxed">{copy.sent} <strong className="break-all">{request.parentEmail}</strong>.</p>
          <p role="status" className="text-sm leading-relaxed text-grisclair">{request.confirmed ? copy.confirmed : copy.waiting}</p>
          {new Date(request.expiresAt).getTime() <= now && <p role="status" className="text-sm text-or">{copy.expired}</p>}
          <div className="flex flex-wrap gap-3">
            <Button disabled={busy || seconds > 0} onClick={() => void send()}>{busy ? copy.sending : copy.resend}</Button>
            <button type="button" className="min-h-11 text-sm text-or underline" onClick={() => { setRequest(null); setConsent(false); setImmediate(false); setError(""); }}>{copy.changeEmail}</button>
          </div>
          {seconds > 0 && <p className="text-xs text-grisclair">{copy.countdown.replace("{seconds}", String(seconds))}</p>}
        </div>
        : !answers ? <div className="space-y-4"><p>{copy.noAnswers}</p><Link className="text-or underline" href={`/${lang}/parcours-junior`}>{copy.questions}</Link></div>
        : <form className="space-y-5" onSubmit={event => { event.preventDefault(); void send(); }}>
          <p className="text-sm leading-relaxed">{copy.intro}</p>
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-or" />
            <span>{copy.consent}</span>
          </label>
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input type="checkbox" required checked={immediate} onChange={event => setImmediate(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-or" />
            <span>{copy.withdrawal}</span>
          </label>
          <div className="flex flex-wrap gap-4 text-sm text-or">
            <Link href={`/${lang}/cgv`} target="_blank" rel="noreferrer">{copy.terms}</Link>
            <Link href={`/${lang}/confidentialite`} target="_blank" rel="noreferrer">{copy.privacy}</Link>
          </div>
          <label className="block text-sm">{copy.emailLabel}
            <input type="email" name="parentEmail" value={email} onChange={event => setEmail(event.target.value)} required maxLength={255}
              autoComplete="email" placeholder={copy.emailPlaceholder}
              className="mt-2 min-h-11 w-full min-w-0 border border-ombre bg-nuit px-3 py-3 text-ivoire" />
          </label>
          <p className="text-sm leading-relaxed text-grisclair">{copy.emailHelp}</p>
          <Button type="submit" disabled={busy || !consent || !immediate || seconds > 0}>{busy ? copy.sending : copy.send}</Button>
        </form>}
      {error && <div className="space-y-3"><p role="alert" className="text-sm text-or">{error}</p>
        <button type="button" className="min-h-11 text-sm text-or underline" onClick={() => setRevision(value => value + 1)}>{copy.retry}</button></div>}
    </div>
  </main>;
}
