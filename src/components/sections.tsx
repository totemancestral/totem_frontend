import { motion } from "motion/react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Star } from "lucide-react";
import { GoldParticles } from "./GoldParticles";
import { Reveal, Ornament } from "./Reveal";

const totemLogo = "/assets/totem-logo.png";
const oeuvreParchemin = "/assets/oeuvre-parchemin.jpg";
const oeuvreVisuelle = "/assets/oeuvre-visuelle-voix.jpg";
const traverserPose = "/assets/avant-traverser-1-posez-le-monde.png";
const traverserEcoute = "/assets/avant-traverser-2-ouvrez-les-oreilles.png";
const traverserParole = "/assets/avant-traverser-3-parlez-vrai.png";
const traverserGarde = "/assets/avant-traverser-4-gardez-le-totem.png";

type Locale = "fr" | "en";

const copy = {
  fr: {
    start: "Commencer",
    juniorCta: "Je suis Junior",
    question: "Une question",
    hero: {
      eyebrow: "Votre âme lointaine, africaine, réincarnée.",
      title: "TOTEM ANCESTRAL",
      body: "Qui étiez-vous, avant d'être qui vous êtes ? Une œuvre tissée dans la langue des origines, qui vous ramène à la source. Une création numérique singulière, nourrie des cosmogonies africaines, aidée et née de l'IA.",
    },
    marquee: [
      "Une âme",
      "Traverse",
      "Soixante mille ans",
      "Pour vous parler",
      "Écoutez",
      "Totem Ancestral",
    ],
    who: {
      eyebrow: "Avant d'être vous",
      title: "Qui étiez-vous ?",
      body: "Avant d'être vous, il y avait quelqu'un.",
      items: [
        {
          title: "Soixante mille ans",
          body: "Il y a soixante mille ans, vos ancêtres ont quitté l'Afrique. D'autres sont restés, ont vécu sous d'autres cieux, murmuré d'autres langues, taillé d'autres masques.",
          image: oeuvreParchemin,
        },
        {
          title: "L'ancêtre resté",
          body: "TOTEM ANCESTRAL réveille l'ancêtre que l'histoire n'a pas emporté. Celui qui est resté dans la terre rouge, dans le bruit du tam-tam, dans le regard du griot.",
          image: oeuvreVisuelle,
        },
        {
          title: "Le miroir",
          body: "Un voyage à l'intérieur du temps. Un cadeau qui traverse les générations. Un miroir qui ne ment pas.",
          image: traverserParole,
        },
      ],
    },
    manifest: {
      eyebrow: "Notre démarche",
      title: "Le manifeste en trois temps",
      body: "Pourquoi cette maison existe, et ce qu'elle refuse d'être.",
      items: [
        {
          title: "Une œuvre, pas un test",
          body: "TOTEM ANCESTRAL est une œuvre, pas un test de personnalité. Chaque parole confiée au griot devient matière à une création narrative et visuelle.",
          image: traverserEcoute,
        },
        {
          title: "L'unicité, pas la série",
          body: "Ce qui est fait ne sera jamais refait. Votre œuvre porte un numéro comme un nom propre gravé une seule fois, pour un seul vivant.",
          image: oeuvreParchemin,
        },
        {
          title: "L'imaginaire, pas la science",
          body: "Nous n'exhumons pas un arbre généalogique. Nous appelons l'ancêtre que personne n'a consigné, celui qui a continué à vivre là où le continent l'avait planté.",
          image: oeuvreVisuelle,
        },
      ],
    },
    artwork: {
      eyebrow: "Ce que vous recevez",
      title: "Une œuvre. Plusieurs pièces.",
      body: "Chaque coffret réunit une fable, un visage, une voix et un certificat numéroté.",
      pieces: [
        {
          title: "Le Parchemin",
          body: "Une chronique personnelle en cinq mouvements.",
          image: oeuvreParchemin,
        },
        {
          title: "La voix et le visage",
          body: "Une image haute résolution et une parole à écouter.",
          image: oeuvreVisuelle,
        },
      ],
      note: "Certificat d'authenticité numéroté inclus selon l'offre choisie.",
    },
    experience: {
      eyebrow: "La traversée",
      title: "Une expérience en trois temps",
      body: "Le parcours commence par une écoute simple, puis la maison compose et livre votre coffret.",
      items: [
        {
          title: "Le griot interroge",
          body: "Vous répondez à des questions courtes, intimes et ouvertes.",
        },
        {
          title: "La maison compose",
          body: "Vos réponses deviennent récit, image, voix et certificat.",
        },
        {
          title: "Le Totem arrive",
          body: "Votre coffret numérique est livré dans votre espace et par email.",
        },
      ],
    },
    assurances: {
      eyebrow: "Garanties",
      title: "Un coffret pensé pour durer",
      body: "Chaque pièce est préparée pour être lue, écoutée, conservée et transmise.",
      items: [
        {
          title: "Délai clair",
          body: "La livraison cible est de quinze minutes après paiement validé.",
        },
        {
          title: "Confidentialité",
          body: "Vos réponses servent uniquement à composer votre œuvre.",
        },
        {
          title: "Fichiers durables",
          body: "Les pièces sont téléchargeables et faciles à archiver.",
        },
        { title: "Bilingue", body: "L'expérience est structurée pour le français et l'anglais." },
      ],
    },
    offers: {
      eyebrow: "Offrandes",
      title: "Deux manières de recevoir l'œuvre",
      body: "Choisissez le format qui convient le mieux à votre quête et à votre héritage.",
      footnote: "Carte cadeau offerte à chaque commande",
      items: [
        {
          name: "Totem Ancestral",
          tag: "Ancestral",
          badge: "Le plus précieux",
          featured: true,
          body: "La création dans sa plénitude. Rien ne manque.",
          features: ["Une création complète", "Une voix rituelle", "Tirage Fine Art possible"],
          cta: "Choisir Ancestral",
        },
        {
          name: "Totem Famille",
          tag: "Famille",
          badge: "",
          featured: false,
          body: "Parce que certaines racines se partagent.",
          features: ["Trois coffrets coordonnés", "Trois destinataires", "Livraison familiale"],
          cta: "Choisir Famille",
        },
      ],
    },
    house: {
      eyebrow: "Qui nous sommes",
      title: "Une maison de création",
      paragraphs: [
        "TOTEM ANCESTRAL est une maison de création fondée à Paris, au carrefour de l'art numérique et des mémoires africaines.",
        "Nous ne sommes ni archivistes, ni devins, ni généalogistes. Nous sommes des passeurs entre ce que vous êtes et ce que vous auriez pu être. Entre aujourd'hui et les soixante mille ans qui vous précèdent.",
      ],
    },
    testimonials: {
      eyebrow: "Ils ont traversé",
      title: "Ce qu'ils en pensent",
      body: "Découvrez les récits de ceux qui ont déjà éveillé leur Totem.",
      rows: [
        [
          {
            q: "J'ai pleuré en lisant le Parchemin. Ça ne ressemblait à rien d'autre. Une émotion brute.",
            a: "Aïcha - Dakar",
          },
          {
            q: "La Voix m'a donné des frissons. On dirait que mon ancêtre me connaissait vraiment.",
            a: "Kwame - Accra",
          },
          {
            q: "Le coffret Famille nous a réunis autour d'une histoire commune, enfin écrite.",
            a: "Fatou - Bamako",
          },
        ],
        [
          {
            q: "Pas un gadget. Une vraie expérience, posée et sincère, qui touche le cœur.",
            a: "Yannick - Paris",
          },
          {
            q: "Le Visage trône maintenant dans mon salon. C'est mon Totem, mon héritage.",
            a: "Naomi - London",
          },
          {
            q: "Quinze minutes comme promis, et un objet que je garderai toute ma vie.",
            a: "Idris - Lagos",
          },
        ],
      ],
    },
    faq: {
      eyebrow: "Questions fréquentes",
      title: "Éclaircir le mystère",
      body: "Les réponses essentielles avant de confier votre matière au griot.",
      items: [
        {
          q: "Chaque œuvre est-elle unique ?",
          a: "Oui. Votre Totem est généré en temps réel à partir de vos réponses spécifiques. Il n'existe pas deux créations identiques dans le cosmos de Totem Ancestral.",
        },
        {
          q: "Est-ce un test ADN ?",
          a: "Non. Nous explorons la mémoire spirituelle et culturelle plutôt que biologique. C'est une quête artistique et symbolique de vos racines.",
        },
        {
          q: "Comment recevoir mon Totem ?",
          a: "Selon l'offre choisie, vous recevez un accès numérique, un coffret complet et les fichiers préparés dans votre espace personnel.",
        },
        {
          q: "Mes données sont-elles protégées ?",
          a: "Vos réponses servent uniquement à composer et livrer l'œuvre. Elles ne sont pas vendues à des tiers.",
        },
      ],
    },
    cta: {
      title: "Votre ancêtre vous attend.",
      body: "Quinze minutes pour l'éveiller. Une vie entière pour le porter.",
      button: "Commencer mon voyage",
    },
  },
  en: {
    start: "Begin",
    juniorCta: "I am Junior",
    question: "A question",
    hero: {
      eyebrow: "Your distant African soul, reimagined",
      title: "TOTEM ANCESTRAL",
      body: "Four questions. A work composed for you, nourished by African cosmogonies and shaped with artificial intelligence.",
    },
    marquee: [
      "A soul",
      "Travels",
      "Sixty thousand years",
      "To speak to you",
      "Listen",
      "Totem Ancestral",
    ],
    who: {
      eyebrow: "Before the passage",
      title: "Who were you?",
      body: "A deep exploration of your origins, where memory stops and the soul begins to speak.",
      items: [
        {
          title: "The Origin",
          body: "The starting point of your lineage, where everything began.",
          image: oeuvreParchemin,
        },
        {
          title: "The Echo",
          body: "The resonance of your ancestors in today's choices.",
          image: oeuvreVisuelle,
        },
        {
          title: "The Breath",
          body: "The vital energy passed from generation to generation.",
          image: traverserParole,
        },
      ],
    },
    manifest: {
      eyebrow: "Our approach",
      title: "The manifesto in three movements",
      body: "Three movements, one thread: turning what you carry in silence into a work that can be passed on.",
      items: [
        {
          title: "Listen",
          body: "Four direct questions to bring up what the ancestors already whisper within you.",
          image: traverserEcoute,
        },
        {
          title: "Compose",
          body: "The digital griot weaves your answers with African cosmogonies into a unique fable.",
          image: oeuvreParchemin,
        },
        {
          title: "Transmit",
          body: "Your Totem takes shape as text, voice and image, ready to be kept and shared.",
          image: oeuvreVisuelle,
        },
      ],
    },
    artwork: {
      eyebrow: "What you receive",
      title: "One artwork. Several pieces.",
      body: "Each box gathers a fable, a face, a voice and a numbered certificate.",
      pieces: [
        {
          title: "The Parchment",
          body: "A personal chronicle in five movements.",
          image: oeuvreParchemin,
        },
        {
          title: "The voice and face",
          body: "A high-resolution image and a word to listen to.",
          image: oeuvreVisuelle,
        },
      ],
      note: "A numbered certificate of authenticity is included depending on the selected offer.",
    },
    experience: {
      eyebrow: "The passage",
      title: "An experience in three movements",
      body: "The journey begins with simple listening, then the house composes and delivers your box.",
      items: [
        { title: "The griot asks", body: "You answer short, intimate and open questions." },
        {
          title: "The house composes",
          body: "Your answers become story, image, voice and certificate.",
        },
        {
          title: "The Totem arrives",
          body: "Your digital box is delivered to your space and by email.",
        },
      ],
    },
    assurances: {
      eyebrow: "Guarantees",
      title: "A box designed to last",
      body: "Each piece is prepared to be read, listened to, preserved and passed on.",
      items: [
        {
          title: "Clear timing",
          body: "Target delivery is fifteen minutes after confirmed payment.",
        },
        { title: "Confidentiality", body: "Your answers are only used to compose your artwork." },
        { title: "Durable files", body: "The pieces are downloadable and easy to archive." },
        { title: "Bilingual", body: "The experience supports French and English." },
      ],
    },
    offers: {
      eyebrow: "Offerings",
      title: "Three ways to receive the work",
      body: "Choose the format that best suits your quest and your legacy.",
      footnote: "Gift card included with every order",
      items: [
        {
          name: "Totem Origin",
          tag: "Origin",
          badge: "",
          featured: false,
          body: "Details and prices appear after the first four questions.",
          features: ["A personalized creation", "A digital box", "Access to your space"],
          cta: "Choose Origin",
        },
        {
          name: "Totem Ancestral",
          tag: "Ancestral",
          badge: "Most precious",
          featured: true,
          body: "The creation in full. Nothing missing. Composed to last a lifetime.",
          features: ["A complete creation", "A ritual voice", "Fine Art print possible"],
          cta: "Choose Ancestral",
        },
        {
          name: "Totem Family",
          tag: "Family",
          badge: "",
          featured: false,
          body: "Because some roots are shared. For your loved ones.",
          features: ["Three coordinated boxes", "Three recipients", "Family delivery"],
          cta: "Choose Family",
        },
      ],
    },
    house: {
      eyebrow: "Who we are",
      title: "A creation house",
      paragraphs: [
        "TOTEM ANCESTRAL is a creation house founded in Paris, at the crossroads of digital art and African memory.",
        "We are not archivists, seers or genealogists. We are guides between who you are and who you could have been.",
      ],
    },
    testimonials: {
      eyebrow: "They crossed",
      title: "What they think",
      body: "Read the words of those who have already awakened their Totem.",
      rows: [
        [
          {
            q: "I cried while reading the Parchment. It felt like nothing else. A raw emotion.",
            a: "Aicha - Dakar",
          },
          {
            q: "The Voice gave me chills. It felt as if my ancestor truly knew me.",
            a: "Kwame - Accra",
          },
          {
            q: "The Family box brought us around a common story, finally written.",
            a: "Fatou - Bamako",
          },
        ],
        [
          {
            q: "Not a gimmick. A real, grounded, sincere experience that touched the heart.",
            a: "Yannick - Paris",
          },
          {
            q: "The Face now stands in my living room. It is my Totem, my legacy.",
            a: "Naomi - London",
          },
          {
            q: "Fifteen minutes as promised, and an object I will keep all my life.",
            a: "Idris - Lagos",
          },
        ],
      ],
    },
    faq: {
      eyebrow: "Frequent questions",
      title: "Clarify the mystery",
      body: "The essentials before entrusting your matter to the griot.",
      items: [
        {
          q: "Is every work unique?",
          a: "Yes. Your Totem is generated from your specific answers. No two creations are identical.",
        },
        {
          q: "Is this a DNA test?",
          a: "No. We explore spiritual and cultural memory, not biology. This is an artistic and symbolic quest.",
        },
        {
          q: "How do I receive my Totem?",
          a: "Depending on the offer, you receive digital access, a complete box and files prepared in your personal space.",
        },
        {
          q: "Is my data protected?",
          a: "Your answers are only used to compose and deliver the artwork. They are not sold to third parties.",
        },
      ],
    },
    cta: {
      title: "Your ancestor is waiting.",
      body: "Fifteen minutes to awaken them. A lifetime to carry them.",
      button: "Begin my journey",
    },
  },
} as const;

