import type {
  ListPublicServiceSlotsQuery,
  ListPublicServicesQuery,
} from "@/modules/public-booking/types/public-booking.types";

export const publicBookingQueryKeys = {
  all: (tenantSlug?: string | null) =>
    ["public-booking", tenantSlug?.trim().toLowerCase() ?? "default"] as const,
  services: (
    tenantSlug?: string | null,
    query: ListPublicServicesQuery = DEFAULT_PUBLIC_SERVICES_QUERY,
  ) => {
    const normalized = normalizePublicServicesQuery(query);

    return [
      ...publicBookingQueryKeys.all(tenantSlug),
      "services",
      normalized.search,
      normalized.branchId,
      normalized.categoryId,
    ] as const;
  },
  slots: (
    tenantSlug?: string | null,
    serviceId?: string,
    query: ListPublicServiceSlotsQuery = DEFAULT_PUBLIC_SERVICE_SLOTS_QUERY,
  ) => {
    const normalized = normalizePublicServiceSlotsQuery(query);

    return [
      ...publicBookingQueryKeys.all(tenantSlug),
      "slots",
      serviceId ?? "unknown",
      normalized.dateFrom,
      normalized.dateTo,
      normalized.branchId,
    ] as const;
  },
  appointment: (tenantSlug?: string | null, code?: string) =>
    [
      ...publicBookingQueryKeys.all(tenantSlug),
      "appointment",
      code?.trim().toUpperCase() ?? "",
    ] as const,
};

export const DEFAULT_PUBLIC_SERVICES_QUERY: ListPublicServicesQuery = {};
export const DEFAULT_PUBLIC_SERVICE_SLOTS_QUERY: ListPublicServiceSlotsQuery =
  {};

export function normalizePublicServicesQuery(
  query: ListPublicServicesQuery = {},
) {
  return {
    search: query.search?.trim() ?? "",
    branchId: query.branchId?.trim() ?? "",
    categoryId: query.categoryId?.trim() ?? "",
  } as const;
}

export function normalizePublicServiceSlotsQuery(
  query: ListPublicServiceSlotsQuery = {},
) {
  return {
    dateFrom: query.dateFrom?.trim() ?? "",
    dateTo: query.dateTo?.trim() ?? "",
    branchId: query.branchId?.trim() ?? "",
  } as const;
}
