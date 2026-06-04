import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoldParticles } from "@/components/GoldParticles";
import { MaskLogo } from "@/components/MaskLogo";
import { Check } from "lucide-react";

export const Route = createFileRoute("/parcours")({
  head: () => ({
    meta: [
      { title: "Le Parcours du Griot — Totem Ancestral" },
      {
        name: "description",
        content:
          "Un questionnaire conversationnel en 10 questions pour composer ton œuvre ancestrale.",
      },
      { property: "og:title", content: "Le Parcours du Griot — Totem Ancestral" },
      {
        property: "og:description",
        content: "10 questions. Une vérité. Ton totem.",
      },
    ],
  }),
  component: ParcoursPage,
});

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
      { letter: "A", text: "Le feu qui danse dans la nuit — je suis attiré par sa lumière, sa chaleur imprévisible, sa façon de tout transformer." },
      { letter: "B", text: "L'eau qui coule sans jamais s'arrêter — rivière, océan, pluie — je reviens toujours vers elle." },
      { letter: "C", text: "La terre sous mes pieds — les racines, les pierres, les forêts épaisses — ce qui dure et qui tient." },
      { letter: "D", text: "Le vent qui emporte tout — l'espace ouvert, les hauteurs, l'horizon qu'on ne peut pas attraper." },
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
      { letter: "A", text: "Quand je protège quelqu'un — quand je me bats pour ce qui est juste — quand je suis au cœur de l'action." },
      { letter: "B", text: "Quand je crée quelque chose — une idée, une œuvre, un projet — quand mes mains donnent vie à ma vision." },
      { letter: "C", text: "Quand je suis entouré(e) de ceux que j'aime — dans le rire, dans le partage, dans le lien." },
      { letter: "D", text: "Quand je suis seul(e) dans la nature ou dans le silence — quand j'observe, quand je comprends, quand je vois loin." },
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
      { letter: "A", text: "Une force. Une présence. Quelqu'un vers qui on se tourne quand ça va mal — ou quand il faut décider." },
      { letter: "B", text: "Une sagesse. Un regard différent. Quelqu'un qui dit les choses que les autres n'osent pas formuler." },
      { letter: "C", text: "Une douceur. Une chaleur. Quelqu'un qui accueille, qui écoute, qui rend les gens meilleurs." },
      { letter: "D", text: "Une liberté. Une originalité. Quelqu'un qu'on n'arrive pas vraiment à enfermer dans une case." },
    ],
    field: {
      level: "PRIORITAIRE",
      label: "Le griot t'a écouté. Si tu veux lui souffler une nuance, il l'entendra.",
      placeholder: "Une phrase qu'on te dit souvent, que tu aimes ou que tu n'aimes pas entendre...",
      rows: 2,
    },
  },
  {
    n: 4,
    progress: 40,
    griot: "L'épreuve révèle. Pas ce qu'on dit qu'on ferait — ce qu'on fait vraiment.",
    question: "Face à une épreuve — comment réagis-tu vraiment ?",
    choices: [
      { letter: "A", text: "Je fonce. J'agis. Je préfère me tromper dans l'action que rester immobile dans le doute." },
      { letter: "B", text: "Je recule, j'observe, j'analyse — puis je choisis le moment et l'endroit où frapper juste." },
      { letter: "C", text: "Je cherche les autres — je construis des alliances, je crée du soutien autour de moi." },
      { letter: "D", text: "Je rentre en moi-même — je cherche la réponse dans le silence avant de la chercher dehors." },
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
    griot: "Il y a une heure dans la journée où tout semble plus clair. Une heure où tu es vraiment toi.",
    question: "À quelle heure ton âme se réveille-t-elle vraiment ?",
    choices: [
      { letter: "A", text: "À l'aube — quand le monde est encore silence et que tout est possible — avant que les autres arrivent." },
      { letter: "B", text: "En plein jour — dans le feu de l'action, du mouvement, des rencontres, du bruit vivant." },
      { letter: "C", text: "Au crépuscule — quand la lumière change, quand les frontières s'estompent, quand on peut réfléchir." },
      { letter: "D", text: "Dans la nuit — quand le monde dort et que je suis enfin seul(e) avec mes pensées les plus profondes." },
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
      { letter: "A", text: "Afrique de l'Ouest — Sénégal, Mali, Guinée, Côte d'Ivoire, Nigeria, Ghana, Bénin et environs." },
      { letter: "B", text: "Afrique Centrale, de l'Est ou du Sud — Congo, Kenya, Tanzanie, Éthiopie, Afrique du Sud et environs." },
      { letter: "C", text: "Caraïbes, Amériques ou diaspora africaine — une origine africaine probable mais indéterminée." },
      { letter: "D", text: "Europe, Asie, Océanie ou toute autre région — je suis ici pour découvrir mes racines africaines profondes." },
    ],
    field: {
      level: "SPECIAL",
      label: "Tu sais quelque chose de précis ?",
      placeholder: "Un pays, une ethnie, une région que tu connais ou que tu as envie d'explorer...",
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
      { letter: "A", text: "L'injustice. Voir les faibles écrasés par les puissants. Voir la vérité bafouée. Voir les droits piétinés." },
      { letter: "B", text: "La médiocrité acceptée. Les gens qui se contentent de peu. Le gâchis de potentiel. L'abandon des rêves." },
      { letter: "C", text: "La trahison et le mensonge. L'hypocrisie. Les gens qui jouent un rôle plutôt que d'être vrais." },
      { letter: "D", text: "La destruction — de la nature, de la beauté, de la mémoire, de ce qui a pris des siècles à construire." },
    ],
    field: {
      level: "PRIORITAIRE",
      label: "Les ancêtres écoutent mieux ceux qui osent les mots qu'ils gardent pour eux.",
      placeholder: "Ce qui te met vraiment hors de toi — ce contre quoi tu te bats intérieurement...",
      rows: 2,
    },
  },
  {
    n: 8,
    progress: 80,
    griot: "Imagine que dans cent ans, quelqu'un parle de toi. Qu'est-ce qu'il dit ?",
    question: "La trace que tu veux laisser dans le monde ?",
    choices: [
      { letter: "A", text: "J'ai protégé. J'ai défendu. J'ai rendu le monde plus juste pour ceux qui viendront après moi." },
      { letter: "B", text: "J'ai créé. J'ai bâti quelque chose qui durera — une œuvre, une entreprise, une idée, un héritage." },
      { letter: "C", text: "J'ai connecté. J'ai rassemblé les gens. J'ai créé des liens là où il n'y en avait pas." },
      { letter: "D", text: "J'ai révélé. J'ai dit des vérités que personne n'osait dire. J'ai ouvert des yeux." },
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
      { letter: "A", text: "L'eau — une rivière, un océan, une pluie — quelque chose qui coule, qui emporte, qui purifie." },
      { letter: "B", text: "La hauteur — une falaise, un sommet, un vol — une vision d'en haut, une perspective que les autres n'ont pas." },
      { letter: "C", text: "Le feu ou la lumière — une flamme, un soleil, un éclair — quelque chose qui brûle et qui illumine." },
      { letter: "D", text: "Les racines ou la forêt — des arbres, de la terre, des chemins anciens — quelque chose de profond et de durable." },
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
      { letter: "A", text: "Un guerrier qui n'a pas encore trouvé sa vraie bataille. Une force immense qui attend le bon moment." },
      { letter: "B", text: "Un sage qui parle trop peu. Une sagesse profonde que le monde a besoin d'entendre davantage." },
      { letter: "C", text: "Un cœur qui aime trop fort et pas assez lui-même. Une générosité qui parfois s'oublie." },
      { letter: "D", text: "Un esprit libre dans un corps qui essaie de rentrer dans des cases. Une âme trop grande pour les limites qu'on lui impose." },
    ],
    field: {
      level: "PRIORITAIRE",
      label: "Dis-lui maintenant ce que tu n'as jamais dit à voix haute.",
      placeholder: "Une confidence, une vérité, un mot — quelque chose que tu n'as jamais dit à voix haute...",
      rows: 3,
    },
  },
];

