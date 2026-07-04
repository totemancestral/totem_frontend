"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  Download,
  FileText,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  Menu,
  PackageCheck,
  Plus,
  Sparkles,
  UserRound,
  Volume2,
  X,
} from "lucide-react";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { hasAdminRole } from "@/lib/admin-client";
import { extractParchmentSections, type StorySection } from "@/lib/totem-v3";
import { TotemRevealClient } from "@/components/totem/TotemRevealClient";

type Locale = "fr" | "en";
type DashboardSection = "overview" | "orders" | "artworks" | "profile";

const ADMIN_PATH = "/fgh55_fh";

type Commande = {
  id: string;
  user_id: string;
  offre: "essentiel" | "signature" | "heritage";
  statut: "en_attente_paiement" | "paye" | "en_generation" | "livree" | "erreur" | "remboursee";
  montant_cents: number;
  devise: string;
  langue: string;
  created_at: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
};

type Oeuvre = {
  id: string;
  user_id: string;
  commande_id: string;
  nom_totem: string | null;
  numero_serie: string | null;
  image_url: string | null;
  audio_url: string | null;
  pdf_url: string | null;
  statut: string;
  created_at: string;
  recit: string | null;
};

type CompositionState = {
  status: string;
  progress: number;
  events: string[];
  hasComposition: boolean;
};

const copy = {
  fr: {
    eyebrow: "Espace personnel",
    title: "Bienvenue, {name}",
    subtitle: "Retrouve ici tes commandes, tes oeuvres et les fichiers deja livres.",
    loading: "Chargement de ton espace...",
    error: "Impossible de charger ton espace pour le moment.",
    retry: "Reessayer",
    orders: "Commandes",
    delivered: "Oeuvres livrees",
    active: "En cours",
    compose: "Composer une oeuvre",
    logout: "Se deconnecter",
    profile: "Profil",
    overviewNav: "Accueil",
    ordersNav: "Commandes",
    artworksNav: "Oeuvres",
    profileNav: "Profil",
    firstName: "Prenom",
    lastName: "Nom",
    password: "Mot de passe",
    changePassword: "Changer le mot de passe",
    email: "Email",
    language: "Langue",
    latestOrders: "Commandes recentes",
    artworks: "Tes oeuvres",
    noOrders: "Aucune commande rattachee a ce compte.",
    noArtworks: "Aucune oeuvre livree pour le moment.",
    emptyCta: "Commencer le parcours",
    amount: "Montant",
    date: "Date",
    stripe: "Stripe",
    files: "Fichiers",
    image: "Image",
    audio: "Audio",
    pdf: "PDF",
    text: "Recit",
    hideText: "Masquer le recit",
    waitingFiles: "Les fichiers apparaitront quand la livraison sera terminee.",
    unnamed: "Oeuvre sans nom",
    defaultName: "Voyageur",
    currentComposition: "Composition en cours",
    compositionProgress: "Progression",
    compositionStatus: "Statut",
    events: "Evenements",
    noComposition: "Aucune composition en cours.",
    noEvents: "Aucun evenement pour le moment.",
    draftStatus: "Questionnaire en cours",
    offerStatus: "Offre a choisir",
    paidStatus: "Commande enregistree",
    generatingStatus: "Generation en cours",
    deliveredStatus: "Livraison disponible",
    errorStatus: "Intervention requise",
  },
  en: {
    eyebrow: "Personal space",
    title: "Welcome, {name}",
    subtitle: "Find your orders, artworks and delivered files here.",
    loading: "Loading your space...",
    error: "Unable to load your space right now.",
    retry: "Retry",
    orders: "Orders",
    delivered: "Delivered artworks",
    active: "In progress",
    compose: "Compose an artwork",
    logout: "Sign out",
    profile: "Profile",
    overviewNav: "Home",
    ordersNav: "Orders",
    artworksNav: "Artworks",
    profileNav: "Profile",
    firstName: "First name",
    lastName: "Last name",
    password: "Password",
    changePassword: "Change password",
    email: "Email",
    language: "Language",
    latestOrders: "Recent orders",
    artworks: "Your artworks",
    noOrders: "No order is attached to this account.",
    noArtworks: "No delivered artwork yet.",
    emptyCta: "Start the journey",
    amount: "Amount",
    date: "Date",
    stripe: "Stripe",
    files: "Files",
    image: "Image",
    audio: "Audio",
    pdf: "PDF",
    text: "Story",
    hideText: "Hide story",
    waitingFiles: "Files will appear when delivery is complete.",
    unnamed: "Untitled artwork",
    defaultName: "Traveler",
    currentComposition: "Current composition",
    compositionProgress: "Progress",
    compositionStatus: "Status",
    events: "Events",
    noComposition: "No composition in progress.",
    noEvents: "No event yet.",
    draftStatus: "Questionnaire in progress",
    offerStatus: "Offer to choose",
    paidStatus: "Order saved",
    generatingStatus: "Generation in progress",
    deliveredStatus: "Delivery available",
    errorStatus: "Action required",
  },
} as const;

