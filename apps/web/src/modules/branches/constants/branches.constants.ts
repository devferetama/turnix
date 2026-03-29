import type {
  BranchRecord,
  ListBranchesQuery,
} from "@/modules/branches/types/branch.types";

export const branchesQueryKeys = {
  all: ["branches"] as const,
  list: (
    tenantId?: string,
    query: ListBranchesQuery = DEFAULT_LIST_BRANCHES_QUERY,
  ) => {
    const normalized = normalizeListBranchesQuery(query);

    return [
      ...branchesQueryKeys.all,
      "list",
      tenantId ?? "all",
      normalized.search,
      normalized.isActive,
    ] as const;
  },
  detail: (tenantId?: string, branchId?: string) =>
    [
      ...branchesQueryKeys.all,
      "detail",
      tenantId ?? "all",
      branchId ?? "unknown",
    ] as const,
};

export const DEFAULT_LIST_BRANCHES_QUERY: ListBranchesQuery = {};

export function normalizeListBranchesQuery(query: ListBranchesQuery = {}) {
  return {
    search: query.search?.trim() ?? "",
    isActive:
      query.isActive === undefined ? "all" : query.isActive ? "true" : "false",
  } as const;
}

export const branchSeedData: BranchRecord[] = [
  {
    id: "br_main_office",
    tenantId: "tenant_municipal_services",
    slug: "main-office",
    name: "Main Office",
    description: "Primary branch for in-person municipal attention.",
    timezone: "America/Santiago",
    addressLine1: "123 Main Street",
    addressLine2: "Floor 1",
    city: "Santiago",
    state: "Metropolitan Region",
    country: "Chile",
    postalCode: "8320000",
    isActive: true,
    createdAt: "2026-03-02T09:30:00.000Z",
    updatedAt: "2026-03-18T09:30:00.000Z",
  },
  {
    id: "br_north_center",
    tenantId: "tenant_municipal_services",
    slug: "north-service-center",
    name: "North Service Center",
    description: "Distributed branch focused on document intake and orientation.",
    timezone: "America/Santiago",
    addressLine1: "45 North Avenue",
    addressLine2: null,
    city: "Quilicura",
    state: "Metropolitan Region",
    country: "Chile",
    postalCode: "8700000",
    isActive: true,
    createdAt: "2026-03-06T11:00:00.000Z",
    updatedAt: "2026-03-20T11:00:00.000Z",
  },
  {
    id: "br_remote_support",
    tenantId: "tenant_municipal_services",
    slug: "remote-support-desk",
    name: "Remote Support Desk",
    description: "Remote-only operational branch for digital guidance and support.",
    timezone: "America/Santiago",
    addressLine1: null,
    addressLine2: null,
    city: "Santiago",
    state: "Metropolitan Region",
    country: "Chile",
    postalCode: null,
    isActive: false,
    createdAt: "2026-03-10T15:45:00.000Z",
    updatedAt: "2026-03-24T15:45:00.000Z",
  },
];
