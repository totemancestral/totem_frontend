"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  Mars,
  PackageCheck,
  PlayCircle,
  Plus,
  Share2,
  Sparkles,
  UserRound,
  Venus,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { hasAdminRole } from "@/lib/admin-client";
import { authPath } from "@/lib/routes";
import { fetchParcoursDrafts, type ParcoursDraft } from "@/lib/parcours-draft";
import { extractParchmentSections } from "@/lib/totem-v3";
import { TotemRevealClient } from "@/components/totem/TotemRevealClient";
import { DashboardSkeleton } from "@/components/account/DashboardSkeleton";

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
    subtitle: "Retrouve ici tes commandes, tes œuvres et les fichiers déjà livrés.",
    loading: "Chargement de ton espace…",
    error: "Impossible de charger ton espace pour le moment.",
    retry: "Réessayer",
    orders: "Commandes",
    delivered: "Œuvres livrées",
    active: "En cours",
    compose: "Composer une œuvre",
    logout: "Se déconnecter",
    profile: "Profil",
    overviewNav: "Accueil",
    ordersNav: "Commandes",
    artworksNav: "Œuvres",
    profileNav: "Profil",
    firstName: "Prénom",
    lastName: "Nom",
    password: "Mot de passe",
    changePassword: "Changer le mot de passe",
    email: "Email",
    language: "Langue",
    latestOrders: "Commandes récentes",
    artworks: "Tes œuvres",
    noOrders: "Aucune commande rattachée à ce compte.",
    noArtworks: "Aucune œuvre livrée pour le moment.",
    emptyCta: "Commencer le parcours",
    amount: "Montant",
    date: "Date",
    stripe: "Transaction",
    files: "Fichiers",
    image: "Image",
    audio: "Audio",
    pdf: "PDF",
    text: "Récit",
    hideText: "Masquer le récit",
    waitingFiles: "Les fichiers apparaîtront quand la livraison sera terminée.",
    unnamed: "Œuvre sans nom",
    defaultName: "Voyageur",
    currentComposition: "Composition en cours",
    compositionProgress: "Progression",
    compositionStatus: "Statut",
    events: "Événements",
    noComposition: "Aucune composition en cours.",
    noEvents: "Aucun événement pour le moment.",
    draftStatus: "Questionnaire en cours",
    offerStatus: "Offre à choisir",
    paidStatus: "Commande enregistrée",
    generatingStatus: "Génération en cours",
    deliveredStatus: "Livraison disponible",
    errorStatus: "Intervention requise",
    sectionOpened: "Section ouverte",
    copied: "Lien copié",
    copyError: "Impossible de copier automatiquement",
    refreshFailed: "Échec de rafraîchissement du tableau de bord",
    resumeTitle: "Parcours en cours",
    resumeAdult: "Totem Ancestral",
    resumeJunior: "Totem Junior",
    resumeProgress: "Question {current} sur {total}",
    resumeHint: "Ta progression est sauvegardée. Reprends où tu t'es arrêté, sur n'importe quel appareil.",
    resumeCta: "Continuer",
    gender: "Sexe",
    genderHint:
      "Le griot doit savoir à qui il donne voix, pour que l'ancêtre se lève à votre image.",
    genderMale: "Un homme",
    genderFemale: "Une femme",
    genderUnset: "Non renseigné",
    genderSaved: "Sexe enregistré",
    genderFailed: "Impossible d'enregistrer le sexe",
    unfinishedTitle: "Commande réglée, parcours à terminer",
    unfinishedHint:
      "Ton paiement est enregistré, mais les dernières questions n'ont jamais été reçues. Reprends le parcours : rien ne te sera facturé une seconde fois.",
    unfinishedCta: "Terminer mon parcours",
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
    stripe: "Transaction",
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
    sectionOpened: "Section opened",
    copied: "Link copied",
    copyError: "Unable to copy automatically",
    refreshFailed: "Dashboard refresh failed",
    resumeTitle: "Journey in progress",
    resumeAdult: "Totem Ancestral",
    resumeJunior: "Totem Junior",
    resumeProgress: "Question {current} of {total}",
    resumeHint: "Your progress is saved. Pick up where you left off, on any device.",
    resumeCta: "Continue",
    gender: "Gender",
    genderHint: "The griot must know whom he gives voice to, so the ancestor rises in your image.",
    genderMale: "A man",
    genderFemale: "A woman",
    genderUnset: "Not set",
    genderSaved: "Gender saved",
    genderFailed: "Unable to save gender",
    unfinishedTitle: "Order paid, journey to finish",
    unfinishedHint:
      "Your payment went through, but the last answers never reached us. Pick the journey back up: you will not be charged again.",
    unfinishedCta: "Finish my journey",
  },
} as const;

