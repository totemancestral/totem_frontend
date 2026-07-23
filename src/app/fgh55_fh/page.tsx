"use client";

import { Children, useEffect, useState, type FormEvent, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton, SkeletonStatCard } from "@/components/ui/skeleton";

type Section = "apercu" | "commandes" | "oeuvres" | "utilisateurs" | "activite" | "evenements";

const COMMAND_STATUSES = [
  "en_attente_paiement",
  "paye",
  "en_generation",
  "livree",
  "erreur",
  "remboursee",
];
const OFFER_TYPES = ["essentiel", "signature", "heritage"];
const OEUVRE_STATUSES = ["en_cours", "livree", "erreur"];

const STATUT_BAR_COLORS: Record<string, string> = {
  en_attente_paiement: "#9aa0b5",
  paye: "#f6c865",
  en_generation: "#c9a24d",
  livree: "#d8ad4d",
  erreur: "#E07A6B",
  remboursee: "#c0895f",
};

type AdminStats = {
  totalCommandes: number;
  commandesActives: number;
  revenuTotal: number;
  erreurs: number;
  aujourdHui: number;
  totalUtilisateurs: number;
  totalOeuvres: number;
  oeuvresLivrees: number;
};

type CommandeRow = {
  id: string;
  user_id: string;
  offre: string;
  statut: string;
  montant_cents: number;
  devise: string;
  created_at: string;
  updated_at: string;
  client_email?: string | null;
  client_prenom?: string | null;
};

