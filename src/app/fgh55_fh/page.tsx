"use client";

import { useEffect, useState, type FormEvent, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Menu, X } from "lucide-react";

type Section = "apercu" | "commandes" | "utilisateurs" | "activite" | "evenements";

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

type ProfileRow = {
  id: string;
  email: string | null;
  prenom: string | null;
  created_at: string;
  langue: string;
  pays: string | null;
  total_commandes: number;
  commandes_actives: number;
};

type ActivitePoint = {
  date: string;
  commandes: number;
  revenu: number;
  inscriptions: number;
};

type EvenementErreur = {
  id: string;
  commande_id?: string;
  type?: string;
  message?: string;
  created_at: string;
};

type ChangementStatut = {
  id: string;
  offre: string;
  statut: string;
  updated_at: string;
  user_id: string;
};

export default function AdminPage() {
  const { session } = useSupabaseSession();
  const [section, setSection] = useState<Section>("apercu");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [commandes, setCommandes] = useState<CommandeRow[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<ProfileRow[]>([]);
  const [activite, setActivite] = useState<ActivitePoint[]>([]);
  const [erreurs, setErreurs] = useState<EvenementErreur[]>([]);
  const [changements, setChangements] = useState<ChangementStatut[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [relanceLoading, setRelanceLoading] = useState<string | null>(null);

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
    loadAll(token);
  }, [token, session]);

  useEffect(() => {
    if (!mobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  async function loadAll(t: string) {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, cmdRes, usersRes, actRes, evtRes] = await Promise.all([
        fetch("/api/fgh55_fh/stats", { headers: { authorization: `Bearer ${t}` } }),
        fetch("/api/fgh55_fh/commandes?limit=20", { headers: { authorization: `Bearer ${t}` } }),
        fetch("/api/fgh55_fh/utilisateurs?limit=20", { headers: { authorization: `Bearer ${t}` } }),
        fetch("/api/fgh55_fh/activite", { headers: { authorization: `Bearer ${t}` } }),
        fetch("/api/fgh55_fh/evenements", { headers: { authorization: `Bearer ${t}` } }),
      ]);

      if (!statsRes.ok || !cmdRes.ok || !usersRes.ok || !actRes.ok || !evtRes.ok) {
        throw new Error("Acces refuse");
      }

      setStats(await statsRes.json());
      setCommandes(((await cmdRes.json()) as { commandes: CommandeRow[] }).commandes ?? []);
      setUtilisateurs(
        ((await usersRes.json()) as { utilisateurs: ProfileRow[] }).utilisateurs ?? [],
      );
      setActivite(((await actRes.json()) as { serie: ActivitePoint[] }).serie ?? []);
      const evtData = (await evtRes.json()) as {
        erreurs: EvenementErreur[];
        changements: ChangementStatut[];
      };
      setErreurs(evtData.erreurs ?? []);
      setChangements(evtData.changements ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setLoginError(authError.message);
      setLoginLoading(false);
    }
  }

  const handleRelancer = useCallback(
    async (commandeId: string) => {
      if (!token) return;
      setRelanceLoading(commandeId);
      try {
        const res = await fetch("/api/fgh55_fh/relancer", {
          method: "POST",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify({ commandeId }),
        });
        if (res.ok) {
          loadAll(token);
        } else {
          const err = (await res.json()) as { error: string };
          alert(err.error || "Erreur lors de la relance");
        }
      } catch {
        alert("Erreur reseau");
      } finally {
        setRelanceLoading(null);
      }
    },
    [token],
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    setStats(null);
    setCommandes([]);
    setUtilisateurs([]);
    setActivite([]);
    setErreurs([]);
    setChangements([]);
    setEmail("");
    setPassword("");
  }

  if (!session) {
    return (
      <LoginForm
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        loginError={loginError}
        loginLoading={loginLoading}
        onSubmit={handleLogin}
      />
    );
  }

  const navItems: { id: Section; label: string }[] = [
    { id: "apercu", label: "Vue d'ensemble" },
    { id: "commandes", label: "Commandes" },
    { id: "utilisateurs", label: "Utilisateurs" },
    { id: "activite", label: "Activité" },
    { id: "evenements", label: "Événements" },
  ];

  return (
    <div
      className="premium-page flex min-h-screen"
      style={{ background: "var(--nuit-profonde)", color: "var(--ivoire)" }}
    >
      <div className="premium-watermark" aria-hidden="true">
        <img src="/assets/totem-logo.png" alt="" />
      </div>
      <Sidebar
        navItems={navItems}
        active={section}
        onSelect={(s) => {
          setSection(s);
          setMobileOpen(false);
        }}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto px-5 py-6 md:px-8 md:py-10 lg:ml-64">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="btn-secondary px-4 py-2 text-xs"
            >
              <Menu size={16} />
              Menu
            </button>
            <p className="caption uppercase text-xs" style={{ color: "var(--or-ancestral)" }}>
              SENYCE PARTNERS
            </p>
          </div>

          {loading && <p className="quote-italic">Chargement...</p>}
          {error && (
            <div
              className="premium-panel mb-6 p-6"
              style={{ borderColor: "rgba(224,122,107,0.45)" }}
            >
              <p style={{ color: "#E07A6B" }}>{error}</p>
            </div>
          )}

          {section === "apercu" && <OverviewSection stats={stats} />}
          {section === "commandes" && <OrdersSection commandes={commandes} />}
          {section === "utilisateurs" && <UsersSection utilisateurs={utilisateurs} />}
          {section === "activite" && <ActivitySection activite={activite} />}
          {section === "evenements" && (
            <EventsSection
              erreurs={erreurs}
              changements={changements}
              commandes={commandes}
              onRelancer={handleRelancer}
              relanceLoading={relanceLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                           */
/* ------------------------------------------------------------------ */
function Sidebar({
  navItems,
  active,
  onSelect,
  mobileOpen,
  onClose,
  onLogout,
}: {
  navItems: { id: Section; label: string }[];
  active: Section;
  onSelect: (s: Section) => void;
  mobileOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const sidebar = (
    <div className="premium-sidebar flex h-full flex-col gap-6 p-6">
      <div className="text-center">
        <img
          src="/assets/totem-logo.png"
          alt=""
          className="mx-auto mb-3 h-12 w-12 object-contain"
        />
        <p className="caption uppercase text-xs" style={{ color: "var(--or-ancestral)" }}>
          SENYCE PARTNERS
        </p>
        <h2 className="logo-wordmark text-base mt-1">Totem Ancestral</h2>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="rounded-sm px-4 py-3 text-left text-sm uppercase transition-colors hover:bg-ombre"
            style={{
              background: active === item.id ? "rgba(201,168,76,0.12)" : "transparent",
              color: active === item.id ? "var(--or-ancestral)" : "rgba(254,252,240,0.72)",
              borderLeft:
                active === item.id ? "3px solid var(--or-ancestral)" : "3px solid transparent",
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <button type="button" onClick={onLogout} className="btn-secondary w-full text-xs py-3">
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className="fixed left-0 top-0 z-40 hidden h-full w-64 lg:block"
        style={{ borderRight: "1px solid rgba(216,173,77,0.18)" }}
      >
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[300] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Fermer le menu"
            onClick={onClose}
          />
          <aside
            className="fixed inset-y-0 left-0 z-[310] w-[min(18rem,calc(100vw-1rem))] overflow-y-auto"
            style={{ borderRight: "1px solid rgba(216,173,77,0.18)" }}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-sm border"
              style={{ borderColor: "rgba(216,173,77,0.28)", color: "var(--or-ancestral)" }}
              aria-label="Fermer le menu"
              onClick={onClose}
            >
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Login                                                             */
/* ------------------------------------------------------------------ */
function LoginForm({
  email,
  password,
  setEmail,
  setPassword,
  loginError,
  loginLoading,
  onSubmit,
}: {
  email: string;
  password: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  loginError: string | null;
  loginLoading: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <main
      className="premium-page flex min-h-screen items-center justify-center overflow-hidden px-5"
      style={{ background: "var(--nuit-profonde)", color: "var(--ivoire)" }}
    >
      <div className="premium-watermark" aria-hidden="true">
        <img src="/assets/totem-logo.png" alt="" />
      </div>
      <form
        onSubmit={onSubmit}
        className="premium-panel-strong flex w-full max-w-sm flex-col gap-5 p-8"
      >
        <div className="text-center">
          <img
            src="/assets/totem-logo.png"
            alt=""
            className="mx-auto mb-4 h-14 w-14 object-contain"
          />
          <p className="caption uppercase mb-2" style={{ color: "var(--or-ancestral)" }}>
            SENYCE PARTNERS
          </p>
          <h1 className="h-display text-3xl" style={{ color: "var(--ivoire)" }}>
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

/* ------------------------------------------------------------------ */
/*  Overview Section                                                  */
/* ------------------------------------------------------------------ */
function OverviewSection({ stats }: { stats: AdminStats | null }) {
  if (!stats) return null;

  const cards = [
    { label: "Total commandes", value: stats.totalCommandes.toString() },
    { label: "Actives", value: stats.commandesActives.toString() },
    { label: "Revenu total", value: `${(stats.revenuTotal / 100).toFixed(0)} €` },
    { label: "Erreurs", value: stats.erreurs.toString() },
    { label: "Aujourd'hui", value: stats.aujourdHui.toString() },
  ];

  return (
    <section>
      <h1 className="h-display text-3xl mb-2" style={{ color: "var(--or-ancestral)" }}>
        Vue d'ensemble
      </h1>
      <p className="quote-italic text-sm mb-8">Tableau de bord administratif — Totem Ancestral</p>

      <div className="grid gap-4 mb-10 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <article key={c.label} className="premium-panel p-5 text-center">
            <p
              className="caption uppercase text-xs mb-1"
              style={{ color: "rgba(237,217,154,0.72)" }}
            >
              {c.label}
            </p>
            <p className="h-display text-3xl" style={{ color: "var(--or-ancestral)" }}>
              {c.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Orders Section                                                    */
/* ------------------------------------------------------------------ */
function OrdersSection({ commandes }: { commandes: CommandeRow[] }) {
  return (
    <section>
      <h2 className="h-display text-2xl mb-6" style={{ color: "var(--or-ancestral)" }}>
        Commandes
      </h2>

      {commandes.length === 0 ? (
        <p className="quote-italic">Aucune commande.</p>
      ) : (
        <div className="grid gap-3">
          {commandes.map((cmd) => (
            <div key={cmd.id} className="premium-row grid gap-3 p-4 md:grid-cols-5 md:items-center">
              <div>
                <p className="caption uppercase text-xs">ID</p>
                <p className="text-sm font-mono">{cmd.id.slice(0, 12)}…</p>
              </div>
              <div>
                <p className="caption uppercase text-xs">Client</p>
                <p className="text-sm font-mono">{cmd.user_id.slice(0, 12)}</p>
              </div>
              <div>
                <p className="caption uppercase text-xs">Offre</p>
                <p className="text-sm capitalize">{cmd.offre}</p>
              </div>
              <div>
                <p className="caption uppercase text-xs">Montant</p>
                <p className="text-sm">
                  {(cmd.montant_cents / 100).toFixed(2)} {cmd.devise?.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="caption uppercase text-xs">Statut</p>
                <StatusBadge statut={cmd.statut} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Users Section                                                     */
/* ------------------------------------------------------------------ */
function UsersSection({ utilisateurs }: { utilisateurs: ProfileRow[] }) {
  return (
    <section>
      <h2 className="h-display text-2xl mb-6" style={{ color: "var(--or-ancestral)" }}>
        Utilisateurs
      </h2>

      {utilisateurs.length === 0 ? (
        <p className="quote-italic">Aucun utilisateur.</p>
      ) : (
        <div className="grid gap-3">
          {utilisateurs.map((u) => (
            <div key={u.id} className="premium-row grid gap-3 p-4 md:grid-cols-5 md:items-center">
              <div>
                <p className="caption uppercase text-xs">Email</p>
                <p className="text-sm">{u.email ?? "—"}</p>
              </div>
              <div>
                <p className="caption uppercase text-xs">Prénom</p>
                <p className="text-sm">{u.prenom ?? "—"}</p>
              </div>
              <div>
                <p className="caption uppercase text-xs">Langue</p>
                <p className="text-sm uppercase">{u.langue}</p>
              </div>
              <div>
                <p className="caption uppercase text-xs">Commandes</p>
                <p className="text-sm">
                  {u.total_commandes} (
                  {u.commandes_actives > 0 ? `${u.commandes_actives} active` : "0 active"})
                </p>
              </div>
              <div>
                <p className="caption uppercase text-xs">Inscrit le</p>
                <p className="text-sm">{new Date(u.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity Section                                                  */
/* ------------------------------------------------------------------ */
function ActivitySection({ activite }: { activite: ActivitePoint[] }) {
  if (activite.length === 0) return <p className="quote-italic">Aucune donnée d'activité.</p>;

  const fmtDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}`;
  };

  return (
    <section>
      <h2 className="h-display text-2xl mb-2" style={{ color: "var(--or-ancestral)" }}>
        Activité (30 jours)
      </h2>
      <p className="quote-italic text-sm mb-6">Commandes, revenus et inscriptions quotidiennes.</p>

      <div className="premium-panel mb-8 p-5">
        <h3 className="mb-4 text-sm uppercase" style={{ color: "var(--or-pale)" }}>
          Commandes par jour
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={activite}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(216,173,77,0.08)" />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              stroke="rgba(226,225,238,0.42)"
              tick={{ fontSize: 11 }}
            />
            <YAxis allowDecimals={false} stroke="rgba(226,225,238,0.42)" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#1e1f28",
                border: "1px solid rgba(216,173,77,0.3)",
                borderRadius: 6,
                color: "#e2e1ee",
              }}
              labelFormatter={(v) => new Date(v).toLocaleDateString("fr-FR")}
            />
            <Legend />
            <Bar dataKey="commandes" name="Commandes" fill="#d8ad4d" radius={[3, 3, 0, 0]} />
            <Bar dataKey="inscriptions" name="Inscriptions" fill="#f6c865" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="premium-panel p-5">
        <h3 className="mb-4 text-sm uppercase" style={{ color: "var(--or-pale)" }}>
          Revenu par jour
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={activite}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(216,173,77,0.08)" />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              stroke="rgba(226,225,238,0.42)"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              stroke="rgba(226,225,238,0.42)"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `${(v / 100).toFixed(0)}€`}
            />
            <Tooltip
              contentStyle={{
                background: "#1e1f28",
                border: "1px solid rgba(216,173,77,0.3)",
                borderRadius: 6,
                color: "#e2e1ee",
              }}
              labelFormatter={(v) => new Date(v).toLocaleDateString("fr-FR")}
              formatter={(value: number) => [`${(value / 100).toFixed(2)} €`, "Revenu"]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenu"
              name="Revenu"
              stroke="#d8ad4d"
              strokeWidth={2}
              dot={{ fill: "#d8ad4d", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Events Section                                                    */
/* ------------------------------------------------------------------ */
function EventsSection({
  erreurs,
  changements,
  commandes,
  onRelancer,
  relanceLoading,
}: {
  erreurs: EvenementErreur[];
  changements: ChangementStatut[];
  commandes: CommandeRow[];
  onRelancer: (id: string) => void;
  relanceLoading: string | null;
}) {
  const commandesErreur = commandes.filter((c) => c.statut === "erreur");

  return (
    <section>
      <h2 className="h-display text-2xl mb-6" style={{ color: "var(--or-ancestral)" }}>
        Événements
      </h2>

      <div className="mb-8">
        <h3 className="mb-3 text-sm uppercase" style={{ color: "var(--or-pale)" }}>
          Changements de statut
        </h3>
        {changements.length === 0 ? (
          <p className="quote-italic">Aucun changement récent.</p>
        ) : (
          <div className="grid gap-2">
            {changements.map((c) => (
              <div key={c.id} className="premium-row flex items-center justify-between p-3">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs">{c.id.slice(0, 10)}…</span>
                  <span className="capitalize text-sm">{c.offre}</span>
                  <StatusBadge statut={c.statut} />
                </div>
                <span className="text-xs" style={{ color: "rgba(254,252,240,0.5)" }}>
                  {new Date(c.updated_at).toLocaleString("fr-FR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {commandesErreur.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-sm uppercase" style={{ color: "rgba(224,122,107,0.8)" }}>
            Commandes en erreur — Relance
          </h3>
          <div className="grid gap-2">
            {commandesErreur.map((cmd) => (
              <div
                key={cmd.id}
                className="flex items-center justify-between rounded-lg border p-4"
                style={{
                  background: "rgba(224,122,107,0.06)",
                  borderColor: "rgba(224,122,107,0.25)",
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs">{cmd.id.slice(0, 12)}…</span>
                  <span className="capitalize text-sm">{cmd.offre}</span>
                  <StatusBadge statut={cmd.statut} />
                </div>
                <button
                  type="button"
                  disabled={relanceLoading === cmd.id}
                  onClick={() => onRelancer(cmd.id)}
                  className="rounded px-4 py-2 text-xs uppercase tracking-wider transition-colors"
                  style={{
                    background:
                      relanceLoading === cmd.id
                        ? "rgba(216,173,77,0.12)"
                        : "rgba(224,122,107,0.72)",
                    color: "#fff",
                    opacity: relanceLoading === cmd.id ? 0.6 : 1,
                    border: "1px solid rgba(224,122,107,0.45)",
                  }}
                >
                  {relanceLoading === cmd.id ? "..." : "Relancer"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm uppercase" style={{ color: "rgba(224,122,107,0.8)" }}>
          Erreurs pipeline
        </h3>
        {erreurs.length === 0 ? (
          <p className="quote-italic">Aucune erreur récente.</p>
        ) : (
          <div className="grid gap-2">
            {erreurs.map((e) => (
              <div
                key={e.id}
                className="rounded-lg border p-3"
                style={{
                  background: "rgba(224,122,107,0.06)",
                  borderColor: "rgba(224,122,107,0.25)",
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-mono text-xs" style={{ color: "#E07A6B" }}>
                    {e.type ?? "Erreur"}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(254,252,240,0.4)" }}>
                    {new Date(e.created_at).toLocaleString("fr-FR")}
                  </span>
                </div>
                <p className="text-sm">{e.message ?? "—"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                      */
/* ------------------------------------------------------------------ */
function StatusBadge({ statut, className }: { statut: string; className?: string }) {
  const colors: Record<string, { border: string; color: string; bg: string }> = {
    livree: {
      border: "rgba(216,173,77,0.45)",
      color: "var(--or-ancestral)",
      bg: "rgba(51,48,38,0.58)",
    },
    paye: { border: "rgba(216,173,77,0.35)", color: "var(--or-pale)", bg: "rgba(26,27,36,0.86)" },
    en_generation: {
      border: "rgba(246,200,101,0.35)",
      color: "var(--or-pale)",
      bg: "rgba(26,27,36,0.86)",
    },
    en_attente_paiement: {
      border: "rgba(246,200,101,0.18)",
      color: "#888",
      bg: "rgba(26,27,36,0.86)",
    },
    erreur: { border: "rgba(224,122,107,0.45)", color: "#E07A6B", bg: "rgba(224,122,107,0.08)" },
    remboursee: {
      border: "rgba(224,122,107,0.25)",
      color: "#E07A6B",
      bg: "rgba(224,122,107,0.06)",
    },
  };
  const s = colors[statut] ?? {
    border: "rgba(246,200,101,0.28)",
    color: "var(--or-pale)",
    bg: "rgba(26,27,36,0.86)",
  };

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs uppercase ${className ?? ""}`}
      style={{ border: `1px solid ${s.border}`, color: s.color, background: s.bg }}
    >
      {statut.replace(/_/g, " ")}
    </span>
  );
}