const galleryImages = [
  totemLogo,
  oeuvreParchemin,
  oeuvreVisuelle,
  traverserPose,
  traverserEcoute,
  traverserParole,
  traverserGarde,
  "/assets/consigne-1-posture.jpg",
  "/assets/consigne-2-volume.jpg",
  "/assets/consigne-3-coeur.jpg",
  "/assets/consigne-4-heritage.jpg",
];

function useLandingCopy() {
  const locale = useLocale();
  const safeLocale: Locale = locale === "en" ? "en" : "fr";
  return { locale: safeLocale, t: copy[safeLocale] };
}

function journeyHref(locale: Locale) {
  return `/${locale}/janua_vitae?mode=signup&redirect=${encodeURIComponent(`/${locale}/via_sapientiae?restart=1`)}`;
}

function juniorHref(locale: Locale) {
  return `/${locale}/janua_vitae?mode=signup&role=junior&redirect=${encodeURIComponent(`/${locale}/iuvenis_signum`)}`;
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <Reveal>
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
          {eyebrow}
        </p>
        <h2 className="h-display mt-5 text-5xl md:text-7xl" style={{ color: "var(--ivoire)" }}>
          {title}
        </h2>
        {body && <p className="quote-italic mt-6 max-w-2xl text-lg md:text-xl">{body}</p>}
      </div>
    </Reveal>
  );
}

