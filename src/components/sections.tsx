import { motion } from "motion/react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { GoldParticles } from "./GoldParticles";
import { Reveal, SectionDivider, Ornament } from "./Reveal";

const totemLogo = "/assets/totem-logo.png";
const oeuvreParchemin = "/assets/oeuvre-parchemin.jpg";
const oeuvreVisuelle = "/assets/oeuvre-visuelle-voix.jpg";

type ManifestItem = {
  title: string;
  body: string;
};

type StepText = {
  title: string;
  text: string;
};

type PieceText = {
  title: string;
  subtitle: string;
  alt: string;
};

type OfferText = {
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: string;
  featured: boolean;
  badge?: string;
};

type ProofItem = {
  value: string;
  label: string;
};

type AssuranceItem = {
  title: string;
  text: string;
};

type HousePillar = {
  title: string;
  text: string;
};

type TestimonialText = {
  q: string;
  a: string;
  n: string;
};

type FAQCategory = {
  title: string;
  items: { q: string; a: string }[];
};

/* ---------- HERO ---------- */
export function Hero() {
  const t = useTranslations("home.hero");
  const brand = useTranslations("brand");

  return (
    <section
      className="relative flex min-h-[90svh] items-center justify-center overflow-hidden px-5 pb-12 pt-28 md:px-10 md:pb-14 md:pt-30"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <GoldParticles count={28} />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -22, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.3, ease: "easeOut" }}
          className="relative mx-auto flex w-full max-w-[500px] items-center justify-center md:mx-0"
        >
          <div
            className="relative flex aspect-square w-full items-center justify-center overflow-visible"
            style={{
              filter: "drop-shadow(0 28px 70px rgba(201,168,76,0.18))",
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-6 top-10 bottom-24 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(201,168,76,0.16), transparent 68%)",
              }}
            />
            <img
              src={totemLogo}
              alt={t("logoAlt", { brand: brand("name") })}
              className="relative z-10 h-auto w-full max-w-[380px] object-contain md:max-w-[460px]"
            />
          </div>
        </motion.div>

        <div className="flex flex-col items-center gap-7 text-center md:items-start md:text-left">
          <Ornament />

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="h-display text-[36px] sm:text-5xl md:text-6xl lg:text-[68px]"
            style={{ color: "var(--ivoire)" }}
          >
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
            <br />
            <span style={{ color: "var(--or-ancestral)" }}>{t("titleHighlight")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="quote-italic max-w-2xl text-xl md:text-2xl"
          >
            {t("question")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.1 }}
            className="body-copy max-w-xl md:text-lg"
            style={{ color: "rgba(254,252,240,0.8)" }}
          >
            {t("description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="mt-1 flex flex-col items-center gap-6 sm:flex-row md:items-start"
          >
            <a
              href="#experience"
              className="link-gold inline-flex items-center gap-2 text-sm uppercase tracking-[0.14em]"
            >
              {t("discover")}
              <ArrowRight size={14} strokeWidth={1.5} />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- PREUVES ---------- */
export function ProofBand() {
  const t = useTranslations("home.proofBand");
  const items = t.raw("items") as ProofItem[];

  return (
    <section
      className="px-5 py-10 md:px-10"
      style={{
        background: "var(--indigo-ancestral)",
        borderBlock: "1px solid rgba(201,168,76,0.12)",
      }}
    >
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className="h-display text-3xl md:text-4xl" style={{ color: "var(--or-ancestral)" }}>
              {item.value}
            </p>
            <p className="eyebrow mt-3" style={{ color: "rgba(254,252,240,0.72)" }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- LE GESTE ---------- */
export function LeGeste() {
  const t = useTranslations("home.gesture");

  return (
    <section className="px-5 py-24 md:px-10 bg-gradient-totem">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="body-copy mt-12 space-y-5 md:text-lg" style={{ color: "var(--ivoire)" }}>
            <p>{t("body1")}</p>
            <p>{t("body2")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-14">
            <SectionDivider />
            <p className="quote-italic text-xl md:text-2xl leading-relaxed">
              {t("quoteLine1")}
              <br />
              {t("quoteLine2")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- LE MANIFESTE (enriched landing block) ---------- */
export function Manifeste() {
  const t = useTranslations("home.manifest");
  const manifesteLines = t.raw("items") as ManifestItem[];

  return (
    <section className="px-5 py-24 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <Ornament />
            <h2
              className="h-display text-3xl md:text-5xl mt-6"
              style={{ color: "var(--or-ancestral)" }}
            >
              {t("title")}
            </h2>
            <p className="quote-italic mt-6 text-lg md:text-xl">{t("subtitle")}</p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {manifesteLines.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.1}>
              <article className="card-totem h-full flex flex-col gap-4">
                <span className="h-display text-5xl" style={{ color: "rgba(201,168,76,0.3)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="h-display text-2xl" style={{ color: "var(--or-pale)" }}>
                  {m.title}
                </h3>
                <p className="card-copy md:text-[17px]" style={{ color: "rgba(254,252,240,0.85)" }}>
                  {m.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- L'EXPÉRIENCE ---------- */
export function Experience() {
  const t = useTranslations("home.experience");
  const steps = (t.raw("steps") as StepText[]).map((step, index) => ({
    ...step,
    n: String(index + 1).padStart(2, "0"),
  }));

  return (
    <section
      id="experience"
      className="px-5 py-24 md:px-10"
      style={{ background: "var(--indigo-ancestral)" }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
              {t("title")}
            </h2>
            <p className="quote-italic mt-6 text-lg md:text-xl">
              {t("subtitleLine1")}
              <br />
              {t("subtitleLine2")}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <article className="card-totem h-full flex flex-col gap-6">
                <span className="h-display text-5xl" style={{ color: "rgba(201,168,76,0.3)" }}>
                  {s.n}
                </span>
                <h3 className="h-display text-2xl" style={{ color: "var(--or-pale)" }}>
                  {s.title}
                </h3>
                <p className="card-copy md:text-[17px]" style={{ color: "rgba(254,252,240,0.85)" }}>
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

/* ---------- GARANTIES ---------- */
export function Assurances() {
  const t = useTranslations("home.assurances");
  const items = (t.raw("items") as AssuranceItem[]).map((item, index) => ({
    ...item,
    n: String(index + 1).padStart(2, "0"),
  }));

  return (
    <section className="px-5 py-24 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
              {t("eyebrow")}
            </p>
            <h2 className="h-display mt-5 text-3xl md:text-5xl" style={{ color: "var(--ivoire)" }}>
              {t("title")}
            </h2>
            <p className="quote-italic mx-auto mt-6 max-w-2xl text-lg md:text-xl">
              {t("subtitle")}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-4">
          {items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.08}>
              <article className="card-totem flex h-full flex-col gap-5">
                <span className="h-display text-4xl" style={{ color: "rgba(201,168,76,0.28)" }}>
                  {item.n}
                </span>
                <h3 className="h-display text-2xl" style={{ color: "var(--or-pale)" }}>
                  {item.title}
                </h3>
                <p className="card-copy" style={{ color: "rgba(254,252,240,0.84)" }}>
                  {item.text}
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
export function Oeuvre() {
  const t = useTranslations("home.artwork");
  const pieceImages = [oeuvreParchemin, oeuvreVisuelle];
  const pieces = (t.raw("pieces") as PieceText[]).map((piece, index) => ({
    ...piece,
    image: pieceImages[index] ?? oeuvreParchemin,
  }));

  return (
    <section className="px-5 py-24 md:px-10" style={{ background: "var(--nuit-profonde)" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
              {t("title")}
            </h2>
            <p
              className="mt-6 text-base md:text-lg leading-relaxed"
              style={{ color: "var(--ivoire)" }}
            >
              {t("description")}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {pieces.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.12}>
              <article
                className="card-totem h-full flex flex-col overflow-hidden"
                style={{ padding: 0 }}
              >
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <img
                    src={p.image}
                    alt={p.alt}
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
          <div className="mt-12 text-center">
            <SectionDivider />
            <p
              className="text-sm md:text-base italic"
              style={{ color: "var(--or-pale)", fontFamily: "var(--font-subtext)" }}
            >
              {t("certificate")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- OFFRES ---------- */
export function Offres() {
  const locale = useLocale();
  const t = useTranslations("home.offers");
  const offers = t.raw("items") as OfferText[];

  return (
    <section
      id="offres"
      className="px-5 py-24 md:px-10"
      style={{ background: "var(--indigo-ancestral)" }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
              {t("title")}
            </h2>
            <p className="quote-italic mt-6 text-lg md:text-xl">{t("subtitle")}</p>
          </div>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-5 md:grid-cols-3">
          {offers.map((o, i) => (
            <Reveal
              key={o.name}
              delay={i * 0.12}
              className={o.featured ? "md:-translate-y-4 order-first md:order-none" : ""}
            >
              <article
                className="card-totem h-full flex flex-col text-left"
                style={{
                  borderColor: o.featured ? "var(--or-ancestral)" : "rgba(201,168,76,0.35)",
                  boxShadow: o.featured ? "0 0 40px rgba(201,168,76,0.15)" : "none",
                  background: o.featured
                    ? "linear-gradient(180deg, #1A1A2E 0%, #14142a 100%)"
                    : "var(--indigo-ancestral)",
                  minHeight: 310,
                }}
              >
                {o.featured && (
                  <div className="mb-5 -mt-2 text-left">
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

                <h3
                  className="h-display text-2xl uppercase tracking-[0.08em]"
                  style={{ color: "var(--ivoire)" }}
                >
                  {o.name}
                </h3>

                <p className="quote-italic mt-5 text-base">{o.subtitle}</p>
                <p
                  className="h-display mt-6 text-5xl"
                  style={{ color: o.featured ? "var(--or-ancestral)" : "var(--ivoire)" }}
                >
                  {o.price}€
                </p>
                <ul className="my-7 flex flex-1 flex-col gap-3">
                  {o.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-[14px] leading-relaxed"
                      style={{ color: "rgba(254,252,240,0.84)" }}
                    >
                      <span style={{ color: "var(--or-ancestral)" }}>•</span> {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Link
                    href={`/${locale}/janua_vitae?mode=signup&redirect=/${locale}/via_sapientiae`}
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
          <p className="caption mt-10 text-center">{t("footnote")}</p>
        </Reveal>

        <Reveal delay={0.25}>
          <article
            className="mx-auto mt-12 max-w-3xl border px-6 py-8 text-center md:px-10"
            style={{ borderColor: "rgba(201,168,76,0.22)", background: "rgba(13,13,26,0.32)" }}
          >
            <p className="eyebrow" style={{ color: "var(--or-ancestral)" }}>
              {t("living.eyebrow")}
            </p>
            <h3 className="h-display mt-3 text-3xl md:text-4xl" style={{ color: "var(--ivoire)" }}>
              {t("living.title")}
            </h3>
            <p className="quote-italic mx-auto mt-4 max-w-xl text-lg">{t("living.subtitle")}</p>
            <p
              className="body-copy mx-auto mt-5 max-w-2xl text-[15px]"
              style={{ color: "rgba(254,252,240,0.78)" }}
            >
              {t("living.text")}
            </p>
            <p className="h-display mt-7 text-4xl" style={{ color: "var(--or-ancestral)" }}>
              +9€ <span className="text-2xl">/ an</span>
            </p>
            <p className="caption mt-2">{t("living.note")}</p>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- LA MAISON ---------- */

export function Maison() {
  const t = useTranslations("home.house");
  const paragraphs = t.raw("paragraphs") as string[];
  const pillars = t.raw("pillars") as HousePillar[];

  return (
    <section
      id="maison"
      className="px-5 py-24 md:px-10"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
              {t("title")}
            </h2>
            <p className="quote-italic mt-5 text-lg md:text-xl">{t("subtitle")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="mx-auto mt-12 max-w-3xl space-y-5 text-center text-base leading-[1.85] md:text-lg"
            style={{ color: "var(--ivoire)" }}
          >
            {paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                style={
                  index === paragraphs.length - 1 ? { color: "rgba(254,252,240,0.8)" } : undefined
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="card-totem h-full">
                <h3 className="h-display text-2xl" style={{ color: "var(--or-pale)" }}>
                  {pillar.title}
                </h3>
                <p className="card-copy mt-4" style={{ color: "rgba(254,252,240,0.84)" }}>
                  {pillar.text}
                </p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="quote-italic mx-auto mt-12 max-w-2xl text-center text-xl md:text-2xl">
            {t("quote")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- AVIS ---------- */
export function Avis() {
  const t = useTranslations("home.testimonials");
  const testimonials = t.raw("items") as TestimonialText[];

  return (
    <section className="px-5 py-24 md:px-10" style={{ background: "var(--indigo-ancestral)" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <h2
            className="h-display text-3xl md:text-5xl text-center"
            style={{ color: "var(--or-ancestral)" }}
          >
            {t("title")}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
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
                <div
                  className="mt-auto pt-4 border-t"
                  style={{ borderColor: "rgba(201,168,76,0.15)" }}
                >
                  <p className="text-sm" style={{ color: "var(--ivoire)" }}>
                    {t.a}
                  </p>
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
export function FAQ() {
  const t = useTranslations("home.faq");
  const categories = t.raw("categories") as FAQCategory[];

  return (
    <section
      id="faq"
      className="px-5 py-24 md:px-10"
      style={{ background: "var(--nuit-profonde)" }}
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--or-ancestral)" }}>
              {t("title")}
            </h2>
            <p className="quote-italic mt-5 text-lg md:text-xl">{t("subtitle")}</p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {categories.map((category, categoryIndex) => (
            <Reveal key={category.title} delay={categoryIndex * 0.08}>
              <div>
                <h3
                  className="h-display border-b pb-4 text-2xl"
                  style={{ color: "var(--or-pale)", borderColor: "rgba(201,168,76,0.24)" }}
                >
                  {category.title}
                </h3>
                <div>
                  {category.items.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b" style={{ borderColor: "rgba(201,168,76,0.16)" }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-5 py-5 text-left"
      >
        <span
          className="text-base font-semibold leading-relaxed"
          style={{ color: "var(--ivoire)" }}
        >
          {q}
        </span>
        <span className="shrink-0" style={{ color: "var(--or-ancestral)" }}>
          {open ? <Minus size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
        </span>
      </button>
      {open && (
        <p
          className="pb-5 pr-8 text-[15px] leading-[1.8]"
          style={{ color: "rgba(254,252,240,0.82)" }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

export function CtaFinal() {
  const locale = useLocale();
  const t = useTranslations("home.ctaFinal");
  const brand = useTranslations("brand");

  return (
    <section className="relative overflow-hidden px-5 py-24 md:px-10 bg-gradient-totem">
      <GoldParticles count={14} />
      <div className="max-w-3xl mx-auto text-center relative flex flex-col items-center gap-8">
        <Reveal>
          <img src={totemLogo} alt={brand("name")} className="w-[200px] md:w-[260px] h-auto" />
        </Reveal>
        <Ornament />
        <Reveal delay={0.1}>
          <h2 className="h-display text-3xl md:text-5xl" style={{ color: "var(--ivoire)" }}>
            {t("title")}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="quote-italic text-xl md:text-2xl">
            {t("subtitleLine1")}
            <br />
            {t("subtitleLine2")}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <Link
            href={`/${locale}/janua_vitae?mode=signup&redirect=/${locale}/via_sapientiae`}
            className="btn-primary animate-pulse-glow !px-14 !py-5"
          >
            {t("button")}
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </Reveal>
        <Reveal delay={0.4}>
          <p className="caption mt-2">{t("caption")}</p>
        </Reveal>
      </div>
    </section>
  );
}
