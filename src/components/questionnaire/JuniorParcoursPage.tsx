"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  Bird,
  CreditCard,
  Facebook,
  Flame,
  Footprints,
  Loader,
  MessageCircle,
  Mountain,
  Shield,
  Sparkles,
  Trees,
  Waves,
  Zap,
} from "lucide-react";
import { GoldParticles } from "@/components/GoldParticles";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { authPath } from "@/lib/routes";
import { QuestionAudio } from "./QuestionAudio";
import { questionAudioFallbackSrc, questionAudioSrc } from "@/lib/question-audio";
import { type Gender } from "./GenderModal";
import {
  clearParcoursDraft,
  fetchParcoursDrafts,
  saveParcoursDraft,
} from "@/lib/parcours-draft";
import {
  juniorShareText,
  renderJuniorShareCard,
  type JuniorCardInput,
} from "@/lib/junior-share-card";
import { Copy, Instagram, Linkedin, Music2 } from "lucide-react";

type Locale = "fr" | "en";
type ChoiceLetter = "A" | "B" | "C" | "D";
type JuniorAnswer = { choice: ChoiceLetter };

type JuniorResult = {
  orderNumber: number;
  firstName: string;
  scores: Record<"F" | "E" | "T" | "A", number>;
  dominant: "F" | "E" | "T" | "A";
  secondary: "F" | "E" | "T" | "A";
  totem: {
    name: string;
    animal: string;
    colors: string[];
    quality: string;
  };
  nomComplet: string;
  phrase: string;
  attribut: string;
  messageClan: string;
  share: {
    caption: string;
    messageDefi: string;
  };
  imageUrl?: string;
};

type Question = {
  title: string;
  subtitle: string;
  choices: {
    letter: ChoiceLetter;
    label: string;
    signal: string;
    icon: typeof Flame;
  }[];
};

