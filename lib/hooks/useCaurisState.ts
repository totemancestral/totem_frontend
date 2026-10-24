"use client";
import { useCallback, useEffect, useState } from "react";
import { caurisRequest, type CaurisState } from "@/lib/cauris";
import { usePathname, useRouter } from "next/navigation";
import { retryErrorNotice } from "@/lib/retry-after";

export function useCaurisState() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<CaurisState | null>(null);
  const [error, setError] = useState(false);
  const [delayNotice, setDelayNotice] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => { setError(false); setDelayNotice(null); setRevision((n) => n + 1); }, []);
  useEffect(() => {
    const controller = new AbortController();
    void caurisRequest<CaurisState>("etat", undefined, controller.signal, pathname.split("/")[1] === "en" ? "en" : "fr").then((value) => {
      if (!controller.signal.aborted) setState(value);
    }).catch((failure) => {
      if (controller.signal.aborted) return;
      if (failure instanceof Error && failure.message === "unauthenticated") {
        const lang = pathname.split("/")[1] === "en" ? "en" : "fr";
        router.replace(`/${lang}/connexion?redirect=${encodeURIComponent(pathname + window.location.search)}`);
      } else { setDelayNotice(retryErrorNotice(failure, pathname.split("/")[1] === "en" ? "en" : "fr")); setError(true); }
    });
    return () => controller.abort();
  }, [revision, pathname, router]);
  return { state, error, retry, delayNotice };
}
