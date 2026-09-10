"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { supabase } from "@/lib/supabase/client";
import { MfaEnroll } from "@/components/admin/MfaEnroll";
import { MfaChallenge } from "@/components/admin/MfaChallenge";
import { OverviewSection } from "@/components/admin/OverviewSection";
import { CommandesSection } from "@/components/admin/CommandesSection";
import { OeuvresSection } from "@/components/admin/OeuvresSection";
import { UtilisateursSection } from "@/components/admin/UtilisateursSection";
import { ActiviteSection } from "@/components/admin/ActiviteSection";
import { EvenementsSection } from "@/components/admin/EvenementsSection";

type Tab = "overview" | "commandes" | "oeuvres" | "utilisateurs" | "activite" | "evenements";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Vue d'ensemble" },
  { key: "commandes", label: "Commandes" },
  { key: "oeuvres", label: "Œuvres" },
  { key: "utilisateurs", label: "Utilisateurs" },
  { key: "activite", label: "Activité" },
  { key: "evenements", label: "Événements" },
];

type GuardState = "checking" | "denied" | "mfa-enroll" | "mfa-challenge" | "allowed";

export default function Admin({ lang }: { lang: string }) {
  const router = useRouter();
  const [guard, setGuard] = useState<GuardState>("checking");
  const [challengeFactorId, setChallengeFactorId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  const runGuard = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) {
      router.replace(`/${lang}/connexion?redirect=${encodeURIComponent(`/${lang}/admin`)}`);
      return;
    }

    const { data: role } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!role) {
      setGuard("denied");
      return;
    }

    // Rôle admin confirmé : la 2FA devient obligatoire à partir d'ici.
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const verifiedTotp = factorsData?.totp.find((f) => f.status === "verified");

    if (!verifiedTotp) {
      setGuard("mfa-enroll");
      return;
    }

    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel !== "aal2") {
      setChallengeFactorId(verifiedTotp.id);
      setGuard("mfa-challenge");
      return;
    }

    setGuard("allowed");
  }, [lang, router]);

  useEffect(() => {
    (async () => {
      await runGuard();
    })();
  }, [runGuard]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace(`/${lang}`);
  }

  if (guard === "checking") {
    return <div className="min-h-screen bg-nuit" />;
  }

  if (guard === "denied") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-nuit px-6 text-center">
        <Logo size={40} />
        <p className="text-lg text-ivoire">Accès réservé à l&apos;équipe.</p>
        <p className="text-sm text-grisclair">Ce compte n&apos;a pas les droits nécessaires.</p>
      </div>
    );
  }

  if (guard === "mfa-enroll") {
    return <MfaEnroll onEnrolled={runGuard} />;
  }

  if (guard === "mfa-challenge" && challengeFactorId) {
    return <MfaChallenge factorId={challengeFactorId} onVerified={runGuard} />;
  }

  return (
    <div className="flex min-h-screen bg-nuit">
      {/* barre latérale */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ombre px-6 py-8 lg:flex">
        <div className="mb-10 flex items-center gap-2.5">
          <Logo size={20} />
          <span className="text-xs tracking-[0.18em] text-ivoire uppercase">Totem — Admin</span>
        </div>
        <nav className="flex flex-col gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`border-l-2 px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                tab === t.key ? "border-or text-ivoire" : "border-transparent text-grisclair hover:text-ivoire"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-auto pt-8 text-left text-xs uppercase tracking-wide text-grisclair hover:text-ivoire"
        >
          Déconnexion
        </button>
      </aside>

      {/* barre mobile */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-ombre bg-nuit px-6 py-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Logo size={18} />
          <span className="text-xs tracking-[0.18em] text-ivoire uppercase">Admin</span>
        </div>
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value as Tab)}
          className="border border-ombre bg-indigo px-2 py-1.5 text-xs text-ivoire"
        >
          {TABS.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* contenu */}
      <main className="flex-1 overflow-x-hidden px-6 py-10 pt-24 lg:px-10 lg:pt-10">
        {tab === "overview" && <OverviewSection />}
        {tab === "commandes" && <CommandesSection />}
        {tab === "oeuvres" && <OeuvresSection />}
        {tab === "utilisateurs" && <UtilisateursSection />}
        {tab === "activite" && <ActiviteSection />}
        {tab === "evenements" && <EvenementsSection />}
      </main>
    </div>
  );
}
