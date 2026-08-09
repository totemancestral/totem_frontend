"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  Bird,
  CreditCard,
  Download,
  Facebook,
  Flame,
  Footprints,
  Loader,
  MessageCircle,
  Mountain,
  Share2,
  Shield,
  Sparkles,
  Trees,
  Volume2,
  Waves,
  Zap,
} from "lucide-react";
import { GoldParticles } from "@/components/GoldParticles";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { authPath } from "@/lib/routes";
import { QuestionAudio } from "./QuestionAudio";
import { questionAudioFallbackSrc, questionAudioSrc } from "@/lib/question-audio";

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
  pdfUrl?: string;
  audioUrl?: string;
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
    title: "Decouvre ton totem en cinq choix.",
    firstName: "Prenom optionnel",
    start: "Commencer",
    next: "Suivant",
    back: "Retour",
    reveal: "Reveler mon Totem",
    loading: "Le griot compose ton signe...",
    retry: "Recommencer",
    share: "Texte de partage",
    challenge: "Defi a envoyer",
    clan: "Clan",
    quality: "Qualite",
    score: "Scores FETA",
    error: "Impossible de reveler le totem Junior pour le moment.",
    listen: "Ecouter la question",
    playing: "Lecture en cours",
    replay: "Reecouter",
    audioHint: "La question se joue automatiquement — appuie pour reecouter.",
    questions: [
      {
        title: "Quand tu entres quelque part, tu es plutot...",
        subtitle: "L'energie que les autres sentent en premier.",
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
            signal: "Strategie / Discretion",
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
        subtitle: "Le territoire ou tu retrouves ta force.",
        choices: [
          { letter: "A", label: "La foret profonde", signal: "Ancrage / Patience", icon: Trees },
          {
            letter: "B",
            label: "Le sommet d'une montagne",
            signal: "Vision / Solitude",
            icon: Mountain,
          },
          { letter: "C", label: "L'ocean sans fond", signal: "Mystere / Profondeur", icon: Waves },
          {
            letter: "D",
            label: "La savane a l'aube",
            signal: "Liberte / Mouvement",
            icon: Sparkles,
          },
        ],
      },
      {
        title: "Sans meme y penser, tu sais...",
        subtitle: "Le don qui agit avant les mots.",
        choices: [
          { letter: "A", label: "Lire les gens", signal: "Intuition", icon: Sparkles },
          { letter: "B", label: "Proteger ceux que tu aimes", signal: "Gardien", icon: Shield },
          { letter: "C", label: "Trouver un chemin", signal: "Explorateur", icon: Footprints },
          { letter: "D", label: "Faire bouger les autres", signal: "Meneur", icon: Flame },
        ],
      },
      {
        title: "Ce que les autres ne voient pas en toi...",
        subtitle: "La part cachee qui pese ou qui protege.",
        choices: [
          {
            letter: "A",
            label: "Tu gardes tout a l'interieur",
            signal: "Profondeur cachee",
            icon: Waves,
          },
          { letter: "B", label: "Tu te bats seul", signal: "Fierte", icon: Shield },
          { letter: "C", label: "Tu t'adaptes aux gens", signal: "Adaptation", icon: Sparkles },
          { letter: "D", label: "Tu ressens tout trop fort", signal: "Intensite", icon: Flame },
        ],
      },
      {
        title: "La nuit, ce qui te traverse...",
        subtitle: "L'appel que tu reconnais sans l'expliquer.",
        choices: [
          {
            letter: "A",
            label: "Voler au-dessus de tout",
            signal: "Aigle / Elevation",
            icon: Bird,
          },
          {
            letter: "B",
            label: "Chasser ce que tu veux",
            signal: "Leopard / Precision",
            icon: Zap,
          },
          {
            letter: "C",
            label: "Tenir quelque chose debout",
            signal: "Elephant / Memoire",
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
    score: "FETA scores",
    error: "The Junior totem cannot be revealed right now.",
    listen: "Listen to the question",
    playing: "Playing",
    replay: "Replay",
    audioHint: "The question plays automatically — tap to replay.",
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
  const [firstName, setFirstName] = useState("");
  const [answers, setAnswers] = useState<Record<number, JuniorAnswer>>({});
  const [result, setResult] = useState<JuniorResult | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("junior_reveal");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const restart = () => {
    sessionStorage.removeItem("junior_reveal");
    sessionStorage.removeItem("junior_checkout_session");
    sessionStorage.removeItem("junior_answers");
    sessionStorage.removeItem("junior_firstName");
    sessionStorage.removeItem("junior_locale");
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
        body: JSON.stringify({ firstName, answers: apiAnswers, locale }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.error || t.error);
      }

      sessionStorage.setItem("junior_checkout_session", payload.checkoutSessionId);
      sessionStorage.setItem("junior_answers", JSON.stringify(apiAnswers));
      sessionStorage.setItem("junior_firstName", firstName);
      sessionStorage.setItem("junior_locale", locale);
      if (payload.reveal) {
        sessionStorage.setItem("junior_reveal", JSON.stringify(payload.reveal));
      }

      window.location.href = payload.checkoutUrl;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t.error);
    } finally {
      setLoading(false);
    }
  }

  const restoreResultFromCache = useCallback(() => {
    if (result) return;
    const cachedReveal = sessionStorage.getItem("junior_reveal");
    if (cachedReveal) {
      try {
        const parsed = JSON.parse(cachedReveal);
        setResult(parsed);
        sessionStorage.removeItem("junior_reveal");
      } catch {}
    }
  }, [result]);

  const checkoutSuccess = searchParams.get("checkout");
  const checkoutSessionId = searchParams.get("session_id");

  useEffect(() => {
    if (checkoutSuccess === "success" && checkoutSessionId) {
      restoreResultFromCache();
    }
  }, [checkoutSessionId, checkoutSuccess, restoreResultFromCache]);

  useEffect(() => {
    if (!result || saved || !session?.access_token) return;
    const cachedAnswers = sessionStorage.getItem("junior_answers");
    let persistedAnswers = apiAnswers;
    if (cachedAnswers) {
      try {
        persistedAnswers = JSON.parse(cachedAnswers) as typeof apiAnswers;
      } catch {
        persistedAnswers = apiAnswers;
      }
    }
    fetch("/api/iuvenis_signum/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        ...result,
        answers: persistedAnswers,
        firstName: firstName || result.firstName,
        locale,
        checkoutSessionId: sessionStorage.getItem("junior_checkout_session") || undefined,
      }),
    }).then((res) => {
      if (res.ok) setSaved(true);
    }).catch(() => {});
  }, [apiAnswers, firstName, locale, result, saved, session]);

  if (result) {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `${result.totem.name} — "${result.phrase}"`;
    const facebookUrl = `https://facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}&u=${encodeURIComponent(shareUrl)}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

    return (
      <main className="premium-page min-h-screen overflow-hidden px-5 pb-16 pt-28 md:px-8">
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
            <div className="mt-6 flex flex-wrap gap-3">
              {result.audioUrl && (
                <a href={result.audioUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">
                  <Volume2 size={14} />
                  Audio
                </a>
              )}
              {result.pdfUrl && (
                <a href={result.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">
                  <Download size={14} />
                  PDF
                </a>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="caption text-xs uppercase" style={{ color: "var(--or-ancestral)", alignSelf: "center" }}>
                Partager :
              </span>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-2 text-xs" title="Facebook">
                <Facebook size={14} />
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-2 text-xs" title="WhatsApp">
                <MessageCircle size={14} />
              </a>
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-2 text-xs" title="Twitter">
                <Share2 size={14} />
              </a>
            </div>
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
    <main className="premium-page min-h-screen overflow-hidden px-5 pb-16 pt-28 md:px-8">
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
