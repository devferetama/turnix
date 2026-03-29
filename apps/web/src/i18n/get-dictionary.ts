import "server-only";

import type { Locale } from "@/i18n/config";

const dictionaries = {
  en: () => import("@/i18n/dictionaries/en").then((module) => module.en),
  es: () => import("@/i18n/dictionaries/es").then((module) => module.es),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)[Locale]>>;

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
