"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoldParticles } from "@/components/GoldParticles";
import { MaskLogo } from "@/components/MaskLogo";
import { Check, Home, LayoutDashboard } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";


type FieldLevel = "PRIORITAIRE" | "SECONDAIRE" | "TERTIAIRE" | "SPECIAL";

type Question = {
  n: number;
  progress: number;
  griot: string;
  question: string;
  choices: { letter: "A" | "B" | "C" | "D"; text: string }[];
  field: {
    level: FieldLevel;
    label: string;
    placeholder: string;
    rows: number;
  };
  note?: string;
  canSkip?: boolean;
};

const QUESTIONS: Question[] = [
  {
    n: 1,
    progress: 10,
    griot:
      "Ferme les yeux un instant. Pense à la nature — à ce qui t'attire sans que tu puisses l'expliquer.",
    question: "Quel élément naturel t'appelle le plus profondément ?",
    choices: [
      {
        letter: "A",
        text: "Le feu qui danse dans la nuit — je suis attiré par sa lumière, sa chaleur imprévisible, sa façon de tout transformer.",
      },
      {
        letter: "B",
        text: "L'eau qui coule sans jamais s'arrêter — rivière, océan, pluie — je reviens toujours vers elle.",
      },
      {
        letter: "C",
        text: "La terre sous mes pieds — les racines, les pierres, les forêts épaisses — ce qui dure et qui tient.",
      },
      {
        letter: "D",
        text: "Le vent qui emporte tout — l'espace ouvert, les hauteurs, l'horizon qu'on ne peut pas attraper.",
      },
    ],
    field: {
      level: "SECONDAIRE",
      label: "Autre chose ?",
      placeholder: "Un élément, un paysage, une sensation qui n'est pas dans la liste...",
      rows: 1,
    },
  },
  {
    n: 2,
    progress: 20,
    griot: "",
    question: "Dans quel moment te sens-tu le plus vivant(e) ?",
    choices: [
      {
        letter: "A",
        text: "Quand je protège quelqu'un — quand je me bats pour ce qui est juste — quand je suis au cœur de l'action.",
      },
      {
        letter: "B",
        text: "Quand je crée quelque chose — une idée, une œuvre, un projet — quand mes mains donnent vie à ma vision.",
      },
      {
        letter: "C",
        text: "Quand je suis entouré(e) de ceux que j'aime — dans le rire, dans le partage, dans le lien.",
      },
      {
        letter: "D",
        text: "Quand je suis seul(e) dans la nature ou dans le silence — quand j'observe, quand je comprends, quand je vois loin.",
      },
    ],
    field: {
      level: "TERTIAIRE",
      label: "+ ajouter une nuance",
      placeholder: "Décris le moment où tu te sens pleinement vivant(e)...",
      rows: 1,
    },
  },
  {
    n: 3,
    progress: 30,
    griot:
      "Écoute bien. Ce que les autres voient en toi — sans que tu le demandes — c'est souvent ce que tu refuses de voir toi-même.",
    question: "Ce que les autres voient en toi — sans que tu le leur demandes ?",
    choices: [
      {
        letter: "A",
        text: "Une force. Une présence. Quelqu'un vers qui on se tourne quand ça va mal — ou quand il faut décider.",
      },
      {
        letter: "B",
        text: "Une sagesse. Un regard différent. Quelqu'un qui dit les choses que les autres n'osent pas formuler.",
      },
      {
        letter: "C",
        text: "Une douceur. Une chaleur. Quelqu'un qui accueille, qui écoute, qui rend les gens meilleurs.",
      },
      {
        letter: "D",
        text: "Une liberté. Une originalité. Quelqu'un qu'on n'arrive pas vraiment à enfermer dans une case.",
      },
    ],
    field: {
      level: "PRIORITAIRE",
      label: "Le griot t'a écouté. Si tu veux lui souffler une nuance, il l'entendra.",
      placeholder:
        "Une phrase qu'on te dit souvent, que tu aimes ou que tu n'aimes pas entendre...",
      rows: 2,
    },
  },
  {
    n: 4,
    progress: 40,
    griot: "L'épreuve révèle. Pas ce qu'on dit qu'on ferait — ce qu'on fait vraiment.",
    question: "Face à une épreuve — comment réagis-tu vraiment ?",
    choices: [
      {
        letter: "A",
        text: "Je fonce. J'agis. Je préfère me tromper dans l'action que rester immobile dans le doute.",
      },
      {
        letter: "B",
        text: "Je recule, j'observe, j'analyse — puis je choisis le moment et l'endroit où frapper juste.",
      },
      {
        letter: "C",
        text: "Je cherche les autres — je construis des alliances, je crée du soutien autour de moi.",
      },
      {
        letter: "D",
        text: "Je rentre en moi-même — je cherche la réponse dans le silence avant de la chercher dehors.",
      },
    ],
    field: {
      level: "TERTIAIRE",
      label: "+ ajouter une nuance",
      placeholder: "Comment tu gères vraiment les situations difficiles...",
      rows: 1,
    },
  },
  {
    n: 5,
    progress: 50,
    griot:
      "Il y a une heure dans la journée où tout semble plus clair. Une heure où tu es vraiment toi.",
    question: "À quelle heure ton âme se réveille-t-elle vraiment ?",
    choices: [
      {
        letter: "A",
        text: "À l'aube — quand le monde est encore silence et que tout est possible — avant que les autres arrivent.",
      },
      {
        letter: "B",
        text: "En plein jour — dans le feu de l'action, du mouvement, des rencontres, du bruit vivant.",
      },
      {
        letter: "C",
        text: "Au crépuscule — quand la lumière change, quand les frontières s'estompent, quand on peut réfléchir.",
      },
      {
        letter: "D",
        text: "Dans la nuit — quand le monde dort et que je suis enfin seul(e) avec mes pensées les plus profondes.",
      },
    ],
    field: {
      level: "SECONDAIRE",
      label: "Ton heure à toi ?",
      placeholder: "Le moment de la journée où tu te sens vraiment toi-même...",
      rows: 1,
    },
  },
  {
    n: 6,
    progress: 60,
    note: "Cette question est la seule que tu peux choisir de ne pas répondre.",
    canSkip: true,
    griot:
      "Cette question est la seule que tu peux choisir de ne pas répondre. Mais si tu le fais — les ancêtres seront plus proches.",
    question: "Quelle est l'origine de tes ancêtres — aussi loin que tu le sais ?",
    choices: [
      {
        letter: "A",
        text: "Afrique de l'Ouest — Sénégal, Mali, Guinée, Côte d'Ivoire, Nigeria, Ghana, Bénin et environs.",
      },
      {
        letter: "B",
        text: "Afrique Centrale, de l'Est ou du Sud — Congo, Kenya, Tanzanie, Éthiopie, Afrique du Sud et environs.",
      },
      {
        letter: "C",
        text: "Caraïbes, Amériques ou diaspora africaine — une origine africaine probable mais indéterminée.",
      },
      {
        letter: "D",
        text: "Europe, Asie, Océanie ou toute autre région — je suis ici pour découvrir mes racines africaines profondes.",
      },
    ],
    field: {
      level: "SPECIAL",
      label: "Tu sais quelque chose de précis ?",
      placeholder:
        "Un pays, une ethnie, une région que tu connais ou que tu as envie d'explorer...",
      rows: 2,
    },
  },
  {
    n: 7,
    progress: 70,
    griot:
      "La colère est sacrée. Elle dit ce qui compte vraiment. Ce qui te met en colère révèle ce à quoi tu tiens le plus.",
    question: "Ce qui met le feu en toi — ta colère la plus profonde ?",
    choices: [
      {
        letter: "A",
        text: "L'injustice. Voir les faibles écrasés par les puissants. Voir la vérité bafouée. Voir les droits piétinés.",
      },
      {
        letter: "B",
        text: "La médiocrité acceptée. Les gens qui se contentent de peu. Le gâchis de potentiel. L'abandon des rêves.",
      },
      {
        letter: "C",
        text: "La trahison et le mensonge. L'hypocrisie. Les gens qui jouent un rôle plutôt que d'être vrais.",
      },
      {
        letter: "D",
        text: "La destruction — de la nature, de la beauté, de la mémoire, de ce qui a pris des siècles à construire.",
      },
    ],
    field: {
      level: "PRIORITAIRE",
      label: "Les ancêtres écoutent mieux ceux qui osent les mots qu'ils gardent pour eux.",
      placeholder:
        "Ce qui te met vraiment hors de toi — ce contre quoi tu te bats intérieurement...",
      rows: 2,
    },
  },
  {
    n: 8,
    progress: 80,
    griot: "Imagine que dans cent ans, quelqu'un parle de toi. Qu'est-ce qu'il dit ?",
    question: "La trace que tu veux laisser dans le monde ?",
    choices: [
      {
        letter: "A",
        text: "J'ai protégé. J'ai défendu. J'ai rendu le monde plus juste pour ceux qui viendront après moi.",
      },
      {
        letter: "B",
        text: "J'ai créé. J'ai bâti quelque chose qui durera — une œuvre, une entreprise, une idée, un héritage.",
      },
      {
        letter: "C",
        text: "J'ai connecté. J'ai rassemblé les gens. J'ai créé des liens là où il n'y en avait pas.",
      },
      {
        letter: "D",
        text: "J'ai révélé. J'ai dit des vérités que personne n'osait dire. J'ai ouvert des yeux.",
      },
    ],
    field: {
      level: "TERTIAIRE",
      label: "+ ajouter une nuance",
      placeholder: "Ce que tu veux qu'on retienne de ta vie — en quelques mots...",
      rows: 1,
    },
  },
  {
    n: 9,
    progress: 90,
    griot:
      "Les rêves parlent. Pas littéralement — mais symboliquement. Qu'est-ce qui revient dans ton monde intérieur ?",
    question: "Ton symbole intérieur — ce qui revient dans tes rêves ou ta vie ?",
    choices: [
      {
        letter: "A",
        text: "L'eau — une rivière, un océan, une pluie — quelque chose qui coule, qui emporte, qui purifie.",
      },
      {
        letter: "B",
        text: "La hauteur — une falaise, un sommet, un vol — une vision d'en haut, une perspective que les autres n'ont pas.",
      },
      {
        letter: "C",
        text: "Le feu ou la lumière — une flamme, un soleil, un éclair — quelque chose qui brûle et qui illumine.",
      },
      {
        letter: "D",
        text: "Les racines ou la forêt — des arbres, de la terre, des chemins anciens — quelque chose de profond et de durable.",
      },
    ],
    field: {
      level: "SECONDAIRE",
      label: "Ton symbole à toi ?",
      placeholder: "Une image, un rêve récurrent, un symbole qui revient souvent dans ta vie...",
      rows: 1,
    },
  },
  {
    n: 10,
    progress: 100,
    griot:
      "Dernière question. La plus importante. L'ancêtre te regarde. Il voit ta vie entière. Pas ce que tu as fait — mais ce que tu portes.",
    question: "Si un ancêtre pouvait regarder ta vie — qu'est-ce qu'il verrait ?",
    choices: [
      {
        letter: "A",
        text: "Un guerrier qui n'a pas encore trouvé sa vraie bataille. Une force immense qui attend le bon moment.",
      },
      {
        letter: "B",
        text: "Un sage qui parle trop peu. Une sagesse profonde que le monde a besoin d'entendre davantage.",
      },
      {
        letter: "C",
        text: "Un cœur qui aime trop fort et pas assez lui-même. Une générosité qui parfois s'oublie.",
      },
      {
        letter: "D",
        text: "Un esprit libre dans un corps qui essaie de rentrer dans des cases. Une âme trop grande pour les limites qu'on lui impose.",
      },
    ],
    field: {
      level: "PRIORITAIRE",
      label: "Dis-lui maintenant ce que tu n'as jamais dit à voix haute.",
      placeholder:
        "Une confidence, une vérité, un mot — quelque chose que tu n'as jamais dit à voix haute...",
      rows: 3,
    },
  },
];