const copy = {
  fr: {
    eyebrow: "TOTEM JUNIOR",
    title: "Découvre ton totem en cinq choix.",
    firstName: "Prénom optionnel",
    start: "Commencer",
    next: "Suivant",
    back: "Retour",
    reveal: "Révéler mon Totem",
    loading: "Le griot compose ton signe…",
    retry: "Recommencer",
    share: "Texte de partage",
    challenge: "Défi a envoyer",
    clan: "Clan",
    quality: "Qualité",
    error: "Impossible de révéler le totem Junior pour le moment.",
    listen: "Écouter la question",
    playing: "Lecture en cours",
    replay: "Réécouter",
    audioHint: "La question se joue automatiquement, appuie pour réécouter.",
    questions: [
      {
        title: "Quand tu entres quelque part, tu es plutôt...",
        subtitle: "L'énergie que les autres sentent en premier.",
        choices: [
          { letter: "A", label: "Une flamme qui s'impose", signal: "Dominant / Chef", icon: Flame },
          {
            letter: "B",
            label: "Une vague qui s'adapte",
            signal: "Fluide / Intuitif",
            icon: Waves,
          },
          {
            letter: "C",
            label: "Une ombre qui observe",
            signal: "Stratégie / Discrétion",
            icon: Footprints,
          },
          {
            letter: "D",
            label: "Un eclair qui surprend",
            signal: "Libre / Imprévisible",
            icon: Zap,
          },
        ],
      },
      {
        title: "Ton endroit de puissance, c'est...",
        subtitle: "Le territoire où tu retrouves ta force.",
        choices: [
          { letter: "A", label: "La forêt profonde", signal: "Ancrage / Patience", icon: Trees },
          {
            letter: "B",
            label: "Le sommet d'une montagne",
            signal: "Vision / Solitude",
            icon: Mountain,
          },
          { letter: "C", label: "L'océan sans fond", signal: "Mystère / Profondeur", icon: Waves },
          {
            letter: "D",
            label: "La savane à l'aube",
            signal: "Liberté / Mouvement",
            icon: Sparkles,
          },
        ],
      },
      {
        title: "Sans même y penser, tu sais...",
        subtitle: "Le don qui agit avant les mots.",
        choices: [
          { letter: "A", label: "Lire les gens", signal: "Intuition", icon: Sparkles },
          { letter: "B", label: "Protéger ceux que tu aimes", signal: "Gardien", icon: Shield },
          { letter: "C", label: "Trouver un chemin", signal: "Explorateur", icon: Footprints },
          { letter: "D", label: "Faire bouger les autres", signal: "Meneur", icon: Flame },
        ],
      },
      {
        title: "Ce que les autres ne voient pas en toi...",
        subtitle: "La part cachée qui pèse ou qui protege.",
        choices: [
          {
            letter: "A",
            label: "Tu gardes tout à l'intérieur",
            signal: "Profondeur cachée",
            icon: Waves,
          },
          { letter: "B", label: "Tu te bats seul", signal: "Fierté", icon: Shield },
          { letter: "C", label: "Tu t'adaptes aux gens", signal: "Adaptation", icon: Sparkles },
          { letter: "D", label: "Tu ressens tout trop fort", signal: "Intensité", icon: Flame },
        ],
      },
      {
        title: "La nuit, ce qui te traverse...",
        subtitle: "L'appel que tu reconnais sans l'expliquer.",
        choices: [
          {
            letter: "A",
            label: "Voler au-dessus de tout",
            signal: "Aigle / Élévation",
            icon: Bird,
          },
          {
            letter: "B",
            label: "Chasser ce que tu veux",
            signal: "Leopard / Précision",
            icon: Zap,
          },
          {
            letter: "C",
            label: "Tenir quelque chose debout",
            signal: "Elephant / Mémoire",
            icon: Shield,
          },
          {
            letter: "D",
            label: "Comprendre l'invisible",
            signal: "Serpent / Sagesse",
            icon: Sparkles,
          },
        ],
      },
    ],
  },
  en: {
    eyebrow: "TOTEM JUNIOR",
    title: "Discover your totem in five choices.",
    firstName: "Optional first name",
    start: "Start",
    next: "Next",
    back: "Back",
    reveal: "Reveal my Totem",
    loading: "The griot is composing your sign...",
    retry: "Start over",
    share: "Share caption",
    challenge: "Challenge message",
    clan: "Clan",
    quality: "Quality",
    error: "The Junior totem cannot be revealed right now.",
    listen: "Listen to the question",
    playing: "Playing",
    replay: "Replay",
    audioHint: "The question plays automatically, tap to replay.",
    questions: [
      {
        title: "When you enter a place, you are more like...",
        subtitle: "The energy others feel first.",
        choices: [
          { letter: "A", label: "A flame that takes space", signal: "Leader / Force", icon: Flame },
          { letter: "B", label: "A wave that adapts", signal: "Fluid / Intuitive", icon: Waves },
          {
            letter: "C",
            label: "A shadow that observes",
            signal: "Strategy / Discretion",
            icon: Footprints,
          },
          {
            letter: "D",
            label: "Lightning that surprises",
            signal: "Free / Unpredictable",
            icon: Zap,
          },
        ],
      },
      {
        title: "Your place of power is...",
        subtitle: "The territory where your strength returns.",
        choices: [
          { letter: "A", label: "The deep forest", signal: "Grounding / Patience", icon: Trees },
          { letter: "B", label: "A mountain summit", signal: "Vision / Solitude", icon: Mountain },
          { letter: "C", label: "The bottomless ocean", signal: "Mystery / Depth", icon: Waves },
          { letter: "D", label: "The savanna at dawn", signal: "Freedom / Motion", icon: Sparkles },
        ],
      },
      {
        title: "Without thinking, you know how to...",
        subtitle: "The gift that acts before words.",
        choices: [
          { letter: "A", label: "Read people", signal: "Intuition", icon: Sparkles },
          { letter: "B", label: "Protect those you love", signal: "Guardian", icon: Shield },
          { letter: "C", label: "Find a path", signal: "Explorer", icon: Footprints },
          { letter: "D", label: "Move others", signal: "Leader", icon: Flame },
        ],
      },
      {
        title: "What others do not see in you...",
        subtitle: "The hidden part that weighs or protects.",
        choices: [
          { letter: "A", label: "You keep everything inside", signal: "Hidden depth", icon: Waves },
          { letter: "B", label: "You fight alone", signal: "Pride", icon: Shield },
          { letter: "C", label: "You adapt to people", signal: "Adaptation", icon: Sparkles },
          { letter: "D", label: "You feel everything strongly", signal: "Intensity", icon: Flame },
        ],
      },
      {
        title: "At night, what crosses you...",
        subtitle: "The call you recognize without explaining it.",
        choices: [
          {
            letter: "A",
            label: "Flying above everything",
            signal: "Eagle / Elevation",
            icon: Bird,
          },
          { letter: "B", label: "Hunting what you want", signal: "Leopard / Precision", icon: Zap },
          {
            letter: "C",
            label: "Holding something upright",
            signal: "Elephant / Memory",
            icon: Shield,
          },
          {
            letter: "D",
            label: "Understanding the unseen",
            signal: "Serpent / Wisdom",
            icon: Sparkles,
          },
        ],
      },
    ],
  },
} satisfies Record<Locale, Record<string, unknown> & { questions: Question[] }>;

