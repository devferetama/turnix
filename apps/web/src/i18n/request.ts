import "server-only";

import { cookies, headers } from "next/headers";

import {
  LOCALE_COOKIE_NAME,
  LOCALE_HEADER_NAME,
  defaultLocale,
  isSupportedLocale,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function getRequestLocale() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  const headerStore = await headers();
  const requestLocale = headerStore.get(LOCALE_HEADER_NAME);

  if (isSupportedLocale(requestLocale)) {
    return requestLocale;
  }

  return defaultLocale;
}

export async function getRequestDictionary() {
  const locale = await getRequestLocale();

  return {
    locale,
    dictionary: await getDictionary(locale),
  };
}
