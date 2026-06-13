"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  Download,
  FileText,
  Image as ImageIcon,
  ListChecks,
  LogOut,
  PackageCheck,
  Plus,
  Sparkles,
  UserRound,
  Volume2,
} from "lucide-react";
import { useSupabaseSession } from "@/hooks/use-supabase-session";

type Locale = "fr" | "en";

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

export function DashboardClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const { session, user, loading: authLoading, signOut } = useSupabaseSession();
  const t = copy[locale];
  const authPath = useMemo(
    () => `/${locale}/janua_vitae?redirect=${encodeURIComponent(`/${locale}/domus_animi`)}`,
    [locale],
  );

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [oeuvres, setOeuvres] = useState<Oeuvre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = session?.access_token;

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.replace(authPath);
      return;
    }

    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [commandesRes, oeuvresRes] = await Promise.all([
          fetch("/api/commandes", {
            headers: { authorization: `Bearer ${token}` },
          }),
          fetch("/api/oeuvres", {
            headers: { authorization: `Bearer ${token}` },
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
    return () => { alive = false; };
  }, [authLoading, session, token, authPath, locale, router, t.error]);

  const name =
    user?.user_metadata?.prenom ||
    user?.email?.split("@")[0] ||
    t.defaultName;
  const deliveredCount = oeuvres.filter(
    (oeuvre) => oeuvre.statut === "livree" || oeuvre.image_url || oeuvre.pdf_url,
  ).length;
  const activeCount = commandes.filter((commande) =>
    ["en_attente_paiement", "paye", "en_generation"].includes(commande.statut),
  ).length;
  const composition = buildCompositionState({ commandes, oeuvres, copy: t });

  if (authLoading || loading) {
    return (
      <section
        className="flex min-h-[100svh] items-center justify-center px-5 pt-28"
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
        className="flex min-h-[100svh] items-center justify-center px-5 pt-28"
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

  return (
    <section
      className="min-h-[100svh] px-5 pb-24 pt-32 md:px-10"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div className="flex flex-col gap-4">
            <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
              {t.eyebrow}
            </p>
            <h1
              className="h-display text-4xl leading-tight md:text-6xl"
              style={{ color: "var(--ivoire)" }}
            >
              {t.title.replace("{name}", name)}
            </h1>
            <p className="body-copy max-w-2xl" style={{ color: "rgba(254,252,240,0.72)" }}>
              {t.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/via_sapientiae`} className="btn-primary">
              <Plus size={16} />
              {t.compose}
            </Link>
            <button type="button" onClick={signOut} className="btn-secondary">
              <LogOut size={16} />
              {t.logout}
            </button>
          </div>
        </motion.header>

        <div className="grid gap-4 md:grid-cols-4">
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
          <StatCard icon={<Clock3 size={20} />} label={t.active} value={activeCount.toString()} />
        </div>

        <CompositionPanel composition={composition} locale={locale} />

        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <aside
            className="rounded-lg border p-6"
            style={{ background: "rgba(26,26,46,0.72)", borderColor: "rgba(201,168,76,0.22)" }}
          >
            <div className="mb-6 flex items-center gap-3">
              <UserRound size={20} color="var(--or-ancestral)" />
              <h2 className="h-display text-2xl" style={{ color: "var(--or-ancestral)" }}>
                {t.profile}
              </h2>
            </div>
            <dl className="flex flex-col gap-4">
              <ProfileLine label={t.email} value={user?.email ?? "-"} />
              <ProfileLine label={t.language} value={locale.toUpperCase()} />
            </dl>
          </aside>

          <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="h-display text-3xl" style={{ color: "var(--or-ancestral)" }}>
                {t.latestOrders}
              </h2>
            </div>
            {commandes.length === 0 ? (
              <EmptyState text={t.noOrders} cta={t.emptyCta} href={`/${locale}/via_sapientiae`} />
            ) : (
              <div className="grid gap-4">
                {commandes.map((commande) => (
                  <OrderCard key={commande.id} commande={commande} locale={locale} />
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="flex flex-col gap-5">
          <h2 className="h-display text-3xl" style={{ color: "var(--or-ancestral)" }}>
            {t.artworks}
          </h2>
          {oeuvres.length === 0 ? (
            <EmptyState text={t.noArtworks} cta={t.emptyCta} href={`/${locale}/via_sapientiae`} />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {oeuvres.map((oeuvre) => (
                <ArtworkCard key={oeuvre.id} oeuvre={oeuvre} locale={locale} />
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article
      className="rounded-lg border p-5"
      style={{ background: "rgba(26,26,46,0.72)", borderColor: "rgba(201,168,76,0.22)" }}
    >
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
    <section
      className="grid gap-5 rounded-lg border p-5 md:grid-cols-[0.82fr_1.18fr] md:p-6"
      style={{ background: "rgba(26,26,46,0.72)", borderColor: "rgba(201,168,76,0.22)" }}
    >
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
          <p className="caption" style={{ color: "rgba(254,252,240,0.58)" }}>
            {t.noEvents}
          </p>
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
                  style={{ color: "rgba(254,252,240,0.78)" }}
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
    <article
      className="rounded-lg border p-5"
      style={{ background: "rgba(26,26,46,0.72)", borderColor: "rgba(201,168,76,0.22)" }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="h-display text-2xl" style={{ color: "var(--ivoire)" }}>
            {offerLabels[locale][commande.offre] ?? commande.offre}
          </h3>
          <p className="caption mt-1">#{commande.id.slice(0, 8)}</p>
        </div>
        <span
          className="w-fit rounded border px-3 py-1 text-xs uppercase tracking-[0.14em]"
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

function ArtworkCard({ oeuvre, locale }: { oeuvre: Oeuvre; locale: Locale }) {
  const t = copy[locale];
  const links: Array<{ label: string; href: string; icon: ReactNode }> = [
    { label: t.image, href: oeuvre.image_url, icon: <ImageIcon size={15} /> },
    { label: t.audio, href: oeuvre.audio_url, icon: <Volume2 size={15} /> },
    { label: t.pdf, href: oeuvre.pdf_url, icon: <FileText size={15} /> },
  ].flatMap((link) => (link.href ? [{ ...link, href: link.href }] : []));

  return (
    <article
      className="overflow-hidden rounded-lg border"
      style={{ background: "rgba(26,26,46,0.72)", borderColor: "rgba(201,168,76,0.22)" }}
    >
      {oeuvre.image_url ? (
        <img
          src={oeuvre.image_url}
          alt={oeuvre.nom_totem || t.unnamed}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div
          className="flex aspect-square items-center justify-center"
          style={{ background: "var(--ombre-doree)" }}
        >
          <Sparkles size={34} color="var(--or-ancestral)" />
        </div>
      )}
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h3 className="h-display text-2xl" style={{ color: "var(--or-ancestral)" }}>
            {oeuvre.nom_totem || t.unnamed}
          </h3>
          <p className="caption mt-1">
            {oeuvre.numero_serie
              ? `No ${oeuvre.numero_serie}`
              : formatDate(oeuvre.created_at, locale)}
          </p>
        </div>
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
          <p className="caption" style={{ color: "rgba(254,252,240,0.58)" }}>
            {t.waitingFiles}
          </p>
        )}
      </div>
    </article>
  );
}

function EmptyState({ text, cta, href }: { text: string; cta: string; href: string }) {
  return (
    <div
      className="rounded-lg border px-6 py-10 text-center"
      style={{ borderColor: "rgba(201,168,76,0.22)" }}
    >
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
      borderColor: "rgba(201,168,76,0.45)",
      color: "var(--or-ancestral)",
      background: "rgba(45,45,26,0.58)",
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
    borderColor: "rgba(237,217,154,0.28)",
    color: "var(--or-pale)",
    background: "rgba(26,26,46,0.86)",
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
