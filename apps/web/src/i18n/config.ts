export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";
export const LOCALE_COOKIE_NAME = "turnix-locale";
export const LOCALE_HEADER_NAME = "x-turnix-locale";

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getIntlLocale(locale: Locale) {
  return locale === "es" ? "es-CL" : "en-US";
}
