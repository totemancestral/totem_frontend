"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/hooks/use-supabase-session";

type AdminStats = {
  totalCommandes: number;
  commandesActives: number;
  revenuTotal: number;
  erreurs: number;
  aujourdHui: number;
};

type CommandeRow = {
  id: string;
  user_id: string;
  offre: string;
  statut: string;
  montant_cents: number;
  devise: string;
  created_at: string;
};

export default function AdminPage() {
  const { session } = useSupabaseSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [commandes, setCommandes] = useState<CommandeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const token = session?.access_token;

  useEffect(() => {
    if (!session || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);

    async function load() {
      setError(null);
      try {
        const [statsRes, cmdRes] = await Promise.all([
          fetch("/api/fgh55_fh/stats", {
            headers: { authorization: `Bearer ${token}` },
          }),
          fetch("/api/fgh55_fh/commandes?limit=10", {
            headers: { authorization: `Bearer ${token}` },
          }),
        ]);

        if (!statsRes.ok || !cmdRes.ok) {
          const errData = await statsRes.json().catch(() => ({}));
          throw new Error((errData as { error?: string }).error ?? "Acces refuse");
        }

        const statsData: AdminStats = await statsRes.json();
        const cmdData: { commandes: CommandeRow[] } = await cmdRes.json();

        setStats(statsData);
        setCommandes(cmdData.commandes ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, session]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setLoginError(authError.message);
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setStats(null);
    setCommandes([]);
    setEmail("");
    setPassword("");
  }

  if (!session) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-5"
        style={{ background: "var(--nuit-profonde)", color: "var(--ivoire)" }}
      >
        <form
          onSubmit={handleLogin}
          className="flex w-full max-w-sm flex-col gap-5 rounded-lg border p-8"
          style={{ borderColor: "rgba(201,168,76,0.3)" }}
        >
          <div className="text-center">
            <p className="caption uppercase mb-2" style={{ color: "var(--or-ancestral)" }}>
              SENYCE PARTNERS
            </p>
            <h1 className="h-display text-2xl" style={{ color: "var(--or-ancestral)" }}>
              Administration
            </h1>
            <p className="text-sm mt-2" style={{ color: "rgba(254,252,240,0.6)" }}>
              Identifie-toi pour accéder au tableau de bord.
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <span className="caption uppercase text-xs" style={{ color: "rgba(237,217,154,0.78)" }}>
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@totemancestral.com"
              required
              className="form-input"
              autoComplete="email"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="caption uppercase text-xs" style={{ color: "rgba(237,217,154,0.78)" }}>
              Mot de passe
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="form-input"
              autoComplete="current-password"
            />
          </label>

          {loginError && (
            <p className="text-sm text-center" style={{ color: "#E07A6B" }}>
              {loginError}
            </p>
          )}

          <button type="submit" disabled={loginLoading} className="btn-primary w-full">
            {loginLoading ? "..." : "Entrer"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-5 py-24"
      style={{ background: "var(--nuit-profonde)", color: "var(--ivoire)" }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="caption uppercase mb-2" style={{ color: "var(--or-ancestral)" }}>
              SENYCE PARTNERS
            </p>
            <h1 className="h-display text-4xl" style={{ color: "var(--or-ancestral)" }}>
              Tableau de bord admin
            </h1>
          </div>
          <button type="button" onClick={handleLogout} className="btn-secondary text-sm">
            Déconnexion
          </button>
        </div>

        {loading && <p className="quote-italic">Chargement...</p>}

        {error && (
          <div
            className="rounded-lg border p-6"
            style={{ borderColor: "rgba(224,122,107,0.45)" }}
          >
            <p className="text-lg" style={{ color: "#E07A6B" }}>
              {error}
            </p>
          </div>
        )}

        {stats && (
          <>
            <div className="grid gap-4 mb-8 md:grid-cols-5">
              <StatCard label="Commandes" value={stats.totalCommandes.toString()} />
              <StatCard label="Actives" value={stats.commandesActives.toString()} />
              <StatCard label="Revenu" value={`${(stats.revenuTotal / 100).toFixed(0)} €`} />
              <StatCard label="Erreurs" value={stats.erreurs.toString()} />
              <StatCard label="Aujourd'hui" value={stats.aujourdHui.toString()} />
            </div>

            <section>
              <h2 className="h-display text-2xl mb-4" style={{ color: "var(--or-ancestral)" }}>
                Dernieres commandes
              </h2>
              {commandes.length === 0 ? (
                <p className="quote-italic">Aucune commande.</p>
              ) : (
                <div className="grid gap-3">
                  {commandes.map((cmd) => (
                    <div
                      key={cmd.id}
                      className="rounded-lg border p-4 grid gap-2 md:grid-cols-4"
                      style={{
                        background: "rgba(26,26,46,0.72)",
                        borderColor: "rgba(201,168,76,0.22)",
                      }}
                    >
                      <div>
                        <p className="caption uppercase text-xs">ID</p>
                        <p className="text-sm">{cmd.id.slice(0, 12)}...</p>
                      </div>
                      <div>
                        <p className="caption uppercase text-xs">Client</p>
                        <p className="text-sm">{cmd.user_id.slice(0, 12)}</p>
                      </div>
                      <div>
                        <p className="caption uppercase text-xs">Offre</p>
                        <p className="text-sm capitalize">{cmd.offre}</p>
                      </div>
                      <div>
                        <p className="caption uppercase text-xs">Statut</p>
                        <span
                          className="inline-block rounded px-2 py-0.5 text-xs uppercase"
                          style={statusBadgeStyle(cmd.statut)}
                        >
                          {cmd.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article
      className="rounded-lg border p-4 text-center"
      style={{ background: "rgba(26,26,46,0.72)", borderColor: "rgba(201,168,76,0.22)" }}
    >
      <p className="caption uppercase text-xs mb-1" style={{ color: "rgba(237,217,154,0.72)" }}>
        {label}
      </p>
      <p className="h-display text-3xl" style={{ color: "var(--or-ancestral)" }}>
        {value}
      </p>
    </article>
  );
}

function statusBadgeStyle(status: string): React.CSSProperties {
  if (status === "livree") {
    return {
      borderColor: "rgba(201,168,76,0.45)",
      color: "var(--or-ancestral)",
      background: "rgba(45,45,26,0.58)",
      borderWidth: 1,
      borderStyle: "solid",
    };
  }
  if (status === "erreur") {
    return {
      borderColor: "rgba(224,122,107,0.45)",
      color: "#E07A6B",
      background: "rgba(224,122,107,0.08)",
      borderWidth: 1,
      borderStyle: "solid",
    };
  }
  return {
    borderColor: "rgba(237,217,154,0.28)",
    color: "var(--or-pale)",
    background: "rgba(26,26,46,0.86)",
    borderWidth: 1,
    borderStyle: "solid",
  };
}
