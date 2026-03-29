import { NextResponse } from "next/server";

import {
  LOCALE_COOKIE_NAME,
  defaultLocale,
  isSupportedLocale,
} from "@/i18n/config";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { locale?: string }
    | null;

  const locale = isSupportedLocale(payload?.locale)
    ? payload.locale
    : defaultLocale;

  const response = NextResponse.json({ ok: true, locale });
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}