function toLocale(value: string): Locale {
  return value === "en" ? "en" : "fr";
}

export function JuniorParcoursPage() {
  const locale = toLocale(useLocale());
  const t = copy[locale];
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useSupabaseSession();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  // Le sexe est declare a la creation du compte et reglable dans le profil :
  // le questionnaire ne l'interrompt plus. On le garde pour les brouillons
  // enregistres avant ce changement.
  const [gender, setGender] = useState<Gender | null>(null);
  const [firstName, setFirstName] = useState("");
  const [answers, setAnswers] = useState<Record<number, JuniorAnswer>>({});
  const [result, setResult] = useState<JuniorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // Carte de partage composee dans le navigateur, puis stockee avec l'oeuvre.
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  // Sauvegarde serveur du parcours, pour reprendre depuis un autre appareil.
  const [draftSyncReady, setDraftSyncReady] = useState(false);
  const draftRestoredRef = useRef(false);
  const draftClearedRef = useRef(false);

  // Meme retrait de la nappe musicale que sur le parcours adulte.
  useEffect(() => {
    window.dispatchEvent(new Event("totem:ambient-lower"));
    return () => {
      window.dispatchEvent(new Event("totem:ambient-restore"));
    };
  }, []);

  const restart = () => {
    sessionStorage.removeItem("junior_reveal");
    sessionStorage.removeItem("junior_checkout_session");
    sessionStorage.removeItem("junior_answers");
    sessionStorage.removeItem("junior_firstName");
    sessionStorage.removeItem("junior_locale");
    if (session?.access_token) {
      // On bloque la sauvegarde le temps que l'effacement arrive au serveur,
      // sinon la progression remise a zero repartirait aussitot.
      draftClearedRef.current = true;
      void clearParcoursDraft(session.access_token, "junior").finally(() => {
        draftClearedRef.current = false;
      });
    }
    setStarted(false);
    setIndex(0);
    setFirstName("");
    setAnswers({});
    setResult(null);
    setLoading(false);
    setError(null);
    setSaved(false);
  };

  const current = t.questions[index];
  const progress = started ? ((index + 1) / t.questions.length) * 100 : 0;
  const canContinue = Boolean(answers[index + 1]);

  const apiAnswers = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(answers).map(([key, value]) => [key, { choice: value.choice }]),
      ),
    [answers],
  );

  async function startCheckout() {
    if (!session?.access_token) {
      router.push(
        `${authPath(locale, "signup", `/${locale}/iuvenis_signum`)}&role=junior`,
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/iuvenis_signum/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ firstName, answers: apiAnswers, sexe: gender, locale }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.error || t.error);
      }

      sessionStorage.setItem("junior_checkout_session", payload.checkoutSessionId);
      sessionStorage.setItem("junior_answers", JSON.stringify(apiAnswers));
      sessionStorage.setItem("junior_firstName", firstName);
      sessionStorage.setItem("junior_locale", locale);

      window.location.href = payload.checkoutUrl;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t.error);
    } finally {
      setLoading(false);
    }
  }

  const checkoutSuccess = searchParams.get("checkout");
  const checkoutSessionId = searchParams.get("session_id");

  const restorePaidReveal = useCallback(async () => {
    if (result || !session?.access_token || !checkoutSessionId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/iuvenis_signum/result?session_id=${encodeURIComponent(checkoutSessionId)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.reveal) {
        throw new Error(payload?.error || t.error);
      }
      setResult(payload.reveal as JuniorResult);
      sessionStorage.removeItem("junior_reveal");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t.error);
    } finally {
      setLoading(false);
    }
  }, [checkoutSessionId, result, session?.access_token, t.error]);

  useEffect(() => {
    if (checkoutSuccess === "success" && checkoutSessionId) {
      void restorePaidReveal();
    }
  }, [checkoutSessionId, checkoutSuccess, restorePaidReveal]);

  // Reprise du parcours junior : on rouvre le questionnaire la ou l'enfant
  // s'etait arrete, meme depuis un autre appareil.
  useEffect(() => {
    if (!session?.access_token || draftRestoredRef.current) return;
    draftRestoredRef.current = true;

    let cancelled = false;
    fetchParcoursDrafts(session.access_token)
      .then((drafts) => {
        const draft = drafts.junior;
        if (cancelled || !draft || result) return;
        setAnswers(draft.answers as Record<number, JuniorAnswer>);
        if (draft.sexe) setGender(draft.sexe);
        if (draft.prenom) setFirstName(draft.prenom);
        setIndex(Math.min(draft.index, t.questions.length - 1));
        setStarted(true);
      })
      .finally(() => {
        if (!cancelled) setDraftSyncReady(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Sauvegarde temporisee de la progression.
  useEffect(() => {
    if (!session?.access_token || !draftSyncReady || draftClearedRef.current) return;
    if (result || Object.keys(answers).length === 0) return;

    const token = session.access_token;
    const timer = setTimeout(() => {
      void saveParcoursDraft(token, "junior", locale, {
        index,
        phase: "question",
        answers: answers as Record<string, unknown>,
        sexe: gender,
        prenom: firstName || undefined,
        questionNumber: index + 1,
        totalQuestions: t.questions.length,
        updatedAt: new Date().toISOString(),
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    answers,
    draftSyncReady,
    firstName,
    gender,
    index,
    locale,
    result,
    session,
    t.questions.length,
  ]);

  // Totem revele : le brouillon laisse la place a l'oeuvre.
  useEffect(() => {
    if (!result || !session?.access_token || draftClearedRef.current) return;
    draftClearedRef.current = true;
    void clearParcoursDraft(session.access_token, "junior");
  }, [result, session]);

  // Composition d'une carte de partage locale, sans la confondre avec
  // l'image du totem generee et stockee par le backend.
  useEffect(() => {
    if (!result || cardDataUrl) return;
    let alive = true;
    renderJuniorShareCard(cardInput(result, locale))
      .then((blob) => {
        if (!alive) return;
        setCardUrl(URL.createObjectURL(blob));
        const reader = new FileReader();
        reader.onloadend = () => {
          if (alive && typeof reader.result === "string") setCardDataUrl(reader.result);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
      });
    return () => {
      alive = false;
    };
  }, [result, cardDataUrl, locale]);

  useEffect(() => {
    if (result) setSaved(true);
  }, [result]);

  if (result) {
    const shareUrl = "https://totem-ancestral.com";
    const shareText = juniorShareText(cardInput(result, locale));
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    const facebookUrl = `https://facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}&u=${encodeURIComponent(shareUrl)}`;

    return (
      <main className="premium-page min-h-screen overflow-x-hidden overflow-y-auto px-5 pb-[max(4rem,env(safe-area-inset-bottom))] pt-28 md:px-8">
        <GoldParticles count={20} />
        <section className="relative z-10 mx-auto grid max-w-[1120px] gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border p-6" style={{ borderColor: "rgba(216,173,77,0.24)" }}>
            <p
              className="subtext mb-3 text-[12px] uppercase"
              style={{ color: "var(--or-ancestral)" }}
            >
              #{String(result.orderNumber).padStart(6, "0")}
            </p>
            <h1
              className="text-[42px] uppercase leading-none md:text-[62px]"
              style={{ color: "var(--or-pale)", fontFamily: "var(--font-display)" }}
            >
              {result.totem.name}
            </h1>
            {result.imageUrl && (
              <div className="mt-6 flex justify-center">
                <img
                  src={result.imageUrl}
                  alt={result.totem.name}
                  className="w-full max-w-[300px] rounded-sm object-cover"
                  style={{ border: "1px solid rgba(216,173,77,0.24)" }}
                />
              </div>
            )}
            <p className="mt-5 text-lg" style={{ color: "rgba(245,240,232,0.86)" }}>
              {result.phrase}
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-3">
              <ResultStat label={t.quality as string} value={result.totem.quality} />
              <ResultStat label="Attribut" value={result.attribut} />
              <ResultStat label="Animal" value={result.totem.animal} />
            </dl>
            <JuniorShareBlock
              locale={locale}
              cardUrl={cardUrl}
              shareText={shareText}
              linkedinUrl={linkedinUrl}
              whatsappUrl={whatsappUrl}
              facebookUrl={facebookUrl}
            />
            <button
              type="button"
              className="btn-secondary mt-6"
              onClick={restart}
            >
              {t.retry as string}
            </button>
            {saved && (
              <p className="mt-4 text-sm" style={{ color: "var(--or-ancestral)" }}>
                Enregistré dans{" "}
                <Link
                  href={`/${locale}/domus_animi`}
                  className="underline"
                  style={{ color: "var(--or-ancestral)" }}
                >
                  mon espace
                </Link>
              </p>
            )}
          </div>

          <div className="grid gap-4">
            <ResultBlock title={t.clan as string} body={result.messageClan} />
            <ResultBlock title={t.share as string} body={result.share.caption} />
            <ResultBlock title={t.challenge as string} body={result.share.messageDefi} />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page min-h-screen overflow-x-hidden overflow-y-auto px-5 pb-[max(4rem,env(safe-area-inset-bottom))] pt-28 md:px-8">
      <GoldParticles count={24} />
      <section className="relative z-10 mx-auto max-w-[1120px]">
        <div
          className="mb-8 h-[5px] overflow-hidden rounded-full"
          style={{ background: "rgba(30,31,40,0.9)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--or-ancestral), var(--or-pale))",
              boxShadow: "0 0 12px rgba(216,173,77,0.6)",
            }}
          />
        </div>

        {!started ? (
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <div>
              <p
                className="subtext mb-4 text-[12px] uppercase"
                style={{ color: "var(--or-ancestral)" }}
              >
                {t.eyebrow as string}
              </p>
              <h1
                className="text-[48px] uppercase leading-none md:text-[78px]"
                style={{ color: "var(--or-pale)", fontFamily: "var(--font-display)" }}
              >
                {t.title as string}
              </h1>
            </div>
            <div className="border p-5" style={{ borderColor: "rgba(216,173,77,0.22)" }}>
              <label
                className="subtext text-[11px] uppercase"
                style={{ color: "rgba(245,240,232,0.72)" }}
              >
                {t.firstName as string}
              </label>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                maxLength={40}
                className="mt-3 w-full border bg-transparent px-4 py-3 text-base outline-none"
                style={{ borderColor: "rgba(216,173,77,0.28)", color: "var(--ivoire)" }}
              />
              <button
                type="button"
                className="btn-primary mt-5 w-full"
                onClick={() => setStarted(true)}
              >
                {t.start as string}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="premium-panel mb-8 grid gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:items-center md:p-8">
              <div>
                <p
                  className="subtext mb-3 text-[12px] uppercase"
                  style={{ color: "var(--or-ancestral)" }}
                >
                  {t.eyebrow as string} · {index + 1}/5
                </p>
                <h1
                  className="max-w-[760px] text-[32px] uppercase leading-[0.95] md:text-[52px]"
                  style={{ color: "var(--or-pale)", fontFamily: "var(--font-display)" }}
                >
                  {current.title}
                </h1>
                <p className="mt-4 text-base" style={{ color: "rgba(245,240,232,0.72)" }}>
                  {current.subtitle}
                </p>
              </div>

              <QuestionAudio
                src={questionAudioSrc("junior", index + 1, locale)}
                fallbackSrc={questionAudioFallbackSrc("junior", index + 1)}
                labels={{
                  listen: t.listen as string,
                  playing: t.playing as string,
                  replay: t.replay as string,
                  hint: t.audioHint as string,
                }}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {current.choices.map((choice) => {
                const Icon = choice.icon;
                const selected = answers[index + 1]?.choice === choice.letter;
                return (
                  <button
                    key={choice.letter}
                    type="button"
                    onClick={() =>
                      setAnswers((currentAnswers) => ({
                        ...currentAnswers,
                        [index + 1]: { choice: choice.letter },
                      }))
                    }
                    className="group relative min-h-[210px] rounded-lg border p-5 text-left transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      borderColor: selected ? "var(--or-ancestral)" : "rgba(216,173,77,0.22)",
                      background: selected
                        ? "linear-gradient(180deg, rgba(216,173,77,0.16), rgba(13,13,26,0.6))"
                        : "rgba(13,13,26,0.54)",
                      boxShadow: selected
                        ? "0 0 0 1px var(--or-ancestral), 0 18px 40px -24px rgba(216,173,77,0.85)"
                        : undefined,
                    }}
                  >
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full transition-colors"
                      style={{
                        background: selected ? "var(--or-ancestral)" : "rgba(216,173,77,0.12)",
                        color: selected ? "var(--nuit-profonde)" : "var(--or-ancestral)",
                      }}
                    >
                      <Icon size={22} />
                    </span>
                    <span
                      className="mt-6 block text-[11px] uppercase tracking-[0.2em]"
                      style={{ color: "rgba(245,240,232,0.5)" }}
                    >
                      {choice.letter}
                    </span>
                    <span
                      className="mt-2 block text-lg font-medium leading-snug"
                      style={{ color: "var(--ivoire)" }}
                    >
                      {choice.label}
                    </span>
                    <span
                      className="mt-2 block text-sm"
                      style={{ color: "rgba(245,240,232,0.62)" }}
                    >
                      {choice.signal}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && (
              <p
                className="mt-5 border px-4 py-3 text-sm"
                style={{ borderColor: "#8B2000", color: "#F0DFA0" }}
              >
                {error}
              </p>
            )}

            <div className="mt-8 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIndex((currentIndex) => Math.max(0, currentIndex - 1))}
                disabled={index === 0 || loading}
              >
                <ArrowLeft size={16} />
                {t.back as string}
              </button>
              {index < t.questions.length - 1 ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIndex((currentIndex) => currentIndex + 1)}
                  disabled={!canContinue || loading}
                >
                  {t.next as string}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={startCheckout}
                    disabled={!canContinue || loading}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        {t.loading as string}
                      </>
                    ) : (
                      <>
                        {t.reveal as string}
                        <Sparkles size={16} />
                      </>
                    )}
                  </button>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs"
                    style={{ color: "rgba(245,240,232,0.55)" }}
                  >
                    <CreditCard size={13} />
                    {locale === "fr" ? "Paiement sécurisé · 9,99 €" : "Secure payment · €9.99"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

    </main>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border p-4" style={{ borderColor: "rgba(216,173,77,0.18)" }}>
      <dt className="subtext text-[10px] uppercase" style={{ color: "rgba(245,240,232,0.56)" }}>
        {label}
      </dt>
      <dd className="mt-2 text-sm" style={{ color: "var(--ivoire)" }}>
        {value}
      </dd>
    </div>
  );
}

function ResultBlock({ title, body }: { title: string; body: string }) {
  return (
    <article className="border p-5" style={{ borderColor: "rgba(216,173,77,0.22)" }}>
      <h2 className="subtext text-[11px] uppercase" style={{ color: "var(--or-ancestral)" }}>
        {title}
      </h2>
      <p className="mt-4 whitespace-pre-line text-base" style={{ color: "rgba(245,240,232,0.84)" }}>
        {body}
      </p>
    </article>
  );
}

function cardInput(result: JuniorResult, locale: Locale): JuniorCardInput {
  return {
    animal: result.totem.animal,
    totemName: result.totem.name,
    nomComplet: result.nomComplet,
    phrase: result.phrase,
    quality: result.totem.quality,
    orderNumber: result.orderNumber,
    locale,
  };
}

/**
 * Partage du totem Junior.
 *
 * TikTok et Instagram n'exposent aucun lien de partage pre-rempli depuis un
 * navigateur : pour eux, le chemin qui fonctionne est de telecharger l'image
 * et de copier le texte, puis de publier depuis l'application. LinkedIn,
 * WhatsApp et Facebook acceptent en revanche une intention web directe.
 */
function JuniorShareBlock({
  locale,
  cardUrl,
  shareText,
  linkedinUrl,
  whatsappUrl,
  facebookUrl,
}: {
  locale: Locale;
  cardUrl: string | null;
  shareText: string;
  linkedinUrl: string;
  whatsappUrl: string;
  facebookUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const isFr = locale === "fr";

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Presse-papiers refuse : le texte reste selectionnable a l'ecran.
    }
  };

  return (
    <div className="mt-6">
      {cardUrl && (
        <img
          src={cardUrl}
          alt={isFr ? "Visuel de ton totem a partager" : "Your totem visual to share"}
          className="mx-auto w-full max-w-[280px] rounded-xl border"
          style={{ borderColor: "rgba(216,173,77,0.28)" }}
        />
      )}

      <p
        className="mt-5 whitespace-pre-line rounded-lg border p-4 text-sm leading-relaxed"
        style={{ borderColor: "rgba(216,173,77,0.22)", color: "rgba(245,240,232,0.86)" }}
      >
        {shareText}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {cardUrl && (
          <a href={cardUrl} download="mon-totem.png" className="btn-primary !px-5 !py-2.5 text-xs">
            <Download size={14} />
            {isFr ? "Télécharger l'image" : "Download image"}
          </a>
        )}
        <button type="button" onClick={copyText} className="btn-secondary !px-5 !py-2.5 text-xs">
          <Copy size={14} />
          {copied
            ? isFr
              ? "Texte copie"
              : "Text copied"
            : isFr
              ? "Copier le texte"
              : "Copy text"}
        </button>
      </div>

      <p className="caption mt-5 text-xs uppercase" style={{ color: "var(--or-ancestral)" }}>
        {isFr ? "Publier sur" : "Share on"}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary px-3 py-2 text-xs"
          title="LinkedIn"
        >
          <Linkedin size={14} />
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary px-3 py-2 text-xs"
          title="WhatsApp"
        >
          <MessageCircle size={14} />
        </a>
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary px-3 py-2 text-xs"
          title="Facebook"
        >
          <Facebook size={14} />
        </a>
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary px-3 py-2 text-xs"
          title="Instagram"
        >
          <Instagram size={14} />
        </a>
        <a
          href="https://www.tiktok.com/upload"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary px-3 py-2 text-xs"
          title="TikTok"
        >
          <Music2 size={14} />
        </a>
      </div>
      <p className="mt-2 text-[11px]" style={{ color: "rgba(226,225,238,0.45)" }}>
        {isFr
          ? "Pour Instagram et TikTok : telecharge l'image et copie le texte, puis publie depuis l'application."
          : "For Instagram and TikTok: download the image and copy the text, then post from the app."}
      </p>
    </div>
  );
}
