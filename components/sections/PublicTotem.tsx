"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./PublicTotem.module.css";

export function PublicTotem({ title, excerpt, image, lang }: {
  title: string; excerpt: string; image: string; lang: string;
}) {
  useEffect(() => {
    const blockPrint = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") event.preventDefault();
    };
    document.addEventListener("keydown", blockPrint);
    return () => document.removeEventListener("keydown", blockPrint);
  }, []);

  return (
    <main className={styles.page}>
      <Link href={`/${lang}`} className={styles.brand}>TOTEM ANCESTRAL</Link>
      <article className={styles.artwork} onContextMenu={event => event.preventDefault()}
        onCopy={event => event.preventDefault()} onCut={event => event.preventDefault()}
        onDragStart={event => event.preventDefault()}>
        <h1>{title}</h1>
        {/* Native image keeps this revocable endpoint out of the Next image cache. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} draggable={false} width={800} height={900} />
        <p className={styles.excerpt}>{excerpt}</p>
      </article>
      <Link href={`/${lang}/offres`} className={styles.cta}>
        {lang === "en" ? "Discover my totem" : "Découvrir mon totem"}
      </Link>
    </main>
  );
}
