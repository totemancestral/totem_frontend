"use client";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { adminText } from "@/lib/admin-copy";

export function useAdminLocale() {
  const pathname = usePathname();
  const lang = pathname?.split("/")[1] === "en" ? "en" : "fr";
  return useMemo(() => ({ lang: lang as "fr" | "en", t: (key: string, values?: Record<string, string | number>) => adminText(lang, key, values) }), [lang]);
}