function TriptychCard({
  index,
  title,
  body,
  image,
  raised = false,
}: {
  index: number;
  title: string;
  body: string;
  image: string;
  raised?: boolean;
}) {
  return (
    <article
      className={`totem-card relative flex min-h-[360px] flex-col overflow-hidden p-8 md:p-10 ${raised ? "md:-translate-y-8" : ""}`}
      style={{ borderColor: raised ? "rgba(216,173,77,0.55)" : undefined }}
    >
      <span
        className="h-display text-5xl"
        style={{ color: raised ? "var(--or-ancestral)" : "rgba(216,173,77,0.35)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="mt-auto pr-20">
        <h3 className="h-display text-3xl md:text-4xl" style={{ color: "var(--ivoire)" }}>
          {title}
        </h3>
        <p className="card-copy mt-5 text-[15px]" style={{ color: "rgba(226,225,238,0.78)" }}>
          {body}
        </p>
      </div>
      <img
        src={image}
        alt=""
        loading="lazy"
        className="absolute bottom-7 right-7 h-20 w-20 rounded-sm border object-cover grayscale"
        style={{ borderColor: "rgba(216,173,77,0.28)", filter: "grayscale(1) brightness(0.72)" }}
      />
    </article>
  );
}

/* ---------- HERO ---------- */
export function Hero() {
  const { locale, t } = useLandingCopy();
  const titleChars = t.hero.title.split("");
  const [showChoice, setShowChoice] = useState(false);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pb-16 pt-28 md:px-10">
      <GoldParticles count={34} />
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20"
        aria-hidden="true"
      >
        <img
          src={totemLogo}
          alt=""
          className="h-[78vh] max-h-[760px] w-auto object-contain grayscale"
          style={{ filter: "grayscale(1) brightness(0.42)" }}
        />
      </div>
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="eyebrow"
          style={{ color: "var(--or-ancestral)" }}
        >
          {t.hero.eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          className="h-display mt-8 text-6xl leading-[0.95] sm:text-7xl md:text-8xl lg:text-[112px]"
          style={{ color: "var(--ivoire)" }}
          aria-label={t.hero.title}
        >
          {titleChars.map((char, index) =>
            char === " " ? (
              " "
            ) : (
              <span
                key={`${char}-${index}`}
                className="hero-char inline-block"
                style={{ animationDelay: `${index * 70}ms` }}
                aria-hidden="true"
              >
                {char}
              </span>
            ),
          )}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="body-copy mt-9 max-w-2xl text-lg md:text-xl"
          style={{ color: "rgba(226,225,238,0.84)" }}
        >
          {t.hero.body}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          {!showChoice ? (
            <button
              type="button"
              className="btn-primary animate-pulse-glow w-full sm:w-auto"
              onClick={() => setShowChoice(true)}
            >
              {t.start}
              <ArrowRight size={16} strokeWidth={1.7} />
            </button>
          ) : (
            <div className="flex w-full flex-col items-center gap-5 sm:flex-row sm:justify-center">
              <Link
                href={journeyHref(locale)}
                className="btn-primary animate-pulse-glow w-full sm:w-auto"
              >
                {t.start}
                <ArrowRight size={16} strokeWidth={1.7} />
              </Link>
              <Link href={juniorHref(locale)} className="btn-secondary w-full sm:w-auto">
                {t.juniorCta}
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- PREUVES / MARQUEE ---------- */
export function ProofBand() {
  const { t } = useLandingCopy();
  const items = [...t.marquee, ...t.marquee];

  return (
    <section
      className="overflow-hidden border-y py-5"
      style={{ borderColor: "rgba(216,173,77,0.18)", background: "#0c0e16" }}
    >
      <div className="totem-marquee flex w-max items-center gap-14 whitespace-nowrap">
        {[...items, ...items].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="h-display flex items-center gap-10 text-2xl"
            style={{ color: "rgba(209,197,177,0.82)" }}
          >
            {item}
            <span style={{ color: "rgba(216,173,77,0.58)" }}>✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------- QUI ETAIS-TU ---------- */
export function LeGeste() {
  const { t } = useLandingCopy();

  return (
    <section
      className="px-5 py-28 md:px-10 md:py-36"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={t.who.eyebrow} title={t.who.title} body={t.who.body} />
        <div className="mt-20 grid gap-0 md:grid-cols-3 md:pt-8">
          {t.who.items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.1}>
              <TriptychCard
                index={index}
                title={item.title}
                body={item.body}
                image={item.image}
                raised={index === 1}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- LE MANIFESTE ---------- */
export function Manifeste() {
  const { t } = useLandingCopy();

  return (
    <section
      id="experience"
      className="border-y px-5 py-28 md:px-10 md:py-32"
      style={{ background: "rgba(12,14,22,0.72)", borderColor: "rgba(216,173,77,0.18)" }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={t.manifest.eyebrow}
          title={t.manifest.title}
          body={t.manifest.body}
        />
        <div className="mt-20 grid gap-0 md:grid-cols-3 md:pt-8">
          {t.manifest.items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.1}>
              <TriptychCard
                index={index}
                title={item.title}
                body={item.body}
                image={item.image}
                raised={index === 1}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- L'OEUVRE ---------- */
export function Oeuvre() {
  const { t } = useLandingCopy();

  return (
    <section className="px-5 py-28 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={t.artwork.eyebrow} title={t.artwork.title} body={t.artwork.body} />
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {t.artwork.pieces.map((piece, index) => (
            <Reveal key={piece.title} delay={index * 0.1}>
              <article className="totem-card overflow-hidden p-0">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={piece.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover grayscale"
                    style={{ filter: "grayscale(1) brightness(0.7)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e16] to-transparent" />
                </div>
                <div className="p-8">
                  <h3 className="h-display text-3xl" style={{ color: "var(--ivoire)" }}>
                    {piece.title}
                  </h3>
                  <p className="quote-italic mt-4 text-lg">{piece.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="caption mt-10 text-center">{t.artwork.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- L'EXPERIENCE ---------- */
export function Experience() {
  const { t } = useLandingCopy();

  return (
    <section className="px-5 py-28 md:px-10" style={{ background: "var(--indigo-ancestral)" }}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={t.experience.eyebrow}
          title={t.experience.title}
          body={t.experience.body}
        />
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {t.experience.items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.1}>
              <article className="totem-card h-full p-8">
                <span className="h-display text-5xl" style={{ color: "rgba(216,173,77,0.35)" }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="h-display mt-8 text-3xl" style={{ color: "var(--ivoire)" }}>
                  {item.title}
                </h3>
                <p className="card-copy mt-5" style={{ color: "rgba(226,225,238,0.82)" }}>
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- GARANTIES ---------- */
export function Assurances() {
  const { t } = useLandingCopy();

  return (
    <section className="px-5 py-28 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={t.assurances.eyebrow}
          title={t.assurances.title}
          body={t.assurances.body}
        />
        <div className="mt-16 grid gap-5 md:grid-cols-4">
          {t.assurances.items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.08}>
              <article className="totem-card h-full p-7">
                <span className="h-display text-4xl" style={{ color: "rgba(216,173,77,0.35)" }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="h-display mt-7 text-2xl" style={{ color: "var(--ivoire)" }}>
                  {item.title}
                </h3>
                <p
                  className="card-copy mt-4 text-[15px]"
                  style={{ color: "rgba(226,225,238,0.8)" }}
                >
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- OFFRES ---------- */
export function Offres() {
  const { locale, t } = useLandingCopy();
  const offersGridClass =
    t.offers.items.length === 2 ? "mx-auto max-w-4xl md:grid-cols-2" : "md:grid-cols-3";

  return (
    <section id="offres" className="px-5 py-28 md:px-10 md:py-36" style={{ background: "#0c0e16" }}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={t.offers.eyebrow} title={t.offers.title} body={t.offers.body} />
        <div className={`mt-20 grid items-stretch gap-8 ${offersGridClass}`}>
          {t.offers.items.map((offer, index) => {
            const Icon = offer.featured ? Star : Check;
            return (
              <Reveal
                key={offer.name}
                delay={index * 0.1}
                className={offer.featured ? "md:-translate-y-6" : ""}
              >
                <article
                  className="totem-card relative flex h-full flex-col p-8 md:p-10"
                  style={{
                    borderColor: offer.featured ? "var(--or-ancestral)" : "rgba(216,173,77,0.22)",
                    background: offer.featured ? "#1e1f28" : "#1a1b24",
                    boxShadow: offer.featured
                      ? "0 34px 80px -28px rgba(216,173,77,0.34)"
                      : undefined,
                  }}
                >
                  {offer.badge && (
                    <span
                      className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-or px-5 py-2 text-center text-[11px] font-semibold uppercase"
                      style={{ color: "#0c0e16" }}
                    >
                      {offer.badge}
                    </span>
                  )}
                  <p
                    className="eyebrow text-center"
                    style={{
                      color: offer.featured ? "var(--or-ancestral)" : "rgba(216,173,77,0.64)",
                    }}
                  >
                    {offer.tag}
                  </p>
                  <h3
                    className="h-display mt-8 text-center text-4xl"
                    style={{ color: "var(--ivoire)" }}
                  >
                    {offer.name}
                  </h3>
                  <p
                    className="card-copy mt-8 text-center text-[15px]"
                    style={{ color: "rgba(226,225,238,0.78)" }}
                  >
                    {offer.body}
                  </p>
                  <ul
                    className="my-10 flex flex-1 flex-col gap-5 border-t pt-8"
                    style={{ borderColor: "rgba(216,173,77,0.18)" }}
                  >
                    {offer.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-[15px] leading-relaxed"
                        style={{ color: "rgba(226,225,238,0.84)" }}
                      >
                        <Icon
                          className="mt-1 shrink-0"
                          size={17}
                          strokeWidth={1.8}
                          style={{ color: "var(--or-ancestral)" }}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={journeyHref(locale)}
                    className={`${offer.featured ? "btn-primary" : "btn-secondary"} mt-auto w-full`}
                  >
                    {offer.cta}
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={0.25}>
          <p className="eyebrow mt-16 text-center" style={{ color: "rgba(216,173,77,0.72)" }}>
            ✦ {t.offers.footnote} ✦
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- LA MAISON ---------- */
export function Maison() {
  const { t } = useLandingCopy();
  const columns = [0, 1, 2, 3, 4].map((column) =>
    Array.from(
      { length: 6 },
      (_, index) => galleryImages[(column * 2 + index) % galleryImages.length],
    ),
  );

  return (
    <section
      id="maison"
      className="overflow-hidden px-5 py-28 md:px-10 md:py-36"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={t.house.eyebrow} title={t.house.title} />
        <Reveal delay={0.1}>
          <div
            className="mx-auto mt-10 max-w-3xl space-y-6 text-center text-lg leading-relaxed md:text-xl"
            style={{ color: "rgba(226,225,238,0.8)" }}
          >
            {t.house.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.2}>
        <div
          className="relative mx-auto mt-20 grid h-[560px] max-w-7xl grid-cols-2 gap-4 overflow-hidden md:grid-cols-5"
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-[#0c0e16] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-[#0c0e16] to-transparent" />
          {columns.map((images, column) => (
            <div
              key={column}
              className={`flex flex-col gap-4 ${column % 2 === 0 ? "totem-grid-up" : "totem-grid-down"}`}
            >
              {[...images, ...images].map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt=""
                  loading="lazy"
                  className="h-40 w-full rounded-sm border object-cover grayscale transition-opacity duration-300 hover:opacity-100"
                  style={{
                    borderColor: "rgba(216,173,77,0.16)",
                    opacity: 0.46,
                    filter: "grayscale(1) brightness(0.72)",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- AVIS ---------- */
export function Avis() {
  const { t } = useLandingCopy();

  return (
    <section className="overflow-hidden px-5 py-28 md:px-10" style={{ background: "#0c0e16" }}>
      <div className="mx-auto mb-16 max-w-6xl">
        <SectionHeading
          eyebrow={t.testimonials.eyebrow}
          title={t.testimonials.title}
          body={t.testimonials.body}
        />
      </div>
      <div className="space-y-8">
        {t.testimonials.rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex w-max gap-8 ${rowIndex === 0 ? "totem-marquee" : "totem-marquee-reverse"}`}
          >
            {[...row, ...row, ...row].map((item, index) => (
              <article
                key={`${item.a}-${index}`}
                className="totem-card flex min-h-[250px] w-[330px] flex-col justify-center p-8 sm:w-[400px]"
              >
                <p
                  className="quote-italic text-base leading-relaxed"
                  style={{ color: "rgba(226,225,238,0.82)" }}
                >
                  "{item.q}"
                </p>
                <p className="eyebrow mt-8" style={{ color: "var(--or-ancestral)" }}>
                  {item.a}
                </p>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
export function FAQ() {
  const { t } = useLandingCopy();

  return (
    <section
      id="faq"
      className="border-t px-5 py-28 md:px-10"
      style={{ background: "var(--nuit-profonde)", borderColor: "rgba(216,173,77,0.18)" }}
    >
      <div className="mx-auto max-w-4xl">
        <SectionHeading eyebrow={t.faq.eyebrow} title={t.faq.title} body={t.faq.body} />
        <div className="mt-14 space-y-4">
          {t.faq.items.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="totem-card overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-5 p-6 text-left transition-colors hover:bg-ombre"
      >
        <span className="h-display text-xl md:text-2xl" style={{ color: "var(--ivoire)" }}>
          {q}
        </span>
        <ChevronDown
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          size={22}
          strokeWidth={1.8}
          style={{ color: "var(--or-ancestral)" }}
        />
      </button>
      {open && (
        <p
          className="body-copy px-6 pb-6 pt-0 text-[15px]"
          style={{ color: "rgba(226,225,238,0.82)" }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

/* ---------- CTA FINAL ---------- */
export function CtaFinal() {
  const { locale, t } = useLandingCopy();
  const [showChoice, setShowChoice] = useState(false);

  return (
    <section
      className="relative overflow-hidden px-5 py-32 text-center md:px-10 md:py-44"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.16]"
        aria-hidden="true"
      >
        <img
          src={totemLogo}
          alt=""
          className="h-[620px] w-auto max-w-none grayscale blur-sm"
          style={{ filter: "grayscale(1) brightness(0.48) blur(2px)" }}
        />
      </div>
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
        <Ornament />
        <Reveal>
          <h2 className="h-display mt-7 text-5xl md:text-7xl" style={{ color: "var(--ivoire)" }}>
            {t.cta.title}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="quote-italic mt-8 text-xl md:text-2xl">{t.cta.body}</p>
        </Reveal>
        <Reveal delay={0.2}>
          {!showChoice ? (
            <button
              type="button"
              className="btn-primary !px-12 !py-6 text-base"
              onClick={() => setShowChoice(true)}
            >
              {t.cta.button}
              <ArrowRight size={18} strokeWidth={1.7} />
            </button>
          ) : (
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
              <Link href={journeyHref(locale)} className="btn-primary !px-12 !py-6 text-base">
                {t.cta.button}
                <ArrowRight size={18} strokeWidth={1.7} />
              </Link>
              <Link href={juniorHref(locale)} className="btn-secondary !px-12 !py-6 text-base">
                {t.juniorCta}
              </Link>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
