import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Mic, Sparkles, Send, FileText, Image as ImageIcon, AudioLines, Check, ArrowRight } from "lucide-react";
import { MaskLogo } from "./MaskLogo";
import { GoldParticles } from "./GoldParticles";
import { Reveal, SectionDivider, Ornament } from "./Reveal";

/* ---------- HERO ---------- */
export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-5 pt-32 pb-24"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <GoldParticles count={28} />

      <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          <MaskLogo size={120} />
        </motion.div>

        <Ornament />

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="h-display text-[44px] sm:text-6xl md:text-7xl lg:text-[80px]"
          style={{ color: "var(--ivoire)" }}
        >
          Le portrait imaginaire
          <br />
          de l'Africain
          <br />
          <span style={{ color: "var(--or-ancestral)" }}>que vous auriez pu être.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="quote-italic text-xl md:text-2xl max-w-2xl"
        >
          Et si l'un de vos ancêtres n'était jamais parti d'Afrique&nbsp;?
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="text-base md:text-lg max-w-xl leading-relaxed"
          style={{ color: "rgba(254,252,240,0.8)" }}
        >
          Une œuvre numérique unique, assistée par intelligence artificielle, inspirée des cosmogonies africaines.
          Composée pour vous, ou pour celui à qui vous l'offrez.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="flex flex-col sm:flex-row items-center gap-6 mt-2"
        >
          <a href="#offres" className="btn-primary animate-pulse-glow">
            Composer mon œuvre
            <ArrowRight size={16} strokeWidth={1.5} />
          </a>
          <a href="#experience" className="link-gold text-sm tracking-[0.14em] uppercase">
            Découvrir l'expérience
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.7 }}
          className="caption italic mt-4"
        >
          Pas un test ADN. Une fable artistique.
        </motion.p>
      </div>
    </section>
  );
}