const statusLabels: Record<Locale, Record<string, string>> = {
  fr: {
    en_attente_paiement: "Paiement attendu",
    paye: "Payée",
    en_generation: "En génération",
    livree: "Livrée",
    erreur: "Erreur",
    remboursee: "Remboursée",
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
  fr: { essentiel: "Origine", signature: "Révélation", heritage: "Famille", junior: "Totem Junior" },
  en: { essentiel: "Origin", signature: "Revelation", heritage: "Family", junior: "Totem Junior" },
};

function newJourneyHref(locale: Locale, isJunior: boolean) {
  return isJunior
    ? `/${locale}/iuvenis_signum`
    : `/${locale}/via_sapientiae?restart=1`;
}

/**
 * Lien de reprise : sans `restart`, la page de parcours restaure d'elle-meme
 * le brouillon serveur et rouvre la question laissee en suspens.
 */
function resumeJourneyHref(locale: Locale, piste: ParcoursDraft["piste"]) {
  return piste === "junior" ? `/${locale}/iuvenis_signum` : `/${locale}/via_sapientiae`;
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
  const signinRedirect = useMemo(
    () => authPath(locale, "signin", `/${locale}/domus_animi`),
    [locale],
  );

  type JuniorTotem = {
    id: string;
    totemName: string;
    quality: string;
    phrase: string;
    orderNumber: number;
    shareCount: number;
    createdAt: string;
    scores: Record<string, number>;
    dominant: string;
    secondary: string;
  };

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [oeuvres, setOeuvres] = useState<Oeuvre[]>([]);
  const [juniorTotems, setJuniorTotems] = useState<JuniorTotem[]>([]);
  const [drafts, setDrafts] = useState<ParcoursDraft[]>([]);
  // Sexe declare : reglable ici pour les comptes crees avant qu'il ne soit
  // demande a l'inscription.
  const [sexe, setSexe] = useState<"homme" | "femme" | null>(null);
  const [savingSexe, setSavingSexe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOeuvre, setSelectedOeuvre] = useState<Oeuvre | null>(null);

  const token = session?.access_token;

  useEffect(() => {
    const currentSession = session;
    const currentToken = token;

    if (authLoading) return;
    if (!currentSession || !currentToken) {
      router.replace(signinRedirect);
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

        const [commandesRes, oeuvresRes, juniorRes, draftsData, profilRes] = await Promise.all([
          fetch("/api/ordo_tabulae", {
            headers: { authorization: `Bearer ${currentToken}` },
          }),
          fetch("/api/opera_artificis", {
            headers: { authorization: `Bearer ${currentToken}` },
          }),
          fetch("/api/iuvenis_signum/totems", {
            headers: { authorization: `Bearer ${currentToken}` },
          }),
          fetchParcoursDrafts(String(currentToken)),
          fetch("/api/personae_nota", {
            headers: { authorization: `Bearer ${currentToken}` },
          }),
        ]);

        if (!alive) return;

        if (!commandesRes.ok) {
          throw new Error("Erreur chargement commandes");
        }
        if (!oeuvresRes.ok) {
          throw new Error("Erreur chargement œuvres");
        }

        const commandesData: Commande[] = await commandesRes.json();
        const oeuvresData: Oeuvre[] = await oeuvresRes.json();
        const juniorData: JuniorTotem[] = juniorRes.ok ? await juniorRes.json() : [];

        setCommandes(commandesData);
        setOeuvres(oeuvresData);
        setJuniorTotems(juniorData);
        setDrafts(
          [draftsData.adulte, draftsData.junior].filter(
            (draft): draft is ParcoursDraft => Boolean(draft),
          ),
        );

        if (profilRes.ok) {
          const profil = (await profilRes.json()) as { sexe?: string | null };
          if (profil.sexe === "homme" || profil.sexe === "femme") setSexe(profil.sexe);
        }
      } catch (err) {
        if (alive) {
          const message = err instanceof Error ? err.message : t.error;
          setError(message);
          toast.error(t.refreshFailed);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [authLoading, session, token, signinRedirect, locale, router, t.error]);

  const metadata = user?.user_metadata ?? {};
  const firstName = metadataValue(metadata, ["prenom", "first_name", "given_name"]);
  const lastName = metadataValue(metadata, ["nom", "last_name", "family_name"]);
  const name = firstName || user?.email?.split("@")[0] || t.defaultName;
  const isJunior = user?.user_metadata?.role === "junior";
  const deliveredCount = oeuvres.filter(
    (oeuvre) => oeuvre.statut === "livree" || oeuvre.image_url || oeuvre.pdf_url,
  ).length;
  const activeCount = commandes.filter((commande) =>
    ["en_attente_paiement", "paye", "en_generation"].includes(commande.statut),
  ).length;
  const composition = buildCompositionState({ commandes, oeuvres, copy: t });
  // Commande reglee dont l'oeuvre n'est jamais arrivee : le questionnaire n'a
  // pas ete mene a son terme. On propose de le reprendre sans repayer.
  const unfinishedPaidOrder = commandes.find(
    (commande) =>
      commande.statut === "paye" &&
      !oeuvres.some((oeuvre) => oeuvre.commande_id === commande.id),
  );
  const [activeSection, setActiveSection] = useState<DashboardSection>(section);
  const sectionToastInitialized = useRef(false);
  const compositionStatusRef = useRef<string>("");
  const sectionLabels = useMemo<Record<DashboardSection, string>>(
    () => ({
      overview: t.overviewNav,
      orders: t.ordersNav,
      artworks: t.artworksNav,
      profile: t.profileNav,
    }),
    [t.artworksNav, t.ordersNav, t.overviewNav, t.profileNav],
  );

  async function shareJuniorTotem(totem: JuniorTotem) {
    const isFr = locale === "fr";
    const text = isFr
      ? `${totem.totemName} · #${String(totem.orderNumber).padStart(6, "0")}\n"${totem.phrase}"\nDécouvre ton totem ancestral sur totem-ancestral.com`
      : `${totem.totemName} · #${String(totem.orderNumber).padStart(6, "0")}\n"${totem.phrase}"\nDiscover your ancestral totem on totem-ancestral.com`;
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      toast.success(t.copied);
    } catch {
      toast.info(t.copyError);
    }
    try {
      await fetch("/api/iuvenis_signum/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: totem.id }),
      });
      if (!copied) toast.success(t.copied);
    } catch {
      // Non bloquant pour le partage local.
    }
  }
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

  useEffect(() => {
    const handleMenuToggle = () => setSidebarOpen((current) => !current);
    window.addEventListener("totem:dashboard-menu-toggle", handleMenuToggle);
    return () => {
      window.removeEventListener("totem:dashboard-menu-toggle", handleMenuToggle);
    };
  }, []);

  useEffect(() => {
    if (!sectionToastInitialized.current) {
      sectionToastInitialized.current = true;
      return;
    }
    toast.message(`${t.sectionOpened}: ${sectionLabels[activeSection]}`);
  }, [activeSection, sectionLabels, t.sectionOpened]);

  useEffect(() => {
    if (!composition.hasComposition) {
      compositionStatusRef.current = "";
      return;
    }
    if (!composition.status || compositionStatusRef.current === composition.status) return;
    compositionStatusRef.current = composition.status;
    toast.info(`${t.compositionStatus}: ${composition.status}`);
  }, [composition.hasComposition, composition.status, t.compositionStatus]);

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
    return <DashboardSkeleton locale={locale} />;
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
    <div className="premium-sidebar flex h-full flex-col">
      <div
        className="flex h-[68px] shrink-0 items-center gap-3 border-b px-6"
        style={{ borderColor: "rgba(216,173,77,0.18)" }}
      >
        <img
          src="/assets/totem-logo.png"
          alt=""
          className="h-8 w-8 shrink-0 object-contain"
        />
        <div className="min-w-0">
          <p
            className="caption text-[10px] uppercase leading-none"
            style={{ color: "var(--or-ancestral)" }}
          >
            Espace
          </p>
          <h2 className="logo-wordmark text-sm leading-tight">Totem Ancestral</h2>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => selectSection(item.key, item.href)}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm uppercase transition-colors hover:bg-ombre"
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

      <div className="mt-auto flex flex-col gap-3 p-4">
        <Link href={newJourneyHref(locale, isJunior)} className="btn-primary w-full py-3 text-xs">
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
        className="fixed left-0 top-0 z-40 hidden h-full w-64 lg:block"
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

              {juniorTotems.length > 0 && (
                <section className="premium-panel mt-6 p-5 md:p-6">
                  <h2 className="h-display text-2xl" style={{ color: "var(--or-ancestral)" }}>
                    Totems Junior
                  </h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {juniorTotems.map((totem) => (
                      <article
                        key={totem.id}
                        className="border p-4"
                        style={{ borderColor: "rgba(216,173,77,0.22)" }}
                      >
                        <p
                          className="subtext text-[11px] uppercase"
                          style={{ color: "rgba(237,217,154,0.56)" }}
                        >
                          #{String(totem.orderNumber).padStart(6, "0")}
                        </p>
                        <h3
                          className="mt-1 text-xl uppercase"
                          style={{ color: "var(--or-pale)", fontFamily: "var(--font-display)" }}
                        >
                          {totem.totemName}
                        </h3>
                        <p className="mt-2 text-sm" style={{ color: "rgba(245,240,232,0.7)" }}>
                          {totem.phrase}
                        </p>
                        <div
                          className="mt-3 flex items-center gap-4 text-xs"
                          style={{ color: "rgba(237,217,154,0.5)" }}
                        >
                          <span>{totem.quality}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-secondary mt-3 w-full"
                          onClick={() => shareJuniorTotem(totem)}
                        >
                          <Share2 size={14} />
                          Partager
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </section>
          )}

          {activeSection === "orders" && (
            <section id="dashboard-orders" className="flex flex-col gap-5">
              <h1 className="h-display text-4xl" style={{ color: "var(--or-ancestral)" }}>
                {t.latestOrders}
              </h1>
              {unfinishedPaidOrder && (
                <div
                  className="premium-panel-strong flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6"
                  style={{ borderColor: "rgba(216,173,77,0.42)" }}
                >
                  <div className="flex min-w-0 flex-col gap-2">
                    <span
                      className="caption inline-flex items-center gap-2 uppercase"
                      style={{ color: "var(--or-ancestral)" }}
                    >
                      <AlertTriangle size={13} />
                      {t.unfinishedTitle}
                    </span>
                    <p className="subtext text-sm">{t.unfinishedHint}</p>
                  </div>
                  <Link
                    href={`/${locale}/via_sapientiae`}
                    className="btn-primary shrink-0 justify-center"
                  >
                    <PlayCircle size={15} />
                    {t.unfinishedCta}
                  </Link>
                </div>
              )}
              {drafts.map((draft) => (
                <ResumeCard key={draft.piste} draft={draft} locale={locale} copy={t} />
              ))}
              {commandes.length === 0 ? (
                drafts.length === 0 ? (
                  <EmptyState
                    text={t.noOrders}
                    cta={t.emptyCta}
                    href={newJourneyHref(locale, isJunior)}
                  />
                ) : null
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
                <EmptyState text={t.noArtworks} cta={t.emptyCta} href={newJourneyHref(locale, isJunior)} />
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

                {/* Sexe : reglable ici, notamment pour les comptes crees avant
                    qu'il ne soit demande a l'inscription. */}
                <div
                  className="mt-8 border-t pt-6"
                  style={{ borderColor: "rgba(216,173,77,0.18)" }}
                >
                  <p className="caption uppercase" style={{ color: "rgba(237,217,154,0.7)" }}>
                    {t.gender}
                  </p>
                  <p className="mt-2 text-sm premium-muted" style={{ lineHeight: 1.5 }}>
                    {t.genderHint}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["homme", "femme"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        disabled={savingSexe}
                        aria-pressed={sexe === value}
                        onClick={async () => {
                          if (!token || sexe === value) return;
                          setSavingSexe(true);
                          const previous = sexe;
                          setSexe(value);
                          try {
                            const response = await fetch("/api/personae_nota", {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                                authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ sexe: value }),
                            });
                            if (!response.ok) throw new Error("save_failed");
                            toast.success(t.genderSaved);
                          } catch {
                            setSexe(previous);
                            toast.error(t.genderFailed);
                          } finally {
                            setSavingSexe(false);
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm uppercase tracking-wide transition-all disabled:opacity-60"
                        style={{
                          fontFamily: "var(--font-display)",
                          background:
                            sexe === value ? "rgba(216,173,77,0.14)" : "rgba(13,13,26,0.55)",
                          boxShadow:
                            sexe === value
                              ? "0 0 0 1px var(--or-ancestral)"
                              : "0 0 0 1px rgba(216,173,77,0.18)",
                          color: sexe === value ? "var(--or-pale)" : "rgba(226,225,238,0.66)",
                        }}
                      >
                        {value === "homme" ? <Mars size={15} /> : <Venus size={15} />}
                        {value === "homme" ? t.genderMale : t.genderFemale}
                      </button>
                    ))}
                  </div>
                  {!sexe && (
                    <p className="caption mt-2" style={{ color: "rgba(226,225,238,0.45)" }}>
                      {t.genderUnset}
                    </p>
                  )}
                </div>
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
  const hasAnyArtwork = oeuvres.some(
    (oeuvre) => oeuvre.statut === "livree" || oeuvre.image_url || oeuvre.pdf_url,
  );
  const hasComposition = commandes.length > 0 || hasAnyArtwork;

  if (!hasComposition) {
    return { status: t.noComposition, progress: 0, events: [], hasComposition: false };
  }

  // Le suivi porte sur la commande en cours, pas sur l'ensemble du compte :
  // une oeuvre deja livree ne doit pas afficher une nouvelle commande a 100 %.
  if (!latestOrder) {
    return {
      status: t.deliveredStatus,
      progress: 100,
      events: [t.deliveredStatus],
      hasComposition: true,
    };
  }

  const artwork = oeuvres.find((oeuvre) => oeuvre.commande_id === latestOrder.id);
  const delivered =
    latestOrder.statut === "livree" ||
    Boolean(artwork && (artwork.statut === "livree" || artwork.image_url || artwork.pdf_url));

  const reference = `#${latestOrder.id.slice(0, 8)}`;
  const step = (status: string, progress: number) => ({
    status,
    progress,
    events: [`${t.orders} ${reference} · ${status}`],
    hasComposition: true,
  });

  if (delivered) return step(t.deliveredStatus, 100);
  if (latestOrder.statut === "erreur") return step(t.errorStatus, 88);
  if (latestOrder.statut === "en_generation") return step(t.generatingStatus, 88);
  if (latestOrder.statut === "paye") return step(t.paidStatus, 72);
  if (latestOrder.statut === "en_attente_paiement") return step(t.offerStatus, 40);

  return step(t.draftStatus ?? "", 25);
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
        <div className="flex flex-col items-end gap-2">
          <span
            className="w-fit rounded-sm border px-3 py-1 text-xs uppercase"
            style={statusStyle(commande.statut)}
          >
            {status}
          </span>
          {commande.statut === "en_attente_paiement" && (
            <Link
              href={`/${locale}/via_sapientiae?restart=1`}
              className="btn-primary px-4 py-2 text-xs"
            >
              <CreditCard size={14} />
              Payer
            </Link>
          )}
        </div>
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

/**
 * Carte de reprise d'un parcours interrompu. Elle ouvre la piste concernee sur
 * la question ou le visiteur s'etait arrete, quel que soit l'appareil utilise
 * au demarrage.
 */
function ResumeCard({
  draft,
  locale,
  copy: t,
}: {
  draft: ParcoursDraft;
  locale: Locale;
  copy: (typeof copy)[Locale];
}) {
  const total = draft.totalQuestions ?? (draft.piste === "junior" ? 5 : 10);
  const current = Math.min(draft.questionNumber ?? draft.index + 1, total);
  const progress = Math.round((current / total) * 100);

  return (
    <div
      className="premium-panel-strong flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6"
      style={{ borderColor: "rgba(216,173,77,0.42)" }}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <span
          className="caption inline-flex items-center gap-2 uppercase"
          style={{ color: "var(--or-ancestral)" }}
        >
          <Clock3 size={13} />
          {t.resumeTitle}
        </span>
        <p className="h-display text-2xl" style={{ color: "var(--or-pale)" }}>
          {draft.piste === "junior" ? t.resumeJunior : t.resumeAdult}
        </p>
        <p className="subtext text-sm">
          {t.resumeProgress
            .replace("{current}", String(current))
            .replace("{total}", String(total))}
        </p>
        <div
          className="h-[3px] w-full max-w-[280px] overflow-hidden rounded-full"
          style={{ background: "rgba(216,173,77,0.16)" }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: "var(--or-ancestral)" }}
          />
        </div>
        <p className="subtext text-xs opacity-80">{t.resumeHint}</p>
      </div>
      <Link
        href={resumeJourneyHref(locale, draft.piste)}
        className="btn-primary shrink-0 justify-center"
      >
        <PlayCircle size={15} />
        {t.resumeCta}
      </Link>
    </div>
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
