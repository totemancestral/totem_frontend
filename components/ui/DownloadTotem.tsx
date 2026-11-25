"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function DownloadTotem({ commandeId, lang, className }: {
  commandeId: string; lang: string; className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const pending = useRef(false);
  const fr = lang === "fr";
  async function download() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true); setFailed(false);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Session expired");
      const response = await fetch(`/api/oeuvre/${encodeURIComponent(commandeId)}/totem`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
        cache: "no-store", signal: AbortSignal.timeout(60_000),
      });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png")) throw new Error("Download unavailable");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "TOTEM-ANCESTRAL-Mon-Totem.png";
      document.body.append(link); link.click(); link.remove();
      // Keep the URL alive while mobile browsers start saving the file.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch { setFailed(true); }
    finally { pending.current = false; setBusy(false); }
  }
  return <>
    <button type="button" onClick={() => void download()} disabled={busy} aria-busy={busy}
      className={className ?? "border border-or px-6 py-3.5 text-sm text-ivoire transition-colors hover:bg-or/10 disabled:opacity-50"}>
      {busy ? (fr ? "Préparation du PNG…" : "Preparing PNG…") : (fr ? "Télécharger mon totem" : "Download my totem")}
    </button>
    {failed && <p role="alert" className="text-sm text-ivoire">{fr
      ? "Le téléchargement est indisponible. Veuillez réessayer. Si nécessaire, reconnectez-vous."
      : "The download is unavailable. Please try again or sign in again if needed."}</p>}
  </>;
}
