import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicTotem } from "@/components/sections/PublicTotem";
import { readPublicShare } from "@/lib/server/totem-sharing";
import { sharePath, shareTitle } from "@/lib/totem-sharing";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ lang: string; slug: string; token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, token } = await params;
  const share = await readPublicShare(token);
  if (!share) return { title: "Totem Ancestral", robots: { index: false, follow: false }, openGraph: null, twitter: null };
  const title = shareTitle(share.display_name, share.totem_name, lang);
  const description = lang === "en"
    ? `Discover a glimpse of ${share.display_name}’s ancestral world.`
    : `Découvrez un aperçu de l’univers ancestral de ${share.display_name}.`;
  const url = `${siteUrl()}${sharePath(lang, share.slug, share.token)}`;
  const image = { url: `${url}/image?format=social`, width: 1200, height: 630, type: "image/jpeg", alt: title };
  return {
    title: { absolute: `${title} | Totem Ancestral` }, description,
    alternates: { canonical: url }, robots: { index: false, follow: false },
    openGraph: { title, description, url, type: "website", siteName: "Totem Ancestral",
      locale: lang === "en" ? "en_US" : "fr_FR", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [{ url: image.url, alt: title }] },
  };
}

export default async function Page({ params }: Props) {
  const { lang, token } = await params;
  const share = await readPublicShare(token);
  if (!share) notFound();
  return <PublicTotem lang={lang} title={shareTitle(share.display_name, share.totem_name, lang)}
    excerpt={share.excerpt} image={`${sharePath(lang, share.slug, token)}/image`} />;
}
