import type { Locale } from "@/app/[lang]/dictionaries";

type LegalContent = {
  title: string;
  subtitle: string;
  lastUpdated: string;
  articles: { title: string; body: (string | { text: string; href: string })[] }[];
};

type Props = {
  dict: LegalContent;
  lang: Locale;
};

// Chaque paragraphe est un tableau de "morceaux" : soit du texte brut,
// soit { text, href } pour un lien inline (ex: adresse email, autre page légale).
function renderBody(body: LegalContent["articles"][number]["body"], lang: Locale) {
  return body.map((part, i) =>
    typeof part === "string" ? (
      part
    ) : (
      <a
        key={i}
        href={part.href.startsWith("mailto:") ? part.href : `/${lang}${part.href}`}
        className="text-or"
      >
        {part.text}
      </a>
    )
  );
}

// Nav (fixe, transparente en haut) et Footer viennent du layout partagé
// (marketing) — cette page ne fournit que son propre contenu, avec assez
// de padding en haut pour dégager la barre de navigation.
export default function LegalPage({ dict, lang }: Props) {
  return (
    <div className="min-h-screen bg-nuit pt-32 lg:pt-40">
      {/* en-tête */}
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 pb-14 lg:px-16">
        <h1 className="font-display text-4xl text-ivoire lg:text-5xl">{dict.title}</h1>
        <p className="font-display text-xl italic text-orpale">{dict.subtitle}</p>
        <p className="mt-1 text-xs text-grisclair">{dict.lastUpdated}</p>
      </div>

      {/* articles */}
      <div className="mx-auto flex max-w-2xl flex-col px-6 pb-24 lg:px-16">
        {dict.articles.map((article) => (
          <div key={article.title} className="flex flex-col gap-3 py-7">
            <p className="font-medium text-ivoire">{article.title}</p>
            <p className="text-sm leading-relaxed text-grisclair">
              {renderBody(article.body, lang)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
