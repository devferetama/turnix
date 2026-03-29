import type { Route } from "next";

export const ROUTES = {
  home: "/" as Route,
  login: "/login" as Route,
  dashboard: "/dashboard" as Route,
  appointments: "/appointments" as Route,
  appointmentCreate: "/appointments/create" as Route,
  appointmentDetail: (appointmentId: string): Route =>
    `/appointments/${encodeURIComponent(appointmentId)}` as Route,
  services: "/services" as Route,
  serviceCreate: "/services/create" as Route,
  serviceDetail: (serviceId: string): Route =>
    `/services/${encodeURIComponent(serviceId)}` as Route,
  branches: "/branches" as Route,
  settings: "/settings" as Route,
  book: "/book" as Route,
  bookingServices: "/book/services" as Route,
  bookingNewAppointment: "/book/appointments/new" as Route,
  bookingConfirmation: "/book/confirmation" as Route,
  bookingLookup: "/book/lookup" as Route,
  bookingAppointmentBase: "/book/appointment" as Route,
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
