import { match } from "@formatjs/intl-localematcher";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Negotiator from "negotiator";

import { ROUTES, isProtectedPath } from "@/config/routes";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_HEADER_NAME,
  defaultLocale,
  locales,
  isSupportedLocale,
} from "@/i18n/config";

const SESSION_COOKIE_NAMES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
  "__Secure-authjs.session-token",
  "authjs.session-token",
];

function hasSessionCookie(request: NextRequest) {
  return SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));
}

function getPreferredLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  const negotiatorHeaders = {
    "accept-language": request.headers.get("accept-language") ?? "",
  };

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  return match(languages, [...locales], defaultLocale);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const locale = getPreferredLocale(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER_NAME, locale);

  if (isProtectedPath(pathname) && !hasSessionCookie(request)) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
