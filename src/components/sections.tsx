import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Mic, Sparkles, Send, Check, ArrowRight } from "lucide-react";
import { GoldParticles } from "./GoldParticles";
import { Reveal, SectionDivider, Ornament } from "./Reveal";
import totemLogo from "@/assets/totem-logo.png";
import oeuvreParchemin from "@/assets/oeuvre-parchemin.jpg";
import oeuvreVisuelle from "@/assets/oeuvre-visuelle-voix.jpg";

/* ---------- HERO ---------- */
export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-5 pt-32 pb-24"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <GoldParticles count={28} />

      <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-10">
        <motion.img
          src={totemLogo}
          alt="Totem Ancestral — L'âme des origines"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="w-[280px] sm:w-[360px] md:w-[440px] h-auto drop-shadow-[0_20px_60px_rgba(201,168,76,0.18)]"
        />

        <Ornament />

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="h-display text-[36px] sm:text-5xl md:text-6xl lg:text-[68px]"
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
          <a href="#experience" className="link-gold text-sm tracking-[0.14em] uppercase inline-flex items-center gap-2">
            Découvrir l'expérience
            <ArrowRight size={14} strokeWidth={1.5} />
          </a>
        </motion.div>
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
    text: "Vos réponses reflètent qui vous êtes.",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "La maison compose",
    text: "Votre œuvre est en cours de construction, brique après brique.",
  },
  {
    n: "03",
    icon: Send,
    title: "Votre TOTEM vous est livré",
    text: "15 min plus tard, votre coffret secret arrivera par email. Numéroté, signé, accompagné de son certificat d'authenticité. Il est unique au monde.",
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
    image: oeuvreParchemin,
    title: "Le Parchemin",
    subtitle: "Cinq mouvements. Une chronique.",
  },
  {
    image: oeuvreVisuelle,
    title: "L'Œuvre visuelle et la voix de l'ancêtre",
    subtitle: "Une peinture numérique. Une parole intime.",
  },
];

export function Oeuvre() {
  return (
    <section className="py-32 px-5 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
              Une œuvre. Plusieurs pièces.
            </h2>
            <p className="mt-6 text-base md:text-lg leading-relaxed" style={{ color: "var(--ivoire)" }}>
              Chaque coffret TOTEM ANCESTRAL réunit des pièces artistiques composées pour vous seul.
            </p>
          </div>
        </Reveal>

        <div className="mt-20 grid md:grid-cols-2 gap-8">
          {pieces.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.12}>
              <article
                className="card-totem h-full flex flex-col overflow-hidden"
                style={{ padding: 0 }}
              >
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: "4/3" }}
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 50%, var(--nuit-profonde) 100%)",
                    }}
                  />
                </div>
                <div className="px-8 py-8 flex flex-col gap-3 flex-1">
                  <h3 className="h-display text-2xl md:text-3xl" style={{ color: "var(--ivoire)" }}>
                    {p.title}
                  </h3>
                  <p className="quote-italic text-lg">{p.subtitle}</p>
                </div>
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
                  <Link
                    to="/parcours"
                    className={`${o.featured ? "btn-primary" : "btn-secondary"} w-full text-center justify-center`}
                  >
                    {o.cta}
                  </Link>
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
          <img src={totemLogo} alt="Totem Ancestral" className="w-[200px] md:w-[260px] h-auto" />
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
          <Link to="/parcours" className="btn-primary animate-pulse-glow !px-14 !py-5">
            Composer mon œuvre
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
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
