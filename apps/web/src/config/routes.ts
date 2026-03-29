import type { Route } from "next";

export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  appointments: "/appointments",
  services: "/services",
  branches: "/branches",
  settings: "/settings",
  book: "/book",
  bookingServices: "/book/services",
  bookingNewAppointment: "/book/appointments/new",
  bookingConfirmation: "/book/confirmation",
  bookingLookup: "/book/lookup",
  bookingAppointmentBase: "/book/appointment",
  bookingAppointment: (code: string): Route =>
    `/book/appointment/${encodeURIComponent(code)}` as Route,
} as const;

export const PROTECTED_ROUTE_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.appointments,
  ROUTES.services,
  ROUTES.branches,
  ROUTES.settings,
] as const;

export const PUBLIC_ROUTE_PREFIXES = [
  ROUTES.home,
  ROUTES.book,
  ROUTES.bookingServices,
  ROUTES.bookingNewAppointment,
  ROUTES.bookingConfirmation,
  ROUTES.bookingLookup,
  ROUTES.bookingAppointmentBase,
  ROUTES.login,
] as const;

export function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