type OeuvreRow = {
  id: string;
  user_id: string;
  commande_id: string;
  statut: string;
  nom_totem: string | null;
  numero_serie: string | null;
  image_url: string | null;
  audio_url: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  client_email?: string | null;
  client_prenom?: string | null;
  commande_offre?: string | null;
  commande_statut?: string | null;
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

type CommandeFilters = { search: string; statut: string; offre: string };
type UserFilters = { search: string; langue: string; activite: string };
type OeuvreFilters = { search: string; statut: string; fichier: string };

export default function AdminPage() {
  const { session } = useSupabaseSession();
  const [section, setSection] = useState<Section>("apercu");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [commandes, setCommandes] = useState<CommandeRow[]>([]);
  const [oeuvres, setOeuvres] = useState<OeuvreRow[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<ProfileRow[]>([]);
  const [activite, setActivite] = useState<ActivitePoint[]>([]);
  const [erreurs, setErreurs] = useState<EvenementErreur[]>([]);
  const [changements, setChangements] = useState<ChangementStatut[]>([]);

  const [commandeFilters, setCommandeFilters] = useState<CommandeFilters>({
    search: "",
    statut: "",
    offre: "",
  });
  const [userFilters, setUserFilters] = useState<UserFilters>({
    search: "",
    langue: "",
    activite: "",
  });
  const [oeuvreFilters, setOeuvreFilters] = useState<OeuvreFilters>({
    search: "",
    statut: "",
    fichier: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState<Partial<Record<Section, boolean>>>({});

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
      const [statsRes, cmdRes, oeuvresRes, usersRes, actRes, evtRes] = await Promise.all([
        fetch("/api/fgh55_fh/stats", { headers: { authorization: `Bearer ${t}` } }),
        fetch("/api/fgh55_fh/commandes?limit=50", { headers: { authorization: `Bearer ${t}` } }),
        fetch("/api/fgh55_fh/oeuvres?limit=50", { headers: { authorization: `Bearer ${t}` } }),
        fetch("/api/fgh55_fh/utilisateurs?limit=50", {
          headers: { authorization: `Bearer ${t}` },
        }),
        fetch("/api/fgh55_fh/activite", { headers: { authorization: `Bearer ${t}` } }),
        fetch("/api/fgh55_fh/evenements", { headers: { authorization: `Bearer ${t}` } }),
      ]);

      const responses: Record<string, Response> = {
        stats: statsRes,
        commandes: cmdRes,
        oeuvres: oeuvresRes,
        utilisateurs: usersRes,
        activite: actRes,
        evenements: evtRes,
      };
      const failed = Object.entries(responses).find(([, res]) => !res.ok);
      if (failed) {
        const [name, res] = failed;
        let detail = "";
        try {
          const body = (await res.clone().json()) as { error?: string } | null;
          if (body?.error) detail = ` — ${body.error}`;
        } catch {
          /* corps non JSON */
        }
        // Message explicite : 403 = role admin manquant, 500 = cle service Vercel manquante.
        throw new Error(`Acces refuse (${name}: ${res.status}${detail})`);
      }

      setStats(await statsRes.json());
      setCommandes(((await cmdRes.json()) as { commandes: CommandeRow[] }).commandes ?? []);
      setOeuvres(((await oeuvresRes.json()) as { oeuvres: OeuvreRow[] }).oeuvres ?? []);
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
      const message = err instanceof Error ? err.message : "Erreur de chargement";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCommandes(t: string, filters: CommandeFilters) {
    setListLoading((current) => ({ ...current, commandes: true }));
    try {
      const response = await fetch(`/api/fgh55_fh/commandes?${buildQuery(filters)}`, {
        headers: { authorization: `Bearer ${t}` },
      });
      if (!response.ok) throw new Error("Commandes indisponibles");
      setCommandes(((await response.json()) as { commandes: CommandeRow[] }).commandes ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de chargement";
      setError(message);
      toast.error(message);
    } finally {
      setListLoading((current) => ({ ...current, commandes: false }));
    }
  }

  async function loadUtilisateurs(t: string, filters: UserFilters) {
    setListLoading((current) => ({ ...current, utilisateurs: true }));
    try {
      const response = await fetch(`/api/fgh55_fh/utilisateurs?${buildQuery(filters)}`, {
        headers: { authorization: `Bearer ${t}` },
      });
      if (!response.ok) throw new Error("Utilisateurs indisponibles");
      setUtilisateurs(
        ((await response.json()) as { utilisateurs: ProfileRow[] }).utilisateurs ?? [],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de chargement";
      setError(message);
      toast.error(message);
    } finally {
      setListLoading((current) => ({ ...current, utilisateurs: false }));
    }
  }

  async function loadOeuvres(t: string, filters: OeuvreFilters) {
    setListLoading((current) => ({ ...current, oeuvres: true }));
    try {
      const response = await fetch(`/api/fgh55_fh/oeuvres?${buildQuery(filters)}`, {
        headers: { authorization: `Bearer ${t}` },
      });
      if (!response.ok) throw new Error("Œuvres indisponibles");
      setOeuvres(((await response.json()) as { oeuvres: OeuvreRow[] }).oeuvres ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de chargement";
      setError(message);
      toast.error(message);
    } finally {
      setListLoading((current) => ({ ...current, oeuvres: false }));
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setLoginError(authError.message);
      toast.error(authError.message);
      setLoginLoading(false);
    }
  }

  const handleRelancer = useCallback(
    async (commandeId: string) => {
      if (!token) return;
      setRelanceLoading(commandeId);
      try {
        const response = await fetch("/api/fgh55_fh/relancer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ commandeId }),
        });
        const payload = (await response.json().catch(() => null)) as
          | { error?: string; ok?: boolean }
          | null;
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || "La relance n’a pas pu être lancée");
        }
        toast.success("Pipeline relancé");
        setCommandes((current) =>
          current.map((commande) =>
            commande.id === commandeId ? { ...commande, statut: "en_generation" } : commande,
          ),
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur de relance");
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
    setOeuvres([]);
    setUtilisateurs([]);
    setActivite([]);
    setErreurs([]);
    setChangements([]);
    setEmail("");
    setPassword("");
  }

  if (!session) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <LoginForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          loginError={loginError}
          loginLoading={loginLoading}
          onSubmit={handleLogin}
        />
      </>
    );
  }

  const navItems: { id: Section; label: string }[] = [
    { id: "apercu", label: "Vue d'ensemble" },
    { id: "commandes", label: "Commandes" },
    { id: "oeuvres", label: "Œuvres" },
    { id: "utilisateurs", label: "Utilisateurs" },
    { id: "activite", label: "Activité" },
    { id: "evenements", label: "Événements" },
  ];

  const selectAdminSection = (next: Section) => {
    if (next !== section) {
      setSection(next);
      const label = navItems.find((item) => item.id === next)?.label ?? next;
      toast.message(`Section ouverte: ${label}`);
    }
    setMobileOpen(false);
  };

  return (
    <div
      className="premium-page flex min-h-screen"
      style={{ background: "var(--nuit-profonde)", color: "var(--ivoire)" }}
    >
      <Toaster richColors position="top-right" />
      <div className="premium-watermark" aria-hidden="true">
        <img src="/assets/totem-logo.png" alt="" />
      </div>
      <header
        className="fixed inset-x-0 top-0 z-[320] border-b backdrop-blur-md"
        style={{
          background: "rgba(12,14,22,0.9)",
          borderColor: "rgba(216,173,77,0.2)",
        }}
      >
        <div className="mx-auto flex h-[72px] max-w-[1220px] items-center justify-between gap-4 px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center border transition-colors hover:bg-ombre lg:hidden"
              aria-label="Menu"
              title="Menu"
              style={{ borderColor: "rgba(216,173,77,0.28)", color: "var(--or-ancestral)" }}
            >
              <Menu size={17} />
            </button>
            <p className="caption uppercase text-xs" style={{ color: "var(--or-ancestral)" }}>
              SENYCE PARTNERS
            </p>
            <h1
              className="hidden text-[20px] uppercase leading-none sm:block"
              style={{ color: "var(--or-pale)", fontFamily: "var(--font-display)" }}
            >
              Totem Admin
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="btn-secondary !px-4 !py-2 !text-[11px]"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </header>
      <Sidebar
        navItems={navItems}
        active={section}
        onSelect={selectAdminSection}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto px-5 pb-8 pt-24 md:px-8 md:pb-10 md:pt-28 lg:ml-64">
        <div className="mx-auto max-w-6xl">
          {loading && <AdminLoadingCards />}
          {error && (
            <div
              className="premium-panel mb-6 p-6"
              style={{ borderColor: "rgba(224,122,107,0.45)" }}
            >
              <p style={{ color: "#E07A6B" }}>{error}</p>
            </div>
          )}

          {!loading && section === "apercu" && (
            <OverviewSection
              stats={stats}
              activite={activite}
              commandes={commandes}
              oeuvres={oeuvres}
              utilisateurs={utilisateurs}
              erreurs={erreurs}
              changements={changements}
            />
          )}
          {!loading && section === "commandes" && (
            <OrdersSection
              commandes={commandes}
              filters={commandeFilters}
              loading={Boolean(listLoading.commandes)}
              onChange={setCommandeFilters}
              onApply={() => {
                if (!token) return;
                toast.message("Filtre commandes appliqué");
                loadCommandes(token, commandeFilters);
              }}
              onReset={() => {
                const next = { search: "", statut: "", offre: "" };
                setCommandeFilters(next);
                if (token) {
                  toast.message("Filtres commandes réinitialisés");
                  loadCommandes(token, next);
                }
              }}
            />
          )}
          {!loading && section === "oeuvres" && (
            <ArtworksSection
              oeuvres={oeuvres}
              filters={oeuvreFilters}
              loading={Boolean(listLoading.oeuvres)}
              onChange={setOeuvreFilters}
              onApply={() => {
                if (!token) return;
                toast.message("Filtre œuvres appliqué");
                loadOeuvres(token, oeuvreFilters);
              }}
              onReset={() => {
                const next = { search: "", statut: "", fichier: "" };
                setOeuvreFilters(next);
                if (token) {
                  toast.message("Filtres œuvres réinitialisés");
                  loadOeuvres(token, next);
                }
              }}
            />
          )}
          {!loading && section === "utilisateurs" && (
            <UsersSection
              utilisateurs={utilisateurs}
              filters={userFilters}
              loading={Boolean(listLoading.utilisateurs)}
              onChange={setUserFilters}
              onApply={() => {
                if (!token) return;
                toast.message("Filtre utilisateurs appliqué");
                loadUtilisateurs(token, userFilters);
              }}
              onReset={() => {
                const next = { search: "", langue: "", activite: "" };
                setUserFilters(next);
                if (token) {
                  toast.message("Filtres utilisateurs réinitialisés");
                  loadUtilisateurs(token, next);
                }
              }}
            />
          )}
          {!loading && section === "activite" && <ActivitySection activite={activite} />}
          {!loading && section === "evenements" && (
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

function buildQuery(filters: CommandeFilters | UserFilters | OeuvreFilters) {
  const params = new URLSearchParams({ limit: "100" });
  Object.entries(filters).forEach(([key, value]) => {
    const clean = value.trim();
    if (clean) params.set(key, clean);
  });
  return params.toString();
}

function AdminLoadingCards() {
  return (
    <section className="mb-8" aria-busy="true" aria-label="Chargement du tableau de bord">
      {/* En-tête */}
      <div className="mb-6 flex flex-col gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-64 max-w-full" />
      </div>

      {/* Cartes stats (miroir de la vue d'ensemble) */}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <SkeletonStatCard key={`admin-loading-${index}`} />
        ))}
      </div>

      {/* Bloc graphique + listes */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="premium-panel p-5">
          <Skeleton className="mb-4 h-4 w-40" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="premium-panel flex flex-col gap-3 p-5">
          <Skeleton className="mb-1 h-4 w-32" />
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={`admin-loading-row-${index}`} className="h-9 w-full" />
          ))}
        </div>
      </div>
    </section>
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
        className="fixed left-0 top-[72px] z-40 hidden h-[calc(100svh-72px)] w-64 lg:block"
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
            className="fixed left-0 top-[72px] z-[310] h-[calc(100svh-72px)] w-[min(18rem,calc(100vw-1rem))] overflow-y-auto"
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
      className="premium-page relative flex min-h-screen items-center justify-center overflow-hidden px-5"
      style={{ background: "var(--nuit-profonde)", color: "var(--ivoire)" }}
    >
      <div className="premium-watermark" aria-hidden="true">
        <img src="/assets/totem-logo.png" alt="" />
      </div>

      {/* Halo doré */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-[440px] w-[440px] -translate-x-1/2 rounded-full opacity-30 blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(216,173,77,0.5), transparent 60%)" }}
      />

      <form
        onSubmit={onSubmit}
        className="premium-panel-strong relative flex w-full max-w-sm flex-col gap-5 p-8"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="premium-icon-box">
            <ShieldCheck size={21} />
          </div>
          <div>
            <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
              SENYCE PARTNERS
            </p>
            <h1 className="h-display mt-2 text-3xl" style={{ color: "var(--ivoire)" }}>
              Administration
            </h1>
            <p className="body-copy mt-2 text-sm premium-muted">
              Identifie-toi pour accéder au tableau de bord.
            </p>
          </div>
        </div>
        <label className="flex flex-col gap-2">
          <span className="caption uppercase text-xs" style={{ color: "rgba(237,217,154,0.78)" }}>
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@totem-ancestral.com"
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
function OverviewSection({
  stats,
  activite,
  commandes,
  oeuvres,
  utilisateurs,
  erreurs,
  changements,
}: {
  stats: AdminStats | null;
  activite: ActivitePoint[];
  commandes: CommandeRow[];
  oeuvres: OeuvreRow[];
  utilisateurs: ProfileRow[];
  erreurs: EvenementErreur[];
  changements: ChangementStatut[];
}) {
  if (!stats) return null;

  const cards = [
    { label: "Total commandes", value: stats.totalCommandes.toString() },
    { label: "Actives", value: stats.commandesActives.toString() },
    { label: "Revenu total", value: `${(stats.revenuTotal / 100).toFixed(0)} €` },
    { label: "Utilisateurs", value: stats.totalUtilisateurs.toString() },
    { label: "Œuvres", value: stats.totalOeuvres.toString() },
    { label: "Œuvres livrées", value: stats.oeuvresLivrees.toString() },
    { label: "Erreurs", value: stats.erreurs.toString() },
    { label: "Aujourd'hui", value: stats.aujourdHui.toString() },
  ];

  const recentActivity = activite.slice(-7);

  return (
    <section>
      <h1 className="h-display text-3xl mb-2" style={{ color: "var(--or-ancestral)" }}>
        Vue d'ensemble
      </h1>
      <p className="quote-italic text-sm mb-8">
        Tableau de bord administratif — activité, commandes, œuvres et utilisateurs.
      </p>

      <div className="grid gap-4 mb-8 md:grid-cols-4">
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

      <div className="grid gap-4 mb-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="premium-panel p-5">
          <h3 className="mb-4 text-sm uppercase" style={{ color: "var(--or-pale)" }}>
            Activité des 7 derniers jours
          </h3>
          {recentActivity.length === 0 ? (
            <p className="quote-italic">Aucune donnée d'activité.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={recentActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(216,173,77,0.08)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  stroke="rgba(226,225,238,0.42)"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="rgba(226,225,238,0.42)"
                  tick={{ fontSize: 11 }}
                />
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
                <Bar
                  dataKey="inscriptions"
                  name="Inscriptions"
                  fill="#f6c865"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="premium-panel p-5">
          <h3 className="mb-4 text-sm uppercase" style={{ color: "var(--or-pale)" }}>
            Points de contrôle
          </h3>
          <div className="grid gap-3">
            <ActivityLine label="Commandes chargées" value={commandes.length.toString()} />
            <ActivityLine label="Œuvres chargées" value={oeuvres.length.toString()} />
            <ActivityLine label="Utilisateurs chargés" value={utilisateurs.length.toString()} />
            <ActivityLine label="Événements récents" value={changements.length.toString()} />
            <ActivityLine
              label="Erreurs pipeline"
              value={erreurs.length.toString()}
              tone="danger"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <OverviewList title="Dernières commandes">
          {commandes.slice(0, 6).map((commande) => (
            <MiniRow
              key={commande.id}
              title={commande.client_email ?? commande.user_id.slice(0, 12)}
              meta={`${commande.offre} · ${(commande.montant_cents / 100).toFixed(2)} ${commande.devise.toUpperCase()}`}
              date={commande.created_at}
              status={commande.statut}
            />
          ))}
        </OverviewList>
        <OverviewList title="Dernières œuvres">
          {oeuvres.slice(0, 6).map((oeuvre) => (
            <MiniRow
              key={oeuvre.id}
              title={oeuvre.nom_totem || oeuvre.numero_serie || oeuvre.id.slice(0, 12)}
              meta={oeuvre.client_email ?? oeuvre.user_id.slice(0, 12)}
              date={oeuvre.created_at}
              status={oeuvre.statut}
            />
          ))}
        </OverviewList>
        <OverviewList title="Derniers utilisateurs">
          {utilisateurs.slice(0, 6).map((user) => (
            <MiniRow
              key={user.id}
              title={user.email ?? user.id.slice(0, 12)}
              meta={`${user.prenom ?? "—"} · ${user.total_commandes} commande(s)`}
              date={user.created_at}
            />
          ))}
        </OverviewList>
        <OverviewList title="Événements récents">
          {changements.slice(0, 6).map((event) => (
            <MiniRow
              key={event.id}
              title={event.id.slice(0, 12)}
              meta={`${event.offre} · ${event.user_id.slice(0, 12)}`}
              date={event.updated_at}
              status={event.statut}
            />
          ))}
        </OverviewList>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Orders Section                                                    */
/* ------------------------------------------------------------------ */
function OrdersSection({
  commandes,
  filters,
  loading,
  onChange,
  onApply,
  onReset,
}: {
  commandes: CommandeRow[];
  filters: CommandeFilters;
  loading: boolean;
  onChange: (filters: CommandeFilters) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <section>
      <SectionHeader title="Commandes" subtitle="Liste des commandes avec recherche et filtrage." />

      <FilterPanel onApply={onApply} onReset={onReset} loading={loading}>
        <FilterInput
          label="Recherche"
          value={filters.search}
          placeholder="Email, prénom, session Stripe ou ID complet"
          onChange={(search) => onChange({ ...filters, search })}
        />
        <FilterSelect
          label="Statut"
          value={filters.statut}
          options={COMMAND_STATUSES}
          onChange={(statut) => onChange({ ...filters, statut })}
        />
        <FilterSelect
          label="Offre"
          value={filters.offre}
          options={OFFER_TYPES}
          onChange={(offre) => onChange({ ...filters, offre })}
        />
      </FilterPanel>

      {commandes.length === 0 ? (
        <p className="quote-italic">Aucune commande.</p>
      ) : (
        <div className="grid gap-3">
          {commandes.map((cmd) => (
            <div key={cmd.id} className="premium-row grid gap-3 p-4 md:grid-cols-6 md:items-center">
              <div>
                <p className="caption uppercase text-xs">ID</p>
                <p className="text-sm font-mono">{cmd.id.slice(0, 12)}…</p>
              </div>
              <div>
                <p className="caption uppercase text-xs">Client</p>
                <p className="text-sm break-words">
                  {cmd.client_email ?? cmd.user_id.slice(0, 12)}
                </p>
                {cmd.client_prenom && (
                  <p className="premium-soft text-xs mt-1">{cmd.client_prenom}</p>
                )}
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
              <div>
                <p className="caption uppercase text-xs">Date</p>
                <p className="text-sm">{new Date(cmd.created_at).toLocaleString("fr-FR")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Artworks Section                                                  */
/* ------------------------------------------------------------------ */
function ArtworksSection({
  oeuvres,
  filters,
  loading,
  onChange,
  onApply,
  onReset,
}: {
  oeuvres: OeuvreRow[];
  filters: OeuvreFilters;
  loading: boolean;
  onChange: (filters: OeuvreFilters) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <section>
      <SectionHeader title="Œuvres" subtitle="Suivi des œuvres générées et des fichiers livrés." />

      <FilterPanel onApply={onApply} onReset={onReset} loading={loading}>
        <FilterInput
          label="Recherche"
          value={filters.search}
          placeholder="Email, prénom, nom Totem, série ou ID complet"
          onChange={(search) => onChange({ ...filters, search })}
        />
        <FilterSelect
          label="Statut"
          value={filters.statut}
          options={OEUVRE_STATUSES}
          onChange={(statut) => onChange({ ...filters, statut })}
        />
        <FilterSelect
          label="Fichiers"
          value={filters.fichier}
          options={[
            { value: "image", label: "Image présente" },
            { value: "audio", label: "Audio présent" },
            { value: "pdf", label: "PDF présent" },
            { value: "complete", label: "Complète" },
            { value: "incomplete", label: "Incomplète" },
          ]}
          onChange={(fichier) => onChange({ ...filters, fichier })}
        />
      </FilterPanel>

      {oeuvres.length === 0 ? (
        <p className="quote-italic">Aucune œuvre.</p>
      ) : (
        <div className="grid gap-3">
          {oeuvres.map((oeuvre) => (
            <div
              key={oeuvre.id}
              className="premium-row grid gap-3 p-4 lg:grid-cols-6 lg:items-center"
            >
              <div>
                <p className="caption uppercase text-xs">Œuvre</p>
                <p className="text-sm">{oeuvre.nom_totem || "Sans nom"}</p>
                <p className="premium-soft text-xs font-mono mt-1">
                  {oeuvre.numero_serie ?? oeuvre.id.slice(0, 12)}
                </p>
              </div>
              <div>
                <p className="caption uppercase text-xs">Client</p>
                <p className="text-sm break-words">
                  {oeuvre.client_email ?? oeuvre.user_id.slice(0, 12)}
                </p>
                {oeuvre.client_prenom && (
                  <p className="premium-soft text-xs mt-1">{oeuvre.client_prenom}</p>
                )}
              </div>
              <div>
                <p className="caption uppercase text-xs">Commande</p>
                <p className="text-sm font-mono">{oeuvre.commande_id.slice(0, 12)}…</p>
                {oeuvre.commande_offre && (
                  <p className="premium-soft text-xs capitalize mt-1">{oeuvre.commande_offre}</p>
                )}
              </div>
              <div>
                <p className="caption uppercase text-xs">Fichiers</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <FileBadge label="Image" active={Boolean(oeuvre.image_url)} />
                  <FileBadge label="Audio" active={Boolean(oeuvre.audio_url)} />
                  <FileBadge label="PDF" active={Boolean(oeuvre.pdf_url)} />
                </div>
              </div>
              <div>
                <p className="caption uppercase text-xs">Statut</p>
                <StatusBadge statut={oeuvre.statut} />
              </div>
              <div>
                <p className="caption uppercase text-xs">Date</p>
                <p className="text-sm">{new Date(oeuvre.created_at).toLocaleString("fr-FR")}</p>
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
function UsersSection({
  utilisateurs,
  filters,
  loading,
  onChange,
  onApply,
  onReset,
}: {
  utilisateurs: ProfileRow[];
  filters: UserFilters;
  loading: boolean;
  onChange: (filters: UserFilters) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <section>
      <SectionHeader title="Utilisateurs" subtitle="Liste des comptes avec filtres d'activité." />

      <FilterPanel onApply={onApply} onReset={onReset} loading={loading}>
        <FilterInput
          label="Recherche"
          value={filters.search}
          placeholder="Email ou prénom"
          onChange={(search) => onChange({ ...filters, search })}
        />
        <FilterSelect
          label="Langue"
          value={filters.langue}
          options={["fr", "en"]}
          onChange={(langue) => onChange({ ...filters, langue })}
        />
        <FilterSelect
          label="Activité"
          value={filters.activite}
          options={[
            { value: "avec_commandes", label: "Avec commandes" },
            { value: "sans_commandes", label: "Sans commande" },
            { value: "actifs", label: "Commandes actives" },
          ]}
          onChange={(activite) => onChange({ ...filters, activite })}
        />
      </FilterPanel>

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

  const statutData = COMMAND_STATUSES.map((s) => ({
    statut: s.replace(/_/g, " "),
    count: changements.filter((c) => c.statut === s).length,
    fill: STATUT_BAR_COLORS[s] ?? "#d8ad4d",
  })).filter((d) => d.count > 0);

  const errorDays: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    errorDays.push(d.toISOString().slice(0, 10));
  }
  const errorsByDay = errorDays.map((day) => ({
    date: day,
    erreurs: erreurs.filter((e) => (e.created_at || "").slice(0, 10) === day).length,
  }));

  return (
    <section>
      <h2 className="h-display text-2xl mb-6" style={{ color: "var(--or-ancestral)" }}>
        Événements
      </h2>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="premium-panel p-5">
          <h3 className="mb-4 text-sm uppercase" style={{ color: "var(--or-pale)" }}>
            Répartition des changements de statut
          </h3>
          {statutData.length === 0 ? (
            <p className="quote-italic">Aucun changement récent.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statutData} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(216,173,77,0.08)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} stroke="rgba(226,225,238,0.42)" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="statut"
                  width={120}
                  stroke="rgba(226,225,238,0.42)"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(216,173,77,0.06)" }}
                  contentStyle={{
                    background: "#1e1f28",
                    border: "1px solid rgba(216,173,77,0.3)",
                    borderRadius: 6,
                    color: "#e2e1ee",
                  }}
                />
                <Bar dataKey="count" name="Changements" radius={[0, 3, 3, 0]}>
                  {statutData.map((entry) => (
                    <Cell key={entry.statut} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="premium-panel p-5">
          <h3 className="mb-4 text-sm uppercase" style={{ color: "rgba(224,122,107,0.85)" }}>
            Erreurs pipeline — 7 derniers jours
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={errorsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,122,107,0.08)" />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                stroke="rgba(226,225,238,0.42)"
                tick={{ fontSize: 11 }}
              />
              <YAxis allowDecimals={false} stroke="rgba(226,225,238,0.42)" tick={{ fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: "rgba(224,122,107,0.06)" }}
                contentStyle={{
                  background: "#1e1f28",
                  border: "1px solid rgba(224,122,107,0.3)",
                  borderRadius: 6,
                  color: "#e2e1ee",
                }}
                labelFormatter={(v) => new Date(v).toLocaleDateString("fr-FR")}
              />
              <Bar dataKey="erreurs" name="Erreurs" fill="#E07A6B" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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
/*  Shared Admin Components                                           */
/* ------------------------------------------------------------------ */
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="h-display text-2xl" style={{ color: "var(--or-ancestral)" }}>
        {title}
      </h2>
      <p className="quote-italic text-sm mt-1">{subtitle}</p>
    </div>
  );
}

function FilterPanel({
  children,
  loading,
  onApply,
  onReset,
}: {
  children: ReactNode;
  loading: boolean;
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <form
      className="premium-panel mb-6 grid gap-3 p-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      {children}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-primary !px-4 !py-3 !text-[11px]">
          {loading ? "..." : "Filtrer"}
        </button>
        <button type="button" onClick={onReset} className="btn-secondary !px-4 !py-3 !text-[11px]">
          Réinitialiser
        </button>
      </div>
    </form>
  );
}

function FilterInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="caption uppercase text-xs" style={{ color: "rgba(237,217,154,0.78)" }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="form-input !py-3 !text-sm"
      />
    </label>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<string | { value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="caption uppercase text-xs" style={{ color: "rgba(237,217,154,0.78)" }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input !py-3 !text-sm"
      >
        <option value="">Tous</option>
        {options.map((option) => {
          const item = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label.replace(/_/g, " ")}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function ActivityLine({ label, value, tone }: { label: string; value: string; tone?: "danger" }) {
  return (
    <div className="premium-row flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm" style={{ color: "rgba(254,252,240,0.72)" }}>
        {label}
      </span>
      <span
        className="font-mono text-sm"
        style={{ color: tone === "danger" ? "#E07A6B" : "var(--or-ancestral)" }}
      >
        {value}
      </span>
    </div>
  );
}

function OverviewList({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="premium-panel p-5">
      <h3 className="mb-4 text-sm uppercase" style={{ color: "var(--or-pale)" }}>
        {title}
      </h3>
      <div className="grid gap-2">
        {Children.count(children) > 0 ? children : <p className="quote-italic">Aucune donnée.</p>}
      </div>
    </div>
  );
}

function MiniRow({
  title,
  meta,
  date,
  status,
}: {
  title: string;
  meta: string;
  date: string;
  status?: string;
}) {
  return (
    <div className="premium-row flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm">{title}</p>
        <p className="premium-soft truncate text-xs">{meta}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {status && <StatusBadge statut={status} />}
        <span className="premium-soft text-xs">{new Date(date).toLocaleDateString("fr-FR")}</span>
      </div>
    </div>
  );
}

function FileBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className="rounded px-2 py-0.5 text-[10px] uppercase"
      style={{
        border: `1px solid ${active ? "rgba(216,173,77,0.35)" : "rgba(226,225,238,0.14)"}`,
        color: active ? "var(--or-ancestral)" : "rgba(226,225,238,0.42)",
        background: active ? "rgba(216,173,77,0.08)" : "rgba(26,27,36,0.7)",
      }}
    >
      {label}
    </span>
  );
}

function shortDate(value: string) {
  const [year, month, day] = value.split("-");
  void year;
  return `${day}/${month}`;
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                      */
/* ------------------------------------------------------------------ */
function StatusBadge({ statut, className }: { statut: string; className?: string }) {
  const colors: Record<string, { border: string; color: string; bg: string }> = {
    en_cours: {
      border: "rgba(246,200,101,0.35)",
      color: "var(--or-pale)",
      bg: "rgba(26,27,36,0.86)",
    },
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