type Phase =
  | "intro"
  | "question"
  | "paywall-transition"
  | "paywall"
  | "post-payment"
  | "final-transition"
  | "waiting";

type Answer = { choice?: "A" | "B" | "C" | "D"; field?: string; skipped?: boolean };

function ParcoursPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [nudgeCount, setNudgeCount] = useState(0);
  const [nudge, setNudge] = useState<string | null>(null);
  const filledRef = useRef<Set<number>>(new Set());

  // Restore progress from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("totem_parcours_v1");
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        answers?: Record<number, Answer>;
        index?: number;
        phase?: Phase;
      };
      if (saved.answers) setAnswers(saved.answers);
      if (typeof saved.index === "number") setIndex(saved.index);
      if (saved.phase && saved.phase !== "waiting") setPhase(saved.phase);
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
        JSON.stringify({ answers, index, phase })
      );
    } catch {
      /* quota — ignore */
    }
  }, [answers, index, phase]);

  const current = QUESTIONS[index];
  const progress =
    phase === "intro"
      ? 0
      : phase === "question"
        ? current.progress
        : phase === "paywall-transition" || phase === "paywall" || phase === "post-payment"
          ? 30
          : 100;

  // Paywall auto-transition
  useEffect(() => {
    if (phase === "paywall-transition") {
      const t = setTimeout(() => setPhase("paywall"), 2500);
      return () => clearTimeout(t);
    }
    if (phase === "final-transition") {
      const t = setTimeout(() => setPhase("waiting"), 4000);
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
    if (current.n === 3) {
      setPhase("paywall-transition");
      return;
    }
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
  const canContinue =
    phase !== "question"
      ? true
      : !!a?.choice || (current.canSkip && a?.skipped);

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto" style={{ background: "var(--nuit-profonde)" }}>
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
        {phase === "paywall-transition" && <PaywallTransition key="pt" />}
        {phase === "paywall" && (
          <Paywall key="pw" onPaid={() => setPhase("post-payment")} />
        )}
        {phase === "post-payment" && (
          <PostPayment
            key="pp"
            onContinue={() => {
              setIndex(3);
              setPhase("question");
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
            className="fixed left-1/2 -translate-x-1/2 z-[220] px-6 py-3 rounded"
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

function IntroScreen({ onStart }: { onStart: () => void }) {
  const lines = [
    { delay: 0.3, render: () => (
      <motion.p
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--ivoire)", letterSpacing: "0.08em", display: "inline-block", transformOrigin: "center" }}
      >
        Le Griot parle.
      </motion.p>
    )},
    { delay: 0.6, render: () => (
      <p className="quote-italic" style={{ fontSize: 18 }}>
        Il n'y a pas de bonnes ou de mauvaises réponses ici. Il y a ta vérité — et celle que tu t'autorises à voir.
      </p>
    )},
    { delay: 0.9, render: () => (
      <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "rgba(254,252,240,0.8)", lineHeight: 1.7 }}>
        Réponds avec ce que tu ressens. Pas avec ce que tu crois devoir répondre.
        <br /><br />
        Le temps n'existe pas ici. L'ancêtre attend.
      </p>
    )},
  ];

  return (
    <motion.section
      {...fadeSlide}
      className="relative min-h-screen flex items-center justify-center px-5"
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
            Je commence mon voyage
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}

function QuestionScreen({
  q, answer, onChoice, onField, onSkip, onNext, onPrev, canContinue, isFirst,
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
  const [showTertiary, setShowTertiary] = useState(false);
  const isD = answer?.choice === "D";
  const baseRows = q.field.rows;
  const dynamicRows = isD ? Math.max(3, baseRows) : baseRows;

  const showField =
    q.field.level === "PRIORITAIRE" ||
    q.field.level === "SECONDAIRE" ||
    q.field.level === "SPECIAL" ||
    (q.field.level === "TERTIAIRE" && showTertiary);

  const dLabel = isD
    ? "Tu as choisi la liberté. Le griot voudrait comprendre la tienne — en une phrase."
    : q.field.label;

  return (
    <motion.section
      {...fadeSlide}
      className="relative min-h-screen flex items-center justify-center px-5"
      style={{ paddingTop: 80, paddingBottom: 80 }}
    >
      <div className="w-full max-w-[640px] flex flex-col items-center gap-6 text-center">
        <div style={{ color: "var(--or-pale)", fontSize: 18, letterSpacing: "0.3em" }}>✦</div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#888", letterSpacing: "0.18em" }}>
          QUESTION {q.n} SUR 10
        </p>
        {q.note && (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#888" }}>{q.note}</p>
        )}
        {q.griot && (
          <p className="quote-italic" style={{ fontSize: 18 }}>
            ✦ {q.griot}
          </p>
        )}
        <div className="section-divider" style={{ marginBottom: 0 }} />
        <h1 className="h-display" style={{ fontSize: 34, color: "var(--ivoire)" }}>
          {q.question}
        </h1>
        <div className="section-divider" style={{ marginBottom: 0 }} />

        {/* Choices */}
        <div className="w-full flex flex-col gap-3 mt-2">
          {q.choices.map((c) => {
            const selected = answer?.choice === c.letter;
            return (
              <button
                key={c.letter}
                onClick={() => onChoice(c.letter)}
                className="text-left flex gap-4 items-start"
                style={{
                  background: selected ? "#2D2D1A" : "#1A1A2E",
                  borderRadius: 8,
                  padding: "20px 24px",
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
                <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--or-ancestral)" }}>
                  {c.letter}
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 15, lineHeight: 1.6 }}>
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
            + ajouter une nuance
          </button>
        )}

        {showField && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4 }}
            className="w-full text-left"
            style={{ marginTop: 8 }}
          >
            <label
              className="block mb-2"
              style={
                q.field.level === "PRIORITAIRE" || isD || q.field.level === "SPECIAL"
                  ? { fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 15, color: "var(--or-pale)" }
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
                padding: "12px 16px",
                color: "var(--ivoire)",
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                width: "100%",
                resize: "none",
                transition: "border-color 0.3s ease, height 0.4s ease",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#2D2D1A")}
            />
          </motion.div>
        )}

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
              marginTop: 4,
            }}
          >
            Passer cette question →
          </button>
        )}

        <button
          onClick={onNext}
          disabled={!canContinue}
          className="btn-primary"
          style={{
            marginTop: 16,
            opacity: canContinue ? 1 : 0.4,
            cursor: canContinue ? "pointer" : "not-allowed",
          }}
        >
          Continuer
        </button>

        {!isFirst && (
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
            ← Question précédente
          </button>
        )}
      </div>
    </motion.section>
  );
}

function PaywallTransition() {
  return (
    <motion.section
      {...fadeSlide}
      className="relative min-h-screen flex items-center justify-center px-5 text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(201,168,76,0.25), transparent 60%)",
        }}
      />
      <div className="relative max-w-[560px] flex flex-col gap-4">
        <p className="quote-italic" style={{ fontSize: 22 }}>
          Le Griot t'a écouté. Il perçoit déjà ton essence.
        </p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "rgba(254,252,240,0.7)" }}>
          7 questions restantes. Choisis comment recevoir ton œuvre pour continuer.
        </p>
      </div>
    </motion.section>
  );
}