const PENDING_CHECKOUT_KEY = "totem_pending_checkout_v1";

type Phase =
  | "intro"
  | "question"
  | "account"
  | "paywall-transition"
  | "paywall"
  | "post-payment"
  | "final-transition"
  | "waiting";

type Answer = { choice?: "A" | "B" | "C" | "D"; field?: string; skipped?: boolean };
type AccountDraft = { prenom: string; email: string };

type Offer = {
  id: OfferId;
  name: string;
  amountCents: number;
  price: string;
  sub: string;
  bestFor: string;
  delivery: string;
  includes: string;
  features: string[];
  cta: string;
  featured: boolean;
};

type OfferId = "origine" | "ancestral" | "famille";

export function ParcoursPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = toLocale(useLocale());
  const t = useTranslations("parcours");
  const questions = t.raw("questions") as Question[];
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [account, setAccount] = useState<AccountDraft>({ prenom: "", email: "" });
  const [session, setSession] = useState<Session | null>(null);
  const [hasUnlockedRest, setHasUnlockedRest] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [loadingOffer, setLoadingOffer] = useState<OfferId | null>(null);
  const [nudgeCount, setNudgeCount] = useState(0);
  const [nudge, setNudge] = useState<string | null>(null);
  const filledRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!currentSession) {
        router.replace(`/${locale}/auth?mode=signup&redirect=/${locale}/parcours`);
        return;
      }
      setSession(currentSession);
      setAccount({
        prenom: currentSession.user.user_metadata?.prenom ?? "",
        email: currentSession.user.email ?? "",
      });
    });
  }, [locale, router]);

  useEffect(() => {
    if (!session) return;
    const checkout = searchParams.get("checkout");
    if (!checkout) return;

    if (checkout === "cancelled") {
      setCheckoutError("Paiement annule.");
      setPhase("paywall");
      router.replace(`/${locale}/parcours`, { scroll: false });
      return;
    }

    if (checkout === "success") {
      clearPendingCheckout();
      setHasUnlockedRest(true);
      setPhase("post-payment");
      router.replace(`/${locale}/parcours`, { scroll: false });
    }
  }, [locale, router, searchParams, session]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, []);

  // Restore progress from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("totem_parcours_v1");
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        answers?: Record<number, Answer>;
        account?: AccountDraft;
        hasUnlockedRest?: boolean;
        index?: number;
        phase?: Phase;
      };
      if (saved.answers) setAnswers(saved.answers);
      if (saved.account) setAccount(saved.account);
      if (typeof saved.hasUnlockedRest === "boolean") setHasUnlockedRest(saved.hasUnlockedRest);
      if (typeof saved.index === "number") setIndex(saved.index);
      if (saved.phase && saved.phase !== "waiting") {
        setPhase(saved.phase === "account" ? "paywall-transition" : saved.phase);
      }
    } catch {
      /* ignore corrupted storage */
    }
  }, []);

  // Persist progress to localStorage on every change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "totem_parcours_v1",
        JSON.stringify({ answers, account, hasUnlockedRest, index, phase }),
      );
    } catch {
      /* quota — ignore */
    }
  }, [answers, account, hasUnlockedRest, index, phase]);

  const current = questions[index] ?? QUESTIONS[index];
  const progress = phase === "intro" ? 0 : phase === "question" ? current.progress : 100;

  // Paywall auto-transition
  useEffect(() => {
    if (phase === "paywall-transition") {
      const t = setTimeout(() => setPhase("paywall"), 2500);
      return () => clearTimeout(t);
    }
    if (phase === "final-transition") {
      const t = setTimeout(() => setPhase("paywall"), 4000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  function triggerNudge(qN: number, text: string) {
    if (filledRef.current.has(qN)) return;
    if (!text || text.trim().length <= 10) return;
    filledRef.current.add(qN);
    const messages = [
      "Le griot t'écoute.",
      "Plus tu lui confies, plus l'œuvre te ressemblera.",
      "Tu offres au griot une matière rare. Ton œuvre s'enrichit.",
    ];
    const msg = messages[Math.min(nudgeCount, messages.length - 1)];
    setNudgeCount((c) => c + 1);
    setNudge(msg);
    setTimeout(() => setNudge(null), 3500);
  }

  function setChoice(c: "A" | "B" | "C" | "D") {
    setAnswers((a) => ({ ...a, [current.n]: { ...a[current.n], choice: c } }));
  }

  function setField(v: string) {
    setAnswers((a) => ({ ...a, [current.n]: { ...a[current.n], field: v } }));
    triggerNudge(current.n, v);
  }

  function next() {
    if (current.n === 10) {
      setPhase("final-transition");
      return;
    }
    setIndex((i) => i + 1);
  }

  function previous() {
    if (index === 0) {
      setPhase("intro");
      return;
    }
    setIndex((i) => Math.max(0, i - 1));
  }

  const a = answers[current?.n ?? 1];
  const canContinue = phase !== "question" ? true : !!a?.choice || (current.canSkip && a?.skipped);

  async function chooseOffer(offer: Offer) {
    if (!session) return;
    setCheckoutError(null);
    setLoadingOffer(offer.id);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          offre: offer.id,
          answers,
          locale,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        checkoutUrl?: string;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "checkout_failed");
      }

      if (!payload?.checkoutUrl) {
        throw new Error("URL de paiement non disponible");
      }

      writePendingCheckout({ offerId: offer.id, amountCents: offer.amountCents });
      window.location.href = payload.checkoutUrl;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "checkout_failed");
    } finally {
      setLoadingOffer(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] w-full max-w-full overflow-hidden"
      style={{ background: "var(--nuit-profonde)" }}
    >
      {/* Progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-[210]"
        style={{ height: 3, background: "#1A1A2E" }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "var(--or-ancestral)",
            transition: "width 0.5s ease",
          }}
        />
      </div>

      <JourneyNav locale={locale} phase={phase} currentStep={current?.n ?? 0} progress={progress} />

      <GoldParticles count={20} />

      <AnimatePresence mode="wait">
        {phase === "intro" && <IntroScreen key="intro" onStart={() => setPhase("question")} />}
        {phase === "question" && current && (
          <QuestionScreen
            key={`q-${current.n}`}
            q={current}
            answer={a}
            onChoice={setChoice}
            onField={setField}
            onSkip={() =>
              setAnswers((x) => ({ ...x, [current.n]: { ...x[current.n], skipped: true } }))
            }
            onNext={next}
            onPrev={previous}
            canContinue={!!canContinue}
            isFirst={index === 0}
          />
        )}
        {phase === "account" && (
          <AccountScreen
            key="account"
            account={account}
            onChange={setAccount}
            onBack={() => setPhase("question")}
            onContinue={() => {
              if (session) {
                fetch("/api/profiles", {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({
                    prenom: account.prenom.trim(),
                    langue: locale,
                  }),
                }).catch(() => {});
              }
              setPhase("paywall-transition");
            }}
          />
        )}
        {phase === "paywall-transition" && <PaywallTransition key="pt" />}
        {phase === "paywall" && (
          <Paywall
            key="pw"
            onChoose={chooseOffer}
            loadingOffer={loadingOffer}
            checkoutError={checkoutError}
          />
        )}
        {phase === "post-payment" && (
          <PostPayment
            key="pp"
            onContinue={() => {
              setPhase("waiting");
            }}
          />
        )}
        {phase === "final-transition" && <FinalTransition key="ft" />}
        {phase === "waiting" && <WaitingScreen key="ws" />}
      </AnimatePresence>

      {/* Nudge */}
      <AnimatePresence>
        {nudge && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed left-1/2 z-[220] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded px-6 py-3 text-center"
            style={{
              bottom: 32,
              background: "rgba(13,13,26,0.92)",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "var(--or-ancestral)",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 15,
            }}
          >
            {nudge}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Sub-screens ---------- */

const fadeSlide = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

function JourneyNav({
  locale,
  phase,
  currentStep,
  progress,
}: {
  locale: "fr" | "en";
  phase: Phase;
  currentStep: number;
  progress: number;
}) {
  const isFrench = locale === "fr";
  const label = getJourneyLabel({ phase, currentStep, progress, isFrench });

  return (
    <nav
      className="fixed left-0 right-0 z-[230] px-4 pt-4 md:px-8"
      aria-label={isFrench ? "Navigation du parcours" : "Journey navigation"}
    >
      <div
        className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-md border px-3 md:px-4"
        style={{
          background: "rgba(13,13,26,0.88)",
          borderColor: "rgba(201,168,76,0.24)",
          backdropFilter: "blur(14px)",
        }}
      >
        <Link
          href={`/${locale}`}
          className="flex min-w-0 items-center gap-2"
          aria-label="Totem Ancestral"
        >
          <span
            className="logo-wordmark text-[18px] leading-none"
            style={{ color: "var(--ivoire)" }}
          >
            T
          </span>
          <img src="/assets/totem-logo.png" alt="" aria-hidden="true" className="h-8 w-auto" />
          <span
            className="logo-wordmark text-[18px] leading-none"
            style={{ color: "var(--ivoire)" }}
          >
            A
          </span>
        </Link>

        <p
          className="hidden min-w-0 truncate text-center text-[11px] uppercase tracking-[0.16em] md:block"
          style={{ color: "rgba(237,217,154,0.72)" }}
        >
          {label}
        </p>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/${locale}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors hover:bg-ombre"
            style={{ borderColor: "rgba(201,168,76,0.24)", color: "var(--or-ancestral)" }}
            aria-label={isFrench ? "Accueil" : "Home"}
          >
            <Home size={16} />
          </Link>
          <Link
            href={`/${locale}/espace-personnel`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border px-3 text-[11px] uppercase tracking-[0.12em] transition-colors hover:bg-ombre"
            style={{ borderColor: "rgba(201,168,76,0.28)", color: "var(--or-ancestral)" }}
          >
            <LayoutDashboard size={15} />
            <span className="hidden sm:inline">{isFrench ? "Dashboard" : "Dashboard"}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function getJourneyLabel({
  phase,
  currentStep,
  progress,
  isFrench,
}: {
  phase: Phase;
  currentStep: number;
  progress: number;
  isFrench: boolean;
}) {
  if (phase === "question") {
    return isFrench
      ? `Question ${currentStep}/10 - ${progress}%`
      : `Question ${currentStep}/10 - ${progress}%`;
  }
  if (phase === "paywall") return isFrench ? "Choix de l'offre" : "Offer selection";
  if (phase === "waiting") return isFrench ? "Composition en cours" : "Composition in progress";
  if (phase === "post-payment") return isFrench ? "Commande enregistree" : "Order saved";
  return isFrench ? "Parcours du griot" : "Griot journey";
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  const t = useTranslations("parcours.intro");
  const lines = [
    {
      delay: 0.3,
      render: () => (
        <motion.p
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            color: "var(--ivoire)",
            letterSpacing: "0.08em",
            display: "inline-block",
            transformOrigin: "center",
          }}
        >
          {t("title")}
        </motion.p>
      ),
    },
    {
      delay: 0.6,
      render: () => (
        <p className="quote-italic" style={{ fontSize: 18 }}>
          {t("body1")}
        </p>
      ),
    },
    {
      delay: 0.9,
      render: () => (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            color: "rgba(254,252,240,0.8)",
            lineHeight: 1.7,
          }}
        >
          {t("body2")}
          <br />
          <br />
          {t("body3")}
        </p>
      ),
    },
  ];

  return (
    <motion.section
      {...fadeSlide}
      className="relative flex min-h-0 items-center justify-center overflow-hidden px-5"
      style={{ height: "100svh" }}
    >
      <div className="w-full max-w-[560px] text-center flex flex-col items-center gap-6">
        <MaskLogo size={80} />
        <div className="section-divider" style={{ marginBottom: 0 }} />
        {lines.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: l.delay }}
          >
            {l.render()}
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="flex flex-col items-center gap-4 mt-4"
        >
          <button className="btn-primary" onClick={onStart}>
            {t("start")}
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}

function QuestionScreen({
  q,
  answer,
  onChoice,
  onField,
  onSkip,
  onNext,
  onPrev,
  canContinue,
  isFirst,
}: {
  q: Question;
  answer?: Answer;
  onChoice: (c: "A" | "B" | "C" | "D") => void;
  onField: (v: string) => void;
  onSkip: () => void;
  onNext: () => void;
  onPrev: () => void;
  canContinue: boolean;
  isFirst: boolean;
}) {
  const t = useTranslations("parcours.questionUi");
  const [showTertiary, setShowTertiary] = useState(false);
  const isD = answer?.choice === "D";
  const baseRows = q.field.rows;
  const dynamicRows = isD ? Math.max(3, baseRows) : baseRows;

  const showField =
    q.field.level === "PRIORITAIRE" ||
    q.field.level === "SECONDAIRE" ||
    q.field.level === "SPECIAL" ||
    (q.field.level === "TERTIAIRE" && showTertiary);

  const dLabel = isD ? t("freedom") : q.field.label;

  return (
    <motion.section
      {...fadeSlide}
      className="relative flex min-h-0 items-center justify-center overflow-y-auto px-4 pb-6 pt-24 md:px-6 md:pb-8 md:pt-28 lg:overflow-hidden"
      style={{ height: "100svh" }}
    >
      <div className="grid min-h-full w-full max-w-[1180px] grid-rows-[auto_1fr] gap-4 py-4 md:h-full md:min-h-0 md:grid-cols-[0.86fr_1.14fr] md:grid-rows-1 md:gap-6 md:py-0 lg:max-h-[760px] lg:gap-10">
        <div className="flex min-h-0 flex-col justify-center gap-3 text-left md:overflow-hidden lg:gap-5 lg:pr-4">
          <div style={{ color: "var(--or-pale)", fontSize: 18, letterSpacing: "0.3em" }}>✦</div>
          <div className="flex flex-wrap items-center gap-3">
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "#888",
                letterSpacing: "0.18em",
              }}
            >
              {t("count", { current: q.n, total: 10 })}
            </p>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "rgba(237,217,154,0.72)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {q.n <= 4 ? t("opening") : t("composition")}
            </span>
          </div>
          {q.note && (
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#888" }}>{q.note}</p>
          )}
          {q.griot && (
            <p className="quote-italic text-[15px] leading-relaxed md:text-[18px]">✦ {q.griot}</p>
          )}
          <div className="section-divider" style={{ margin: "4px 0" }} />
          <h1
            className="h-display text-[25px] leading-tight md:text-[36px] lg:text-[42px]"
            style={{ color: "var(--ivoire)" }}
          >
            {q.question}
          </h1>
        </div>

        <div className="flex min-h-0 flex-col justify-center gap-3 md:overflow-hidden">
          <div className="grid min-h-0 gap-2 md:gap-3 md:overflow-y-auto md:pr-1">
            {q.choices.map((c) => {
              const selected = answer?.choice === c.letter;
              return (
                <button
                  key={c.letter}
                  onClick={() => onChoice(c.letter)}
                  className="text-left flex items-start gap-3 md:gap-4"
                  style={{
                    background: selected ? "#2D2D1A" : "#1A1A2E",
                    borderRadius: 8,
                    padding: "clamp(10px, 1.7vh, 16px) clamp(14px, 2vw, 20px)",
                    border: `1px solid ${selected ? "#C9A84C" : "rgba(201,168,76,0.25)"}`,
                    boxShadow: selected ? "0 0 16px rgba(201,168,76,0.15)" : "none",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    color: "var(--ivoire)",
                  }}
                  onMouseEnter={(e) => {
                    if (selected) return;
                    e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)";
                    e.currentTarget.style.background = "#1F1F35";
                  }}
                  onMouseLeave={(e) => {
                    if (selected) return;
                    e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)";
                    e.currentTarget.style.background = "#1A1A2E";
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 20,
                      color: "var(--or-ancestral)",
                      lineHeight: 1,
                    }}
                  >
                    {c.letter}
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.45 }}>
                    {c.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Free field */}
          {q.field.level === "TERTIAIRE" && !showTertiary && (
            <button
              onClick={() => setShowTertiary(true)}
              className="self-start"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: "var(--or-ancestral)",
                textDecoration: "underline",
                textUnderlineOffset: 4,
                cursor: "pointer",
                background: "none",
                border: "none",
              }}
            >
              {q.field.label}
            </button>
          )}

          {showField && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.4 }}
              className="w-full text-left"
            >
              <label
                className="mb-2 block"
                style={
                  q.field.level === "PRIORITAIRE" || isD || q.field.level === "SPECIAL"
                    ? {
                        fontFamily: "var(--font-display)",
                        fontSize: 15,
                        color: "var(--or-pale)",
                      }
                    : { fontFamily: "var(--font-sans)", fontSize: 13, color: "#888" }
                }
              >
                {dLabel}
              </label>
              <textarea
                value={answer?.field ?? ""}
                onChange={(e) => onField(e.target.value)}
                placeholder={q.field.placeholder}
                rows={dynamicRows}
                style={{
                  background: "#1A1A2E",
                  border: "1px solid #2D2D1A",
                  borderRadius: 6,
                  padding: "10px 14px",
                  color: "var(--ivoire)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  lineHeight: 1.45,
                  width: "100%",
                  maxHeight: 112,
                  resize: "none",
                  transition: "border-color 0.3s ease, height 0.4s ease",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2D2D1A")}
              />
            </motion.div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            {!isFirst ? (
              <button
                onClick={onPrev}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "#888",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t("previous")}
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-3">
              {q.canSkip && (
                <button
                  onClick={() => {
                    onSkip();
                    onNext();
                  }}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    color: "#888",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {t("skip")}
                </button>
              )}
              <button
                onClick={onNext}
                disabled={!canContinue}
                className="btn-primary"
                style={{
                  padding: "13px 26px",
                  opacity: canContinue ? 1 : 0.4,
                  cursor: canContinue ? "pointer" : "not-allowed",
                }}
              >
                {t("continue")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function AccountScreen({
  account,
  onChange,
  onBack,
  onContinue,
}: {
  account: AccountDraft;
  onChange: (account: AccountDraft) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const t = useTranslations("parcours.account");
  const emailIsValid = /^\S+@\S+\.\S+$/.test(account.email.trim());
  const canContinue = account.prenom.trim().length >= 2 && emailIsValid;

  return (
    <motion.section
      {...fadeSlide}
      className="relative flex min-h-0 items-center justify-center overflow-hidden px-5 pb-8 pt-28 md:px-10"
      style={{ height: "100svh" }}
    >
      <div className="grid h-full min-h-0 w-full max-w-5xl items-center gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex min-h-0 flex-col justify-center gap-5 text-left">
          <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
            {t("eyebrow")}
          </p>
          <h2 className="h-display text-[32px] md:text-[50px]" style={{ color: "var(--ivoire)" }}>
            {t("title")}
          </h2>
          <p className="body-copy max-w-xl" style={{ color: "rgba(254,252,240,0.78)" }}>
            {t("body")}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(t.raw("checks") as string[]).map((item) => (
              <div
                key={item}
                className="rounded-md border px-4 py-3"
                style={{
                  borderColor: "rgba(201,168,76,0.25)",
                  background: "rgba(26,26,46,0.72)",
                }}
              >
                <p className="caption" style={{ color: "rgba(254,252,240,0.72)" }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex flex-col gap-5 rounded-lg border p-5 md:p-8"
          style={{
            background: "rgba(26,26,46,0.86)",
            borderColor: "rgba(201,168,76,0.35)",
          }}
        >
          <div>
            <p className="eyebrow" style={{ color: "rgba(237,217,154,0.8)" }}>
              {t("formEyebrow")}
            </p>
            <h3 className="h-display mt-2 text-[28px]" style={{ color: "var(--or-ancestral)" }}>
              {t("formTitle")}
            </h3>
          </div>

          <label className="flex flex-col gap-2">
            <span className="caption" style={{ color: "rgba(254,252,240,0.72)" }}>
              {t("firstName")}
            </span>
            <input
              value={account.prenom}
              onChange={(event) => onChange({ ...account, prenom: event.target.value })}
              className="form-input"
              placeholder={t("firstNamePlaceholder")}
              autoComplete="given-name"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="caption" style={{ color: "rgba(254,252,240,0.72)" }}>
              {t("email")}
            </span>
            <input
              value={account.email}
              onChange={(event) => onChange({ ...account, email: event.target.value })}
              className="form-input"
              placeholder={t("emailPlaceholder")}
              type="email"
              autoComplete="email"
            />
          </label>

          <p className="caption" style={{ color: "rgba(254,252,240,0.58)" }}>
            {t("note")}
          </p>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={onBack}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: "#888",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {t("back")}
            </button>
            <button
              className="btn-primary"
              disabled={!canContinue}
              onClick={onContinue}
              style={{
                opacity: canContinue ? 1 : 0.4,
                cursor: canContinue ? "pointer" : "not-allowed",
              }}
            >
              {t("continue")}
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function PaywallTransition() {
  const t = useTranslations("parcours.paywallTransition");
  return (
    <motion.section
      {...fadeSlide}
      className="relative flex min-h-0 items-center justify-center overflow-hidden px-5 pt-24 text-center"
      style={{ height: "100svh" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(201,168,76,0.25), transparent 60%)",
        }}
      />
      <div className="relative max-w-[560px] flex flex-col gap-4">
        <p className="quote-italic" style={{ fontSize: 22 }}>
          {t("title")}
        </p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "rgba(254,252,240,0.7)" }}>
          {t("body")}
        </p>
      </div>
    </motion.section>
  );
}

const offers = [
  {
    id: "origine",
    name: "TOTEM ORIGINE",
    amountCents: 4900,
    price: "49€",
    sub: "L'expérience essentielle.",
    bestFor: "Premier voyage",
    delivery: "15 min",
    includes: "3 pièces",
    features: [
      "Le Parchemin narratif (PDF)",
      "L'Œuvre visuelle (PNG haute résolution)",
      "Le Certificat d'authenticité numéroté",
      "Livraison sous 15 minutes par email",
    ],
    cta: "Choisir · 49€",
    featured: false,
  },
  {
    id: "ancestral",
    name: "TOTEM ANCESTRAL",
    amountCents: 8900,
    price: "89€",
    sub: "L'expérience complète.",
    bestFor: "Coffret complet",
    delivery: "15 min",
    includes: "4 pièces",
    features: [
      "Le Parchemin narratif (PDF)",
      "L'Œuvre visuelle (PNG haute résolution)",
      "La Voix de l'ancêtre imaginaire (MP3, 90s)",
      "Le Certificat d'authenticité numéroté",
      "Livraison sous 15 minutes par email",
    ],
    cta: "Choisir · 89€",
    featured: true,
  },
  {
    id: "famille",
    name: "TOTEM FAMILLE",
    amountCents: 19900,
    price: "199€",
    sub: "L'expérience à partager.",
    bestFor: "Trois destinataires",
    delivery: "30 min",
    includes: "3 coffrets",
    features: [
      "Trois œuvres TOTEM ANCESTRAL complètes",
      "Trois destinataires au choix",
      "Trois certificats d'authenticité distincts",
      "Livraison sous 30 minutes",
    ],
    cta: "Choisir · 199€",
    featured: false,
  },
] satisfies Offer[];

function Paywall({
  onChoose,
  loadingOffer,
  checkoutError,
}: {
  onChoose: (offer: Offer) => void;
  loadingOffer: OfferId | null;
  checkoutError: string | null;
}) {
  const t = useTranslations("parcours.paywall");
  const translatedOffers = (
    (t.raw("offers") as Array<Omit<Offer, "id" | "amountCents">>) || offers
  ).map((offer, index) => ({ ...(offers[index] ?? offers[1]), ...offer }) as Offer);

  return (
    <motion.section
      {...fadeSlide}
      data-paywall-scroll
      className="relative h-[100svh] overflow-y-auto overflow-x-hidden px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-24 md:px-6 md:pb-10 lg:flex lg:items-center lg:pb-12"
      style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-8 pt-2 md:gap-5 md:py-4 lg:min-h-full lg:justify-center lg:py-0">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 text-center md:gap-3">
          <h2
            className="h-display text-[26px] leading-tight md:text-[42px]"
            style={{ color: "var(--or-ancestral)" }}
          >
            {t("title")}
          </h2>
          <p className="quote-italic max-w-3xl text-[15px] leading-relaxed md:text-[20px]">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6">
          {translatedOffers.map((o) => (
            <div
              key={o.name}
              className={`card-totem flex flex-col !p-4 md:!p-5 lg:!p-6 ${o.featured ? "md:col-span-2 lg:col-span-1 lg:-translate-y-2" : ""}`}
              style={{
                borderColor: o.featured ? "#C9A84C" : "rgba(201,168,76,0.35)",
                borderWidth: o.featured ? 2 : 1,
                position: "relative",
              }}
            >
              {o.featured && (
                <div className="mb-3 flex justify-center">
                  <span
                    className="inline-flex max-w-full items-center justify-center text-center uppercase"
                    style={{
                      background: "#C9A84C",
                      color: "#1A1A2E",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 700,
                      fontSize: 10,
                      padding: "5px 10px",
                      letterSpacing: "0.12em",
                      borderRadius: 2,
                      lineHeight: 1.25,
                    }}
                  >
                    {t("badge")}
                  </span>
                </div>
              )}
              <h3
                className="h-display text-center uppercase text-[18px] leading-tight md:text-[20px]"
                style={{ color: "var(--ivoire)", letterSpacing: "0.08em" }}
              >
                {o.name}
              </h3>
              <div
                className="h-display mt-2 text-center text-[32px] leading-none md:mt-3 md:text-[46px]"
                style={{ color: o.featured ? "var(--or-ancestral)" : "var(--ivoire)" }}
              >
                {o.price}
              </div>
              <p className="quote-italic mt-1 text-center text-[13px] leading-relaxed md:text-[15px]">
                {o.sub}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-center md:mt-4 md:gap-2">
                {[
                  [t("labels.usage"), o.bestFor],
                  [t("labels.content"), o.includes],
                  [t("labels.delivery"), o.delivery],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded border px-1.5 py-1.5 md:px-2 md:py-2"
                    style={{
                      borderColor: "rgba(201,168,76,0.22)",
                      background: "rgba(13,13,26,0.34)",
                    }}
                  >
                    <p
                      className="caption uppercase"
                      style={{ color: "rgba(237,217,154,0.58)", fontSize: 8 }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        color: "var(--ivoire)",
                        fontFamily: "var(--font-sans)",
                        fontSize: 10,
                        lineHeight: 1.25,
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <ul className="my-3 flex flex-1 flex-col gap-1.5 md:my-5 md:gap-2">
                {o.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 md:gap-3"
                    style={{ color: "var(--ivoire)", fontSize: 12, lineHeight: 1.35 }}
                  >
                    <Check size={15} color="var(--or-ancestral)" className="mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={o.featured ? "btn-primary w-full" : "btn-secondary w-full"}
                onClick={() => onChoose(o)}
                disabled={loadingOffer !== null}
                style={{ padding: "11px 12px", fontSize: 11 }}
              >
                {loadingOffer === o.id ? "..." : o.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="relative z-10 mx-auto mt-3 flex max-w-3xl flex-col gap-2 pb-2 text-center md:mt-5">
          {checkoutError && (
            <p className="caption leading-relaxed" style={{ color: "#E07A6B" }}>
              {checkoutError}
            </p>
          )}
          <p className="caption leading-relaxed">{t("security")}</p>
          <p className="quote-italic" style={{ fontSize: 14 }}>
            {t("saved")}
          </p>
        </div>
      </div>
    </motion.section>
  );
}

function PostPayment({ onContinue }: { onContinue: () => void }) {
  const t = useTranslations("parcours.postPayment");
  return (
    <motion.section
      {...fadeSlide}
      className="relative flex min-h-0 items-center justify-center overflow-hidden px-5 pt-24 text-center"
      style={{ height: "100svh" }}
    >
      <div className="max-w-[560px] flex flex-col items-center gap-6">
        <p className="h-display" style={{ fontSize: 26, color: "var(--ivoire)" }}>
          {t("title")}
        </p>
        <p className="quote-italic" style={{ fontSize: 18 }}>
          {t("body")}
        </p>
        <button className="btn-primary" onClick={onContinue}>
          {t("continue")}
        </button>
      </div>
    </motion.section>
  );
}

function FinalTransition() {
  const t = useTranslations("parcours.finalTransition");
  const lines = t.raw("lines") as string[];
  return (
    <motion.section
      {...fadeSlide}
      className="relative flex min-h-0 items-center justify-center overflow-hidden px-5 pt-24 text-center"
      style={{ height: "100svh" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.4] }}
        transition={{ duration: 3 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(201,168,76,0.35), transparent 65%)",
        }}
      />
      <div className="relative flex max-w-[720px] flex-col items-center gap-6">
        {lines.map((line, i) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.65, duration: 0.9 }}
            className="h-display"
            style={{
              fontSize: i === 2 ? 32 : 24,
              color: i === 2 ? "var(--or-ancestral)" : "var(--ivoire)",
            }}
          >
            {line}
          </motion.p>
        ))}
        <p className="quote-italic" style={{ fontSize: 16 }}>
          {t("born")}
        </p>
      </div>
    </motion.section>
  );
}
function WaitingScreen() {
  const t = useTranslations("parcours.waiting");
  const rotating = t.raw("rotating") as string[];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setIdx((x) => (x + 1) % rotating.length), 6000);
    return () => clearInterval(i);
  }, [rotating.length]);
  return (
    <motion.section
      {...fadeSlide}
      className="relative flex min-h-0 items-center justify-center overflow-hidden px-5 pt-24 text-center"
      style={{ height: "100svh" }}
    >
      <div className="max-w-[560px] flex flex-col items-center gap-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" as const }}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "1px solid rgba(201,168,76,0.3)",
            borderTopColor: "var(--or-ancestral)",
          }}
        />
        <h2 className="h-display" style={{ fontSize: 32, color: "var(--or-ancestral)" }}>
          {t("title")}
        </h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="quote-italic"
            style={{ fontSize: 18, minHeight: 28 }}
          >
            {rotating[idx]}
          </motion.p>
        </AnimatePresence>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            color: "rgba(254,252,240,0.7)",
            lineHeight: 1.7,
          }}
        >
          {t("body")}
        </p>
      </div>
    </motion.section>
  );
}

function toLocale(locale: string): "fr" | "en" {
  return locale === "en" ? "en" : "fr";
}

function writePendingCheckout(value: { offerId: OfferId; amountCents: number }) {
  try {
    window.localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(value));
  } catch {
    /* ignore local test storage errors */
  }
}

function readPendingCheckout(): { offerId: OfferId; amountCents: number } | null {
  try {
    const raw = window.localStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as { offerId?: OfferId; amountCents?: number };
    if (!value.offerId || typeof value.amountCents !== "number") return null;
    return { offerId: value.offerId, amountCents: value.amountCents };
  } catch {
    return null;
  }
}

function clearPendingCheckout() {
  try {
    window.localStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    /* ignore local test storage errors */
  }
}
