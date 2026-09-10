import "server-only";

const dictionaries = {
  fr: () => import("./dictionaries/fr.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const locales = Object.keys(dictionaries) as Locale[];

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

// Le type exact du dictionnaire (déduit directement de fr.json, grâce à
// resolveJsonModule dans tsconfig). Chaque section peut ensuite typer sa
// prop avec juste sa tranche, ex : dict: Dictionary["hero"].
export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
