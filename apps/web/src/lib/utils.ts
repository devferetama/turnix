import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { getIntlLocale, type Locale } from "@/i18n/config";

const DEFAULT_DISPLAY_TIMEZONE = "America/Santiago";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(value?: string | null) {
  if (!value) {
    return "TX";
  }

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function resolveDisplayTimeZone(timeZone?: string | null) {
  return timeZone?.trim() || DEFAULT_DISPLAY_TIMEZONE;
}

export function formatDateTime(
  value: string,
  locale: Locale = "es",
  timeZone?: string | null,
) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: resolveDisplayTimeZone(timeZone),
  }).format(new Date(value));
}

export function formatCompactDate(
  value: string,
  locale: Locale = "es",
  timeZone?: string | null,
) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: "short",
    day: "numeric",
    timeZone: resolveDisplayTimeZone(timeZone),
  }).format(new Date(value));
}

export function formatCalendarDate(
  value: string,
  locale: Locale = "es",
  timeZone?: string | null,
) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: resolveDisplayTimeZone(timeZone),
  }).format(new Date(value));
}

export function formatTimeRange(
  start: string,
  end: string,
  locale: Locale = "es",
  timeZone?: string | null,
) {
  const formatter = new Intl.DateTimeFormat(getIntlLocale(locale), {
    hour: "numeric",
    minute: "2-digit",
    timeZone: resolveDisplayTimeZone(timeZone),
  });

  return `${formatter.format(new Date(start))} - ${formatter.format(
    new Date(end),
  )}`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
