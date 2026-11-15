"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { sharePath } from "@/lib/totem-sharing";

type Share = { token: string; slug: string; display_name: string };

export function ShareTotem({ commandeId, lang, label }: {
  commandeId: string; lang: string; label: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [share, setShare] = useState<Share | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const fr = lang === "fr";
  const buttonClass = "border border-ombre px-6 py-3.5 text-sm text-ivoire transition-colors hover:border-or hover:text-or disabled:opacity-50";
  const path = share ? sharePath(lang, share.slug, share.token) : "";
  const url = path && typeof window !== "undefined" ? `${window.location.origin}${path}` : "";

  async function request(method: "GET" | "POST" | "DELETE") {
    setBusy(true);
    setNotice("");
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Session expired");
      const response = await fetch(`/api/oeuvre/${commandeId}/share`, {
        method, cache: "no-store", signal: AbortSignal.timeout(30_000),
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        ...(method === "POST" ? { body: JSON.stringify({ displayName: name }) } : {}),
      });
      if (!response.ok) throw new Error("Sharing unavailable");
      const payload = await response.json() as { share: Share | null };
      setShare(payload.share);
      if (payload.share) setName(payload.share.display_name);
      setLoaded(true);
      if (method === "DELETE") setNotice(fr ? "Le lien de partage est désactivé." : "The sharing link is disabled.");
    } catch {
      setNotice(fr ? "Le partage est indisponible. Veuillez réessayer." : "Sharing is unavailable. Please try again.");
    } finally { setBusy(false); }
  }

  async function send() {
    if (!share || !url) return;
    setNotice("");
    try {
      if (navigator.share) {
        await navigator.share({ title: fr ? `Le totem de ${share.display_name}` : `${share.display_name}’s totem`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setNotice(fr ? "Lien copié." : "Link copied.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setNotice(fr ? "Vous pouvez copier le lien affiché ci-dessous." : "You can copy the link shown below.");
    }
  }

  return <>
    <button type="button" className={buttonClass} onClick={() => {
      dialog.current?.showModal();
      void request("GET");
    }}>{label}</button>
    <dialog ref={dialog} aria-labelledby="share-totem-title"
      className="m-auto max-h-[90svh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto border border-or bg-nuit p-6 text-ivoire backdrop:bg-black/70 sm:p-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 id="share-totem-title" className="font-display text-3xl">{fr ? "Partager mon totem" : "Share my totem"}</h2>
        <button type="button" className="min-h-11 min-w-11" aria-label={fr ? "Fermer" : "Close"}
          onClick={() => dialog.current?.close()}>×</button>
      </div>
      {loaded && !share && <form onSubmit={event => { event.preventDefault(); void request("POST"); }} className="space-y-5">
        <p className="text-sm leading-relaxed">{fr
          ? "Créez un lien public avec un aperçu de votre totem portant un filigrane et un court extrait de votre histoire ancestrale."
          : "Create a public link with a watermarked preview of your totem and a short excerpt from your ancestral story."}</p>
        <label className="block text-sm">{fr ? "Prénom ou pseudonyme à afficher" : "First name or nickname to display"}
          <input value={name} onChange={event => setName(event.target.value)} required maxLength={40}
            autoComplete="off" className="mt-2 min-h-11 w-full border border-ombre bg-transparent px-3 py-2"
            pattern="[\p{L}\p{M}\p{N} '\u2019\-]+" />
        </label>
        <p className="text-sm text-ivoire/70">{fr
          ? "Toute personne disposant du lien pourra consulter cet aperçu. Vous pourrez désactiver le lien ici."
          : "Anyone with the link can view this preview. You can disable the link here."}</p>
        <button disabled={busy || !name.trim()} className={buttonClass} type="submit">
          {busy ? (fr ? "Création…" : "Creating…") : (fr ? "Créer mon lien de partage" : "Create my sharing link")}
        </button>
      </form>}
      {loaded && share && <div className="space-y-5">
        <p>{fr ? `Votre aperçu public est au nom de ${share.display_name}.` : `Your public preview is named ${share.display_name}.`}</p>
        <input aria-label={fr ? "Lien de partage" : "Sharing link"} readOnly value={url}
          onFocus={event => event.currentTarget.select()} className="min-h-11 w-full border border-ombre bg-transparent px-3 text-sm" />
        <div className="flex flex-wrap gap-3">
          <button type="button" className={buttonClass} onClick={() => void send()}>{fr ? "Partager le lien" : "Share link"}</button>
          <a className={buttonClass} href={path} target="_blank" rel="noreferrer">{fr ? "Voir l’aperçu" : "View preview"}</a>
          <button type="button" disabled={busy} className={buttonClass} onClick={() => void request("DELETE")}>
            {fr ? "Désactiver le lien" : "Disable link"}
          </button>
        </div>
        <p className="text-sm text-ivoire/70">{fr
          ? "Les captures et les aperçus déjà enregistrés par les réseaux peuvent subsister après la désactivation."
          : "Screenshots and previews already saved by social networks may remain after disabling the link."}</p>
      </div>}
      {busy && !loaded && <p role="status">{fr ? "Chargement…" : "Loading…"}</p>}
      {!busy && !loaded && <button type="button" className={buttonClass} onClick={() => void request("GET")}>{fr ? "Réessayer" : "Try again"}</button>}
      <p role="status" className="mt-4 text-sm text-or">{notice}</p>
    </dialog>
  </>;
}
