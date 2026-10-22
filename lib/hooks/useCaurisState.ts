"use client";
import { useCallback, useEffect, useState } from "react";
import { caurisRequest, type CaurisState } from "@/lib/cauris";
import { usePathname, useRouter } from "next/navigation";

export function useCaurisState() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<CaurisState | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => { setError(false); setRevision((n) => n + 1); }, []);
  useEffect(() => {
    const controller = new AbortController();
    void caurisRequest<CaurisState>("etat", undefined, controller.signal).then((value) => {
      if (!controller.signal.aborted) setState(value);
    }).catch((failure) => {
      if (controller.signal.aborted) return;
      if (failure instanceof Error && failure.message === "unauthenticated") {
        const lang = pathname.split("/")[1] === "en" ? "en" : "fr";
        router.replace(`/${lang}/connexion?redirect=${encodeURIComponent(pathname + window.location.search)}`);
      } else setError(true);
    });
    return () => controller.abort();
  }, [revision, pathname, router]);
  return { state, error, retry };
}