/* ---------- LE GESTE ---------- */
export function LeGeste() {
  return (
    <section className="py-32 px-5 md:px-10 bg-gradient-totem">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
            Avant d'être qui vous êtes,
            <br />
            vous avez été quelque part.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-16 space-y-6 text-base md:text-lg leading-[1.85]" style={{ color: "var(--ivoire)" }}>
            <p>
              Il y a soixante mille ans, vos ancêtres ont quitté l'Afrique.
              Certains sont restés. Sont nés sous d'autres ciels,
              ont parlé d'autres langues, ont sculpté d'autres masques.
            </p>
            <p>
              TOTEM ANCESTRAL imagine, pour chacun d'entre nous, l'aïeul qui n'est jamais parti.
              Celui que nous aurions pu être si l'histoire avait choisi un autre chemin.
            </p>
            <p style={{ color: "rgba(254,252,240,0.75)" }}>
              Ce n'est ni un test, ni une science, ni une vérité.
              <br />
              <em style={{ fontFamily: "var(--font-display)", color: "var(--or-pale)" }}>
                C'est une fable. Personnelle. Élégante.
              </em>
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-20">
            <SectionDivider />
            <p className="quote-italic text-xl md:text-2xl leading-relaxed">
              «&nbsp;Un cadeau à offrir. Un voyage à s'offrir.
              <br />
              Un miroir tendu à votre imagination.&nbsp;»
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- L'EXPÉRIENCE ---------- */
const steps = [
  {
    n: "01",
    icon: Mic,
    title: "Le griot vous interroge",
    text: "Un griot virtuel vous pose dix questions intimes. Un parcours rythmé, posé, qui prend son temps. Vos réponses sont la matière première de l'œuvre.",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "La maison compose",
    text: "Vos réponses sont confiées à la maison TOTEM ANCESTRAL. Nos directions artistiques et nos systèmes d'intelligence artificielle composent ensemble votre œuvre.",
  },
  {
    n: "03",
    icon: Send,
    title: "L'œuvre vous est livrée",
    text: "Quinze minutes plus tard, votre coffret arrive par email. Numéroté, signé, accompagné de son certificat d'authenticité. Il est unique au monde.",
  },
];

export function Experience() {
  return (
    <section id="experience" className="py-32 px-5 md:px-10" style={{ background: "var(--indigo-ancestral)" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
              Une traversée en trois temps.
            </h2>
            <p className="quote-italic mt-6 text-lg md:text-xl">
              Quinze minutes. Pas de hâte.
              <br />
              La fable se compose pendant que vous respirez.
            </p>
          </div>
        </Reveal>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <article className="card-totem h-full flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <span
                    className="h-display text-5xl"
                    style={{ color: "rgba(201,168,76,0.3)" }}
                  >
                    {s.n}
                  </span>
                  <s.icon size={24} strokeWidth={1.5} color="var(--or-ancestral)" />
                </div>
                <h3 className="h-display text-2xl" style={{ color: "var(--or-pale)" }}>
                  {s.title}
                </h3>
                <p className="text-[15px] leading-[1.75]" style={{ color: "rgba(254,252,240,0.85)" }}>
                  {s.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- L'ŒUVRE ---------- */
const pieces = [
  {
    icon: FileText,
    title: "Le Parchemin",
    subtitle: "Cinq mouvements. Une chronique.",
    text: "Une fable narrative composée pour vous, en cinq mouvements : l'ouverture, le portrait, l'épreuve, la transmission, le passage. Mille huit cents caractères de prose ciselée, sur fond noir et or. Format PDF haute définition, prêt à imprimer.",
    badge: "PDF",
  },
  {
    icon: ImageIcon,
    title: "L'Œuvre Visuelle",
    subtitle: "Une peinture numérique unique.",
    text: "Une œuvre d'art numérique composée pour vous seul. Esthétique de musée, palette ancestrale. Format PNG très haute résolution, encadrable, imprimable jusqu'au format A2.",
    badge: "PNG",
  },
  {
    icon: AudioLines,
    title: "La Voix de l'Ancêtre",
    subtitle: "Quatre-vingt-dix secondes. Une parole.",
    text: "Un message audio prononcé par la voix d'un acteur africain. Une parole posée, intime, qui s'adresse à vous par votre prénom. Format MP3, à écouter au casque, le soir, en silence.",
    badge: "MP3",
  },
];

export function Oeuvre() {
  return (
    <section className="py-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
              Trois pièces. Une œuvre.
            </h2>
            <p className="mt-6 text-base md:text-lg leading-relaxed" style={{ color: "var(--ivoire)" }}>
              Chaque coffret TOTEM ANCESTRAL est composé de trois éléments artistiques, conçus pour dialoguer entre eux.
            </p>
          </div>
        </Reveal>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {pieces.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.12}>
              <article
                className="card-totem h-full flex flex-col gap-6 relative overflow-hidden"
                style={{ minHeight: 460 }}
              >
                <div
                  className="absolute -top-24 -right-24 w-56 h-56 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
                  }}
                />
                <div className="flex items-start justify-between relative">
                  <p.icon size={32} strokeWidth={1.2} color="var(--or-ancestral)" />
                  <span
                    className="text-[10px] tracking-[0.24em] px-3 py-1.5 border"
                    style={{
                      color: "var(--or-ancestral)",
                      borderColor: "rgba(201,168,76,0.4)",
                    }}
                  >
                    {p.badge}
                  </span>
                </div>
                <div className="relative">
                  <h3 className="h-display text-3xl" style={{ color: "var(--ivoire)" }}>
                    {p.title}
                  </h3>
                  <p className="quote-italic text-lg mt-2">{p.subtitle}</p>
                </div>
                <p className="text-[15px] leading-[1.75] relative" style={{ color: "rgba(254,252,240,0.8)" }}>
                  {p.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-16 text-center">
            <SectionDivider />
            <p className="text-sm md:text-base italic" style={{ color: "var(--or-pale)", fontFamily: "var(--font-display)" }}>
              Et toujours&nbsp;: le certificat d'authenticité — numéroté, signé, unique.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- OFFRES ---------- */
const offers = [
  {
    name: "Totem Origine",
    price: "49",
    subtitle: "L'expérience essentielle.",
    features: [
      "Le Parchemin narratif (PDF)",
      "L'Œuvre visuelle (PNG haute résolution)",
      "Le Certificat d'authenticité numéroté",
      "Livraison sous 15 minutes par email",
    ],
    cta: "Choisir Origine",
    featured: false,
  },
  {
    name: "Totem Ancestral",
    price: "89",
    subtitle: "L'expérience complète.",
    features: [
      "Le Parchemin narratif (PDF)",
      "L'Œuvre visuelle (PNG haute résolution)",
      "La Voix de l'ancêtre imaginaire (MP3, 90s)",
      "Le Certificat d'authenticité numéroté",
      "Livraison sous 15 minutes par email",
    ],
    cta: "Choisir Ancestral",
    featured: true,
    badge: "Le cœur de la collection",
  },
  {
    name: "Totem Famille",
    price: "199",
    subtitle: "L'expérience à partager.",
    features: [
      "Trois œuvres TOTEM ANCESTRAL complètes",
      "Trois destinataires au choix",
      "Trois certificats d'authenticité distincts",
      "Une présentation soignée pour offrir",
      "Livraison sous 30 minutes",
    ],
    cta: "Choisir Famille",
    featured: false,
  },
];

export function Offres() {
  return (
    <section id="offres" className="py-32 px-5 md:px-10" style={{ background: "var(--indigo-ancestral)" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
              Trois manières de recevoir l'œuvre.
            </h2>
            <p className="quote-italic mt-6 text-lg md:text-xl">
              Pour soi. Pour offrir. Pour partager en famille.
            </p>
          </div>
        </Reveal>

        <div className="mt-20 grid md:grid-cols-3 gap-6 items-stretch">
          {offers.map((o, i) => (
            <Reveal key={o.name} delay={i * 0.12} className={o.featured ? "md:-translate-y-4 order-first md:order-none" : ""}>
              <article
                className="card-totem h-full flex flex-col"
                style={{
                  borderColor: o.featured ? "var(--or-ancestral)" : "rgba(201,168,76,0.35)",
                  boxShadow: o.featured ? "0 0 40px rgba(201,168,76,0.15)" : "none",
                  background: o.featured
                    ? "linear-gradient(180deg, #1A1A2E 0%, #14142a 100%)"
                    : "var(--indigo-ancestral)",
                  minHeight: 520,
                }}
              >
                {o.featured && (
                  <div className="mb-6 -mt-2 text-center">
                    <span
                      className="text-[10px] tracking-[0.28em] uppercase px-4 py-2 border"
                      style={{
                        color: "var(--or-ancestral)",
                        borderColor: "var(--or-ancestral)",
                      }}
                    >
                      {o.badge}
                    </span>
                  </div>
                )}

                <h3 className="h-display text-2xl tracking-[0.08em] uppercase text-center" style={{ color: "var(--ivoire)" }}>
                  {o.name}
                </h3>

                <div className="text-center my-8">
                  <span
                    className="h-display text-6xl"
                    style={{ color: o.featured ? "var(--or-ancestral)" : "var(--ivoire)" }}
                  >
                    {o.price}
                  </span>
                  <span className="h-display text-3xl ml-1" style={{ color: o.featured ? "var(--or-ancestral)" : "var(--ivoire)" }}>
                    €
                  </span>
                </div>

                <p className="quote-italic text-center text-base mb-8">{o.subtitle}</p>

                <ul className="flex flex-col gap-4 mb-10">
                  {o.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[14px] leading-[1.6]" style={{ color: "var(--ivoire)" }}>
                      <Check size={16} strokeWidth={1.5} color="var(--or-ancestral)" className="mt-1 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <button className={o.featured ? "btn-primary w-full" : "btn-secondary w-full"}>
                    {o.cta}
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="caption text-center mt-12">
            Carte cadeau gratuite à chaque commande · Paiements internationaux · RGPD
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- LA MAISON ---------- */

export function Maison() {
  return (
    <section id="maison" className="py-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
            Une maison de création.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-16 space-y-6 text-base md:text-lg leading-[1.85]" style={{ color: "var(--ivoire)" }}>
            <p>TOTEM ANCESTRAL est une maison de création artistique fondée à Paris.</p>
            <p>
              Nous composons des œuvres numériques uniques — des fables personnelles inspirées des cosmogonies africaines —
              assistées par intelligence artificielle.
            </p>
            <p>
              Nous ne faisons ni de la science, ni de la généalogie, ni de la divination.
              <br />
              Nous faisons des œuvres. Pour célébrer un proche. Pour s'offrir un voyage intérieur. Pour nourrir l'imagination.
            </p>
            <p style={{ color: "rgba(254,252,240,0.8)" }}>
              Chaque œuvre porte un numéro, une signature, un certificat. Elle ne sera jamais reproduite, ni rééditée,
              ni revendue. Elle est votre exemplaire dans la collection en cours.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12">
            <Link to="/a-propos" className="link-gold text-sm tracking-[0.14em] uppercase">
              Lire le manifeste complet →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- AVIS ---------- */
const testimonials = [
  {
    q: "Je m'attendais à un test de personnalité. J'ai reçu une œuvre. Le parchemin, je l'ai lu trois fois. La voix, je l'ai écoutée seul, le soir. Quelque chose s'est posé.",
    a: "Kofi A., Paris",
    n: "Œuvre n°12 — Lion",
  },
  {
    q: "Je l'ai offert à ma mère pour son anniversaire. Elle a pleuré. Pas de tristesse — quelque chose de plus profond.",
    a: "Amélie D., Lyon",
    n: "Œuvre n°47 — Aigle",
  },
  {
    q: "I'm not African. I was curious. The parchment is a small literary work. I framed the image — it hangs above my desk.",
    a: "James T., London",
    n: "Œuvre n°83 — Éléphant",
  },
];

export function Avis() {
  return (
    <section className="py-32 px-5 md:px-10" style={{ background: "var(--indigo-ancestral)" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <h2 className="h-display text-3xl md:text-5xl text-center" style={{ color: "var(--or-ancestral)" }}>
            Ce qu'ils en disent.
          </h2>
        </Reveal>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.a} delay={i * 0.12}>
              <article className="card-totem h-full flex flex-col gap-6 relative">
                <span
                  className="h-display absolute top-4 left-6 leading-none"
                  style={{ color: "rgba(201,168,76,0.2)", fontSize: "72px" }}
                  aria-hidden="true"
                >
                  "
                </span>
                <p className="quote-italic text-lg leading-relaxed pt-8 relative">{t.q}</p>
                <div className="mt-auto pt-4 border-t" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
                  <p className="text-sm" style={{ color: "var(--ivoire)" }}>— {t.a}</p>
                  <p className="caption mt-1">{t.n}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA FINAL ---------- */
export function CtaFinal() {
  return (
    <section className="py-32 px-5 md:px-10 bg-gradient-totem relative overflow-hidden">
      <GoldParticles count={14} />
      <div className="max-w-3xl mx-auto text-center relative flex flex-col items-center gap-8">
        <Reveal>
          <MaskLogo size={72} />
        </Reveal>
        <Ornament />
        <Reveal delay={0.1}>
          <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--ivoire)" }}>
            L'œuvre vous attend.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="quote-italic text-xl md:text-2xl">
            Quinze minutes pour la composer.
            <br />
            Toute une vie pour la garder.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <a href="#offres" className="btn-primary animate-pulse-glow !px-14 !py-5">
            Composer mon œuvre
            <ArrowRight size={16} strokeWidth={1.5} />
          </a>
        </Reveal>
        <Reveal delay={0.4}>
          <p className="caption mt-2">
            Œuvre numérique unique · Livrée sous 15 minutes · Certificat d'authenticité inclus
          </p>
        </Reveal>
      </div>
    </section>
  );
}
