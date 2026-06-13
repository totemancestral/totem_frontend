"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { session } = useSupabaseSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [commandes, setCommandes] = useState<CommandeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = session?.access_token;

  useEffect(() => {
    if (!session) {
      router.replace("/fr/auth");
      return;
    }
    if (!token) return;

    async function load() {
      setLoading(true);
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
  }, [token]);

  return (
    <main
      className="min-h-screen px-5 py-24"
      style={{ background: "var(--nuit-profonde)", color: "var(--ivoire)" }}
    >
      <div className="mx-auto max-w-5xl">
        <p className="caption uppercase mb-4" style={{ color: "var(--or-ancestral)" }}>
          SENYCE PARTNERS
        </p>
        <h1 className="h-display text-4xl mb-6" style={{ color: "var(--or-ancestral)" }}>
          Tableau de bord admin
        </h1>

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
              <StatCard
                label="Revenu"
                value={`${(stats.revenuTotal / 100).toFixed(0)} €`}
              />
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