const offers = [
  {
    name: "TOTEM ORIGINE",
    price: "49€",
    sub: "L'expérience essentielle.",
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
    name: "TOTEM ANCESTRAL",
    price: "89€",
    sub: "L'expérience complète.",
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
    name: "TOTEM FAMILLE",
    price: "199€",
    sub: "L'expérience à partager.",
    features: [
      "Trois œuvres TOTEM ANCESTRAL complètes",
      "Trois destinataires au choix",
      "Trois certificats d'authenticité distincts",
      "Livraison sous 30 minutes",
    ],
    cta: "Choisir · 199€",
    featured: false,
  },
];

function Paywall({ onPaid }: { onPaid: () => void }) {
  return (
    <motion.section
      {...fadeSlide}
      className="relative min-h-screen px-5 md:px-10 py-24"
    >
      <div className="max-w-6xl mx-auto text-center flex flex-col items-center gap-4 mb-16">
        <h2 className="h-display" style={{ fontSize: 42, color: "var(--or-ancestral)" }}>
          Choisis ton offre pour continuer.
        </h2>
        <p className="quote-italic" style={{ fontSize: 20 }}>
          Ton coffret te sera livré sous 15 minutes après le paiement.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((o) => (
          <div
            key={o.name}
            className="card-totem flex flex-col"
            style={{
              borderColor: o.featured ? "#C9A84C" : "rgba(201,168,76,0.35)",
              borderWidth: o.featured ? 2 : 1,
              transform: o.featured ? "translateY(-8px)" : "none",
              position: "relative",
            }}
          >
            {o.featured && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  background: "#C9A84C",
                  color: "#1A1A2E",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: 11,
                  padding: "6px 14px",
                  letterSpacing: "0.12em",
                  borderRadius: 2,
                }}
              >
                LE CŒUR DE LA COLLECTION
              </div>
            )}
            <h3
              className="h-display uppercase text-center"
              style={{ fontSize: 22, color: "var(--ivoire)", letterSpacing: "0.08em" }}
            >
              {o.name}
            </h3>
            <div
              className="h-display text-center mt-4"
              style={{ fontSize: 52, color: o.featured ? "var(--or-ancestral)" : "var(--ivoire)" }}
            >
              {o.price}
            </div>
            <p className="quote-italic text-center mt-2" style={{ fontSize: 16 }}>
              {o.sub}
            </p>
            <ul className="flex flex-col gap-3 mt-8 mb-8 flex-1">
              {o.features.map((f) => (
                <li key={f} className="flex gap-3 items-start" style={{ color: "var(--ivoire)", fontSize: 14 }}>
                  <Check size={16} color="var(--or-ancestral)" className="mt-1 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              className={o.featured ? "btn-primary w-full" : "btn-secondary w-full"}
              onClick={onPaid}
            >
              {o.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto text-center mt-12 flex flex-col gap-3">
        <p className="caption">
          Paiement sécurisé · Visa · Mastercard · Apple Pay · Google Pay · Aucun abonnement · RGPD
        </p>
        <p className="quote-italic" style={{ fontSize: 14 }}>
          ✦ Ton parcours est sauvegardé. Les 7 questions restantes t'attendent.
        </p>
      </div>
    </motion.section>
  );
}

function PostPayment({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.section
      {...fadeSlide}
      className="relative min-h-screen flex items-center justify-center px-5 text-center"
    >
      <div className="max-w-[560px] flex flex-col items-center gap-6">
        <p className="h-display" style={{ fontSize: 26, color: "var(--ivoire)" }}>
          Ton engagement est reçu.
        </p>
        <p className="quote-italic" style={{ fontSize: 18 }}>
          Le Griot reprend la parole. Les 7 questions qui restent construiront ton œuvre.
        </p>
        <button className="btn-primary" onClick={onContinue}>
          Continuer mon voyage →
        </button>
      </div>
    </motion.section>
  );
}

function FinalTransition() {
  const lines = [
    "Le Griot a écouté.",
    "Il tient maintenant ta vérité entre ses mains.",
    "Les ancêtres délibèrent.",
  ];
  return (
    <motion.section
      {...fadeSlide}
      className="relative min-h-screen flex items-center justify-center px-5 text-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.4] }}
        transition={{ duration: 3 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(201,168,76,0.35), transparent 65%)",
        }}
      />
      <div className="relative flex flex-col gap-6 max-w-[600px]">
        {lines.map((l, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.8 }}
            className="h-display"
            style={{ fontSize: 28, color: "var(--ivoire)" }}
          >
            {l}
          </motion.p>
        ))}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 + 3 * 0.8 }}
          className="quote-italic"
          style={{ fontSize: 22 }}
        >
          Ton totem est en train de naître.
        </motion.p>
      </div>
    </motion.section>
  );
}

const ROTATING = [
  "Les mots cherchent leur forme...",
  "Le portrait prend vie dans l'ombre...",
  "La voix de l'ancêtre se lève...",
  "Ton parchemin est en train d'être écrit...",
  "Un peu de patience — les ancêtres ne se pressent pas.",
];

function WaitingScreen() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setIdx((x) => (x + 1) % ROTATING.length), 6000);
    return () => clearInterval(i);
  }, []);
  return (
    <motion.section
      {...fadeSlide}
      className="relative min-h-screen flex items-center justify-center px-5 text-center"
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
          L'œuvre se compose.
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
            {ROTATING[idx]}
          </motion.p>
        </AnimatePresence>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "rgba(254,252,240,0.7)", lineHeight: 1.7 }}>
          Tu peux fermer cette fenêtre. Les ancêtres terminent leur travail.
        </p>
      </div>
    </motion.section>
  );
}
