import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

// Aligné sur l'ordre de dict.footer.links (Commander, Offres, La Maison, FAQ,
// Contact, CGV, Confidentialité, Mentions).
const hrefs = ["/inscription", "/offres", "/la-maison", "/faq", "/contact", "/cgv", "/confidentialite", "/mentions"];

export default function Footer({ dict, lang }: { dict: Dictionary["footer"]; lang: Locale }) {
  return (
    <footer className="bg-ivoire px-6 pb-12 pt-16 lg:px-16 lg:pb-12 lg:pt-18">
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
        <Brand lang={lang} size={50} textClassName="text-nuit" />

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-center">
          {dict.links.map((lien, i) => (
            <Link key={lien} href={`/${lang}${hrefs[i]}`} className="text-sm text-gris">
              {lien}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-2 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <p className="text-xs text-gris">{dict.copyright}</p>
        <p className="font-display text-sm italic text-or">{dict.tagline}</p>
      </div>
    </footer>
  );
}
