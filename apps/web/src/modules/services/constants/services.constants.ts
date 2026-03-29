import type { ListServicesQuery, ServiceRecord } from "@/modules/services/types/service.types";

export const servicesQueryKeys = {
  all: ["services"] as const,
  list: (tenantId?: string, query: ListServicesQuery = DEFAULT_LIST_SERVICES_QUERY) => {
    const normalized = normalizeListServicesQuery(query);

    return [
      ...servicesQueryKeys.all,
      "list",
      tenantId ?? "all",
      normalized.search,
      normalized.visibility,
      normalized.isActive,
      normalized.categoryId,
      normalized.branchId,
    ] as const;
  },
  detail: (tenantId?: string, serviceId?: string) =>
    [...servicesQueryKeys.all, "detail", tenantId ?? "all", serviceId ?? "unknown"] as const,
};

export const DEFAULT_LIST_SERVICES_QUERY: ListServicesQuery = {};

export function normalizeListServicesQuery(query: ListServicesQuery = {}) {
  return {
    search: query.search?.trim() ?? "",
    visibility: query.visibility ?? "all",
    isActive:
      query.isActive === undefined ? "all" : query.isActive ? "true" : "false",
    categoryId: query.categoryId?.trim() ?? "",
    branchId: query.branchId?.trim() ?? "",
  } as const;
}

export const serviceSeedData: ServiceRecord[] = [
  {
    id: "svc_civil_records",
    tenantId: "tenant_municipal_services",
    categoryId: null,
    branchId: null,
    slug: "civil-records-assistance",
    name: "Civil Records Assistance",
    description:
      "Document intake and guided assistance for civil registry requests.",
    visibility: "PUBLIC",
    mode: "IN_PERSON",
    durationMinutes: 20,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 5,
    slotCapacity: 1,
    allowOnlineBooking: true,
    requiresApproval: false,
    requiresAuthentication: false,
    allowsCancellation: true,
    allowsReschedule: true,
    isActive: true,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "svc_building_permits",
    tenantId: "tenant_municipal_services",
    categoryId: null,
    branchId: null,
    slug: "building-permit-orientation",
    name: "Building Permit Orientation",
    description:
      "Initial review guidance before formal permit intake with planning staff.",
    visibility: "INTERNAL",
    mode: "IN_PERSON",
    durationMinutes: 30,
    bufferBeforeMinutes: 10,
    bufferAfterMinutes: 10,
    slotCapacity: 1,
    allowOnlineBooking: false,
    requiresApproval: true,
    requiresAuthentication: true,
    allowsCancellation: true,
    allowsReschedule: true,
    isActive: true,
    createdAt: "2026-03-03T09:00:00.000Z",
    updatedAt: "2026-03-16T09:00:00.000Z",
  },
  {
    id: "svc_social_programs",
    tenantId: "tenant_municipal_services",
    categoryId: null,
    branchId: null,
    slug: "social-benefits-guidance",
    name: "Social Benefits Guidance",
    description:
      "Remote or hybrid orientation for social support program applications.",
    visibility: "PUBLIC",
    mode: "HYBRID",
    durationMinutes: 45,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 10,
    slotCapacity: 3,
    allowOnlineBooking: true,
    requiresApproval: false,
    requiresAuthentication: false,
    allowsCancellation: true,
    allowsReschedule: true,
    isActive: true,
    createdAt: "2026-03-04T11:30:00.000Z",
    updatedAt: "2026-03-19T11:30:00.000Z",
  },
  {
    id: "svc_environmental_claims",
    tenantId: "tenant_municipal_services",
    categoryId: null,
    branchId: null,
    slug: "environmental-claims-desk",
    name: "Environmental Claims Desk",
    description:
      "Assisted intake for claims and inspections coordinated with environmental teams.",
    visibility: "PRIVATE",
    mode: "REMOTE",
    durationMinutes: 25,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
    slotCapacity: 1,
    allowOnlineBooking: false,
    requiresApproval: true,
    requiresAuthentication: true,
    allowsCancellation: false,
    allowsReschedule: true,
    isActive: false,
    createdAt: "2026-03-05T08:15:00.000Z",
    updatedAt: "2026-03-21T08:15:00.000Z",
  },
];