const statusLabels: Record<Locale, Record<string, string>> = {
  fr: {
    en_attente_paiement: "Paiement attendu",
    paye: "Payee",
    en_generation: "En generation",
    livree: "Livree",
    erreur: "Erreur",
    remboursee: "Remboursee",
  },
  en: {
    en_attente_paiement: "Payment pending",
    paye: "Paid",
    en_generation: "Generating",
    livree: "Delivered",
    erreur: "Error",
    remboursee: "Refunded",
  },
};

const offerLabels: Record<Locale, Record<string, string>> = {
  fr: { essentiel: "Totem Origine", signature: "Totem Ancestral", heritage: "Totem Famille" },
  en: { essentiel: "Totem Origin", signature: "Totem Ancestral", heritage: "Totem Family" },
};

function newJourneyHref(locale: Locale) {
  return `/${locale}/via_sapientiae?restart=1`;
}

export function DashboardClient({
  locale,
  section = "overview",
}: {
  locale: Locale;
  section?: DashboardSection;
}) {
  const router = useRouter();
  const { session, user, loading: authLoading } = useSupabaseSession();
  const t = copy[locale];
  const authPath = useMemo(
    () => `/${locale}/janua_vitae?redirect=${encodeURIComponent(`/${locale}/domus_animi`)}`,
    [locale],
  );

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [oeuvres, setOeuvres] = useState<Oeuvre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOeuvre, setSelectedOeuvre] = useState<Oeuvre | null>(null);

  const token = session?.access_token;

  useEffect(() => {
    const currentSession = session;
    const currentToken = token;

    if (authLoading) return;
    if (!currentSession || !currentToken) {
      router.replace(authPath);
      return;
    }
    const userId = currentSession.user.id;
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const isAdmin = await hasAdminRole(userId);
        if (!alive) return;

        if (isAdmin) {
          router.replace(ADMIN_PATH);
          return;
        }

        const [commandesRes, oeuvresRes] = await Promise.all([
          fetch("/api/ordo_tabulae", {
            headers: { authorization: `Bearer ${currentToken}` },
          }),
          fetch("/api/opera_artificis", {
            headers: { authorization: `Bearer ${currentToken}` },
          }),
        ]);

        if (!alive) return;

        if (!commandesRes.ok) {
          throw new Error("Erreur chargement commandes");
        }
        if (!oeuvresRes.ok) {
          throw new Error("Erreur chargement oeuvres");
        }

        const commandesData: Commande[] = await commandesRes.json();
        const oeuvresData: Oeuvre[] = await oeuvresRes.json();

        setCommandes(commandesData);
        setOeuvres(oeuvresData);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : t.error);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [authLoading, session, token, authPath, locale, router, t.error]);

  const metadata = user?.user_metadata ?? {};
  const firstName = metadataValue(metadata, ["prenom", "first_name", "given_name"]);
  const lastName = metadataValue(metadata, ["nom", "last_name", "family_name"]);
  const name = firstName || user?.email?.split("@")[0] || t.defaultName;
  const deliveredCount = oeuvres.filter(
    (oeuvre) => oeuvre.statut === "livree" || oeuvre.image_url || oeuvre.pdf_url,
  ).length;
  const activeCount = commandes.filter((commande) =>
    ["en_attente_paiement", "paye", "en_generation"].includes(commande.statut),
  ).length;
  const composition = buildCompositionState({ commandes, oeuvres, copy: t });
  const [activeSection, setActiveSection] = useState<DashboardSection>(section);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setActiveSection(section);
  }, [section]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [sidebarOpen]);

  const sidebarItems: Array<{
    key: DashboardSection;
    href: string;
    label: string;
    icon: ReactNode;
  }> = [
    {
      key: "overview",
      href: `/${locale}/domus_animi`,
      label: t.overviewNav,
      icon: <LayoutDashboard size={18} />,
    },
    {
      key: "orders",
      href: `/${locale}/domus_animi/commandes`,
      label: t.ordersNav,
      icon: <PackageCheck size={18} />,
    },
    {
      key: "artworks",
      href: `/${locale}/domus_animi/oeuvres`,
      label: t.artworksNav,
      icon: <Sparkles size={18} />,
    },
    {
      key: "profile",
      href: `/${locale}/domus_animi/profil`,
      label: t.profileNav,
      icon: <UserRound size={18} />,
    },
  ];

  const selectSection = (next: DashboardSection, href: string) => {
    if (next !== activeSection) setActiveSection(next);
    setSidebarOpen(false);

    if (typeof window !== "undefined" && window.location.pathname !== href) {
      window.history.replaceState(null, "", href);
    }
  };

  if (authLoading || loading) {
    return (
      <section
        className="premium-page flex min-h-[100svh] items-center justify-center px-5 pt-28"
        style={{ background: "var(--nuit-profonde)" }}
      >
        <div className="flex items-center gap-3 text-sm" style={{ color: "var(--or-pale)" }}>
          <Clock3 size={18} />
          {t.loading}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="premium-page flex min-h-[100svh] items-center justify-center px-5 pt-28"
        style={{ background: "var(--nuit-profonde)" }}
      >
        <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
          <AlertTriangle size={34} color="var(--or-ancestral)" />
          <p className="quote-italic text-lg">{error}</p>
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            {t.retry}
          </button>
        </div>
      </section>
    );
  }

  const sidebar = (
    <div className="premium-sidebar flex h-full flex-col gap-6 p-6">
      <div className="text-center">
        <img
          src="/assets/totem-logo.png"
          alt=""
          className="mx-auto mb-3 h-12 w-12 object-contain"
        />
        <p className="caption uppercase text-xs" style={{ color: "var(--or-ancestral)" }}>
          ESPACE
        </p>
        <h2 className="logo-wordmark mt-1 text-base">Totem Ancestral</h2>
      </div>

      <nav className="flex flex-col gap-1">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => selectSection(item.key, item.href)}
            className="flex w-full items-center gap-3 rounded-sm px-4 py-3 text-left text-sm uppercase transition-colors hover:bg-ombre"
            style={{
              color: item.key === activeSection ? "var(--or-ancestral)" : "rgba(226,225,238,0.72)",
              background: item.key === activeSection ? "rgba(216,173,77,0.1)" : undefined,
            }}
          >
            <span style={{ color: "var(--or-ancestral)" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <Link href={newJourneyHref(locale)} className="btn-primary w-full py-3 text-xs">
          <Plus size={14} />
          {t.compose}
        </Link>
      </div>
    </div>
  );

  return (
    <div
      className="premium-page flex min-h-[100svh]"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="premium-watermark" aria-hidden="true">
        <img src="/assets/totem-logo.png" alt="" />
      </div>
      <aside
        className="fixed left-0 top-0 z-40 hidden h-full w-64 pt-20 lg:block"
        style={{ borderRight: "1px solid rgba(216,173,77,0.18)" }}
      >
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-[300] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Fermer le menu"
            onClick={() => setSidebarOpen(false)}
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
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-5 pb-12 pt-24 md:px-8 md:pb-16 md:pt-28 lg:ml-64">
        <div className="mx-auto max-w-5xl flex flex-col gap-10">
          <div className="flex items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="btn-secondary px-4 py-2 text-xs"
            >
              <Menu size={16} />
              Menu
            </button>
            <p className="caption uppercase text-xs" style={{ color: "var(--or-ancestral)" }}>
              ESPACE
            </p>
          </div>

          {activeSection === "overview" && (
            <section id="dashboard-overview" className="premium-panel-strong p-6 md:p-8">
              <motion.header
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="mb-6 grid gap-4"
              >
                <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
                  {t.eyebrow}
                </p>
                <h1
                  className="h-display text-4xl leading-tight md:text-5xl"
                  style={{ color: "var(--ivoire)" }}
                >
                  {t.title.replace("{name}", name)}
                </h1>
                <p className="max-w-2xl premium-muted">{t.subtitle}</p>
              </motion.header>

              <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <StatCard
                  icon={<PackageCheck size={20} />}
                  label={t.orders}
                  value={commandes.length.toString()}
                />
                <StatCard
                  icon={<Sparkles size={20} />}
                  label={t.delivered}
                  value={deliveredCount.toString()}
                />
                <StatCard
                  icon={<Clock3 size={20} />}
                  label={t.active}
                  value={activeCount.toString()}
                />
              </div>

              <CompositionPanel composition={composition} locale={locale} />
            </section>
          )}

          {activeSection === "orders" && (
            <section id="dashboard-orders" className="flex flex-col gap-5">
              <h1 className="h-display text-4xl" style={{ color: "var(--or-ancestral)" }}>
                {t.latestOrders}
              </h1>
              {commandes.length === 0 ? (
                <EmptyState text={t.noOrders} cta={t.emptyCta} href={newJourneyHref(locale)} />
              ) : (
                <div className="grid gap-4">
                  {commandes.map((commande) => (
                    <OrderCard key={commande.id} commande={commande} locale={locale} />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "artworks" && (
            <section id="dashboard-artworks" className="flex flex-col gap-5">
              <h1 className="h-display text-4xl" style={{ color: "var(--or-ancestral)" }}>
                {t.artworks}
              </h1>
              {oeuvres.length === 0 ? (
                <EmptyState text={t.noArtworks} cta={t.emptyCta} href={newJourneyHref(locale)} />
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {oeuvres.map((oeuvre) => (
                    <ArtworkCard
                      key={oeuvre.id}
                      oeuvre={oeuvre}
                      locale={locale}
                      onReveal={setSelectedOeuvre}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "profile" && (
            <section id="dashboard-profile">
              <div className="premium-panel p-6 md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <UserRound size={20} color="var(--or-ancestral)" />
                  <h1 className="h-display text-3xl" style={{ color: "var(--or-ancestral)" }}>
                    {t.profile}
                  </h1>
                </div>
                <dl className="grid gap-5 md:grid-cols-2">
                  <ProfileLine label={t.firstName} value={firstName || "-"} />
                  <ProfileLine label={t.lastName} value={lastName || "-"} />
                  <ProfileLine label={t.email} value={user?.email ?? "-"} />
                  <ProfileLine label={t.language} value={locale.toUpperCase()} />
                </dl>
                <div
                  className="mt-8 border-t pt-6"
                  style={{ borderColor: "rgba(216,173,77,0.18)" }}
                >
                  <p className="caption uppercase" style={{ color: "rgba(237,217,154,0.7)" }}>
                    {t.password}
                  </p>
                  <Link href={`/${locale}/renovare_clavis`} className="btn-secondary mt-3 w-fit">
                    <KeyRound size={15} />
                    {t.changePassword}
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {selectedOeuvre && (
        <TotemRevealClient
          userName={firstName || ""}
          totemName={selectedOeuvre.nom_totem || ""}
          totemImage={selectedOeuvre.image_url || ""}
          subtitle={
            locale === "fr"
              ? "Décret royal de révélation symbolique"
              : "Royal decree of symbolic revelation"
          }
          sections={extractParchmentSections(selectedOeuvre.recit || "")}
          numeroSerie={selectedOeuvre.numero_serie || undefined}
          audioUrl={selectedOeuvre.audio_url || undefined}
          pdfUrl={selectedOeuvre.pdf_url || undefined}
          onBack={() => setSelectedOeuvre(null)}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="premium-panel p-5">
      <div className="mb-4" style={{ color: "var(--or-ancestral)" }}>
        {icon}
      </div>
      <p className="caption uppercase" style={{ color: "rgba(237,217,154,0.72)" }}>
        {label}
      </p>
      <p className="h-display mt-2 text-4xl" style={{ color: "var(--ivoire)" }}>
        {value}
      </p>
    </article>
  );
}

function CompositionPanel({
  composition,
  locale,
}: {
  composition: CompositionState;
  locale: Locale;
}) {
  const t = copy[locale];

  return (
    <section className="premium-panel grid gap-5 p-5 md:grid-cols-[0.82fr_1.18fr] md:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Activity size={20} color="var(--or-ancestral)" />
          <h2 className="h-display text-3xl" style={{ color: "var(--or-ancestral)" }}>
            {t.currentComposition}
          </h2>
        </div>

        <div>
          <p className="caption uppercase" style={{ color: "rgba(237,217,154,0.72)" }}>
            {t.compositionStatus}
          </p>
          <p className="mt-2 text-lg" style={{ color: "var(--ivoire)" }}>
            {composition.hasComposition ? composition.status : t.noComposition}
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="caption uppercase" style={{ color: "rgba(237,217,154,0.72)" }}>
              {t.compositionProgress}
            </p>
            <span className="caption" style={{ color: "var(--or-pale)" }}>
              {composition.progress}%
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-sm"
            style={{ background: "rgba(13,13,26,0.86)" }}
          >
            <div
              className="h-full rounded-sm transition-all duration-500"
              style={{ width: `${composition.progress}%`, background: "var(--or-ancestral)" }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="h-display text-2xl" style={{ color: "var(--ivoire)" }}>
          {t.events}
        </h3>
        {composition.events.length === 0 ? (
          <p className="caption premium-soft">{t.noEvents}</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {composition.events.map((event) => (
              <li key={event} className="flex items-start gap-3">
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: "var(--or-ancestral)" }}
                />
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(226,225,238,0.78)" }}
                >
                  {event}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function buildCompositionState({
  commandes,
  oeuvres,
  copy: t,
}: {
  commandes: Commande[];
  oeuvres: Oeuvre[];
  copy: { [key: string]: string };
}): CompositionState {
  const latestOrder = commandes[0];
  const hasDeliveredArtwork = oeuvres.some(
    (oeuvre) => oeuvre.statut === "livree" || oeuvre.image_url || oeuvre.pdf_url,
  );
  const hasComposition = commandes.length > 0 || hasDeliveredArtwork;

  if (!hasComposition) {
    return { status: t.noComposition, progress: 0, events: [], hasComposition: false };
  }

  const events: string[] = [];
  if (latestOrder) events.push(`Commande #${latestOrder.id.slice(0, 8)} en generation`);
  if (hasDeliveredArtwork) events.push("Livrables disponibles dans le dashboard");

  if (hasDeliveredArtwork) {
    return { status: t.deliveredStatus, progress: 100, events, hasComposition: true };
  }
  if (latestOrder?.statut === "erreur") {
    return { status: t.errorStatus, progress: 100, events, hasComposition: true };
  }
  if (latestOrder?.statut === "en_generation") {
    return { status: t.generatingStatus, progress: 88, events, hasComposition: true };
  }
  if (latestOrder?.statut === "paye") {
    return { status: t.paidStatus, progress: 72, events, hasComposition: true };
  }

  return {
    status: t.draftStatus ?? "",
    progress: 50,
    events,
    hasComposition: true,
  };
}

function metadataValue(metadata: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="caption uppercase" style={{ color: "rgba(237,217,154,0.7)" }}>
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm" style={{ color: "var(--ivoire)" }}>
        {value}
      </dd>
    </div>
  );
}

function OrderCard({ commande, locale }: { commande: Commande; locale: Locale }) {
  const t = copy[locale];
  const status = statusLabels[locale][commande.statut] ?? commande.statut;
  return (
    <article className="premium-panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="h-display text-2xl" style={{ color: "var(--ivoire)" }}>
            {offerLabels[locale][commande.offre] ?? commande.offre}
          </h3>
          <p className="caption mt-1">#{commande.id.slice(0, 8)}</p>
        </div>
        <span
          className="w-fit rounded-sm border px-3 py-1 text-xs uppercase"
          style={statusStyle(commande.statut)}
        >
          {status}
        </span>
      </div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <ProfileLine
          label={t.amount}
          value={formatMoney(commande.montant_cents, commande.devise, locale)}
        />
        <ProfileLine label={t.date} value={formatDate(commande.created_at, locale)} />
        <ProfileLine
          label={t.stripe}
          value={commande.stripe_payment_intent_id || commande.stripe_session_id || "-"}
        />
      </dl>
    </article>
  );
}

function ArtworkCard({
  oeuvre,
  locale,
  onReveal,
}: {
  oeuvre: Oeuvre;
  locale: Locale;
  onReveal?: (oeuvre: Oeuvre) => void;
}) {
  const t = copy[locale];
  const [showRecit, setShowRecit] = useState(false);
  const isReady = oeuvre.statut === "livree" || oeuvre.image_url || oeuvre.pdf_url;
  const links: Array<{ label: string; href: string; icon: ReactNode }> = [
    { label: t.image, href: oeuvre.image_url, icon: <ImageIcon size={15} /> },
    { label: t.audio, href: oeuvre.audio_url, icon: <Volume2 size={15} /> },
    { label: t.pdf, href: oeuvre.pdf_url, icon: <FileText size={15} /> },
  ].flatMap((link) => (link.href ? [{ ...link, href: link.href }] : []));

  return (
    <article className="premium-panel overflow-hidden">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => onReveal?.(oeuvre)}
        disabled={!isReady}
      >
        {oeuvre.image_url ? (
          <img
            src={oeuvre.image_url}
            alt={oeuvre.nom_totem || t.unnamed}
            className="aspect-square w-full object-cover"
            style={{ filter: "saturate(0.82) contrast(1.04)" }}
          />
        ) : (
          <div
            className="flex aspect-square items-center justify-center"
            style={{ background: "var(--ombre-doree)" }}
          >
            <Sparkles size={34} color="var(--or-ancestral)" />
          </div>
        )}
      </button>
      <div className="flex flex-col gap-4 p-5">
        <div>
          <button
            type="button"
            onClick={() => onReveal?.(oeuvre)}
            disabled={!isReady}
            className="w-full text-left"
          >
            <h3 className="h-display text-2xl" style={{ color: "var(--or-ancestral)" }}>
              {oeuvre.nom_totem || t.unnamed}
            </h3>
          </button>
          <p className="caption mt-1">
            {oeuvre.numero_serie
              ? `No ${oeuvre.numero_serie}`
              : formatDate(oeuvre.created_at, locale)}
          </p>
        </div>

        {oeuvre.recit && (
          <div>
            <button
              type="button"
              onClick={() => setShowRecit(!showRecit)}
              className="btn-secondary !px-4 !py-2 !text-[11px]"
            >
              <FileText size={14} />
              {showRecit ? t.hideText : t.text}
            </button>
            {showRecit && (
              <div
                className="mt-4 max-h-80 overflow-y-auto rounded border p-4 text-sm leading-relaxed whitespace-pre-line"
                style={{
                  background: "rgba(13,13,26,0.6)",
                  borderColor: "rgba(216,173,77,0.18)",
                  color: "var(--or-pale)",
                }}
              >
                {oeuvre.recit}
              </div>
            )}
          </div>
        )}

        {links.length > 0 ? (
          <div className="flex flex-wrap gap-2" aria-label={t.files}>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary !px-4 !py-2 !text-[11px]"
              >
                {link.icon}
                <Download size={14} />
                {link.label}
              </a>
            ))}
          </div>
        ) : (
          <p className="caption premium-soft">{t.waitingFiles}</p>
        )}
      </div>
    </article>
  );
}

function EmptyState({ text, cta, href }: { text: string; cta: string; href: string }) {
  return (
    <div className="premium-panel px-6 py-10 text-center">
      <p className="quote-italic mb-6 text-lg">{text}</p>
      <Link href={href} className="btn-primary">
        {cta}
      </Link>
    </div>
  );
}

function statusStyle(status: string): CSSProperties {
  if (status === "livree") {
    return {
      borderColor: "rgba(216,173,77,0.45)",
      color: "var(--or-ancestral)",
      background: "rgba(51,48,38,0.58)",
    };
  }
  if (status === "erreur" || status === "remboursee") {
    return {
      borderColor: "rgba(224,122,107,0.45)",
      color: "#E07A6B",
      background: "rgba(224,122,107,0.08)",
    };
  }
  return {
    borderColor: "rgba(246,200,101,0.28)",
    color: "var(--or-pale)",
    background: "rgba(26,27,36,0.86)",
  };
}

function formatMoney(amountCents: number, devise: string, locale: Locale) {
  try {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      style: "currency",
      currency: devise.toUpperCase(),
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${devise.toUpperCase()}`;
  }
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}
