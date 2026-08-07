/**
 * Chemin de l'audio d'une question de parcours, selon la langue.
 *
 * Les voix françaises vivent à la racine du dossier de parcours, les voix
 * anglaises dans son sous-dossier `en/` :
 *   public/assets/adulte/q1.mp3      → FR, question 1 du parcours adulte
 *   public/assets/adulte/en/q1.mp3   → EN, question 1 du parcours adulte
 *
 * Tant qu'un fichier anglais n'a pas été déposé, le lecteur retombe sur la
 * voix française (voir `fallbackSrc` de QuestionAudio) : la question reste
 * audible au lieu d'un lecteur muet.
 */
export type AudioTrack = "adulte" | "junior";

export function questionAudioSrc(track: AudioTrack, n: number, locale: string): string {
  const base = `/assets/${track}/q${n}.mp3`;
  return locale === "en" ? `/assets/${track}/en/q${n}.mp3` : base;
}

/** Voix de repli (toujours le français) quand la piste demandée manque. */
export function questionAudioFallbackSrc(track: AudioTrack, n: number): string {
  return `/assets/${track}/q${n}.mp3`;
}
