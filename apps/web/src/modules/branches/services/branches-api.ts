import { isBackendEnabled } from "@/config/env";
import { ApiError, apiRequest } from "@/lib/api/client";
import { sleep } from "@/lib/utils";
import { branchSeedData } from "@/modules/branches/constants/branches.constants";
import type { TenantApiContext } from "@/modules/tenant/types/tenant.types";
import type {
  BranchRecord,
  CreateBranchInput,
  ListBranchesQuery,
  UpdateBranchInput,
} from "@/modules/branches/types/branch.types";

function buildBranchesQueryParams(filters: ListBranchesQuery = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.isActive !== undefined) {
    params.set("isActive", String(filters.isActive));
  }

  return params;
}

function matchesBranchesQuery(
  branch: BranchRecord,
  filters: ListBranchesQuery = {},
) {
  const normalizedSearch = filters.search?.trim().toLowerCase();

  return (
    (filters.isActive === undefined || branch.isActive === filters.isActive) &&
    (!normalizedSearch ||
      branch.name.toLowerCase().includes(normalizedSearch) ||
      branch.slug.toLowerCase().includes(normalizedSearch))
  );
}

function getMockTenantId(tenantId?: string) {
  return tenantId ?? "tenant_municipal_services";
}

function createMockBranchId() {
  return `br_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureMockSlugAvailable(
  tenantId: string,
  slug: string,
  excludedBranchId?: string,
) {
  const existing = branchSeedData.find(
    (branch) =>
      branch.tenantId === tenantId &&
      branch.slug === slug &&
      branch.id !== excludedBranchId,
  );

  if (existing) {
    throw new ApiError(
      `Request failed because slug "${slug}" already exists.`,
      409,
      {
        message: `A branch with slug "${slug}" already exists in this tenant`,
      },
    );
  }
}

function sortBranches(branches: BranchRecord[]) {
  return [...branches].sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });
}

export async function getBranches({
  accessToken,
  tenantId,
  filters,
  tenant,
}: {
  accessToken?: string;
  tenantId?: string;
  filters?: ListBranchesQuery;
  tenant?: TenantApiContext;
} = {}) {
  if (isBackendEnabled()) {
    const params = buildBranchesQueryParams(filters);

    return apiRequest<BranchRecord[]>(
      `/api/v1/branches${params.size ? `?${params.toString()}` : ""}`,
      {
        method: "GET",
        accessToken,
        tenant,
      },
    );
  }

  await sleep(120);

  return sortBranches(
    branchSeedData.filter((branch) =>
      branch.tenantId === getMockTenantId(tenantId)
        ? matchesBranchesQuery(branch, filters)
        : false,
    ),
  );
}

export async function getBranchById({
  id,
  accessToken,
  tenantId,
  tenant,
}: {
  id: string;
  accessToken?: string;
  tenantId?: string;
  tenant?: TenantApiContext;
}) {
  if (isBackendEnabled()) {
    return apiRequest<BranchRecord>(`/api/v1/branches/${id}`, {
      method: "GET",
      accessToken,
      tenant,
    });
  }

  await sleep(100);

  const branch = branchSeedData.find(
    (item) => item.id === id && item.tenantId === getMockTenantId(tenantId),
  );

  if (!branch) {
    throw new ApiError("Branch not found.", 404, {
      message: "Branch not found",
    });
  }

  return branch;
}

export async function createBranch({
  input,
  accessToken,
  tenantId,
  tenant,
}: {
  input: CreateBranchInput;
  accessToken?: string;
  tenantId?: string;
  tenant?: TenantApiContext;
}) {
  if (isBackendEnabled()) {
    return apiRequest<BranchRecord>("/api/v1/branches", {
      method: "POST",
      accessToken,
      body: input,
      tenant,
    });
  }

  await sleep(180);

  const resolvedTenantId = getMockTenantId(tenantId);
  ensureMockSlugAvailable(resolvedTenantId, input.slug);

  const now = new Date().toISOString();
  const branch: BranchRecord = {
    id: createMockBranchId(),
    tenantId: resolvedTenantId,
    slug: input.slug,
    name: input.name,
    description: input.description ?? null,
    timezone: input.timezone ?? null,
    addressLine1: input.addressLine1 ?? null,
    addressLine2: input.addressLine2 ?? null,
    city: input.city ?? null,
    state: input.state ?? null,
    country: input.country ?? null,
    postalCode: input.postalCode ?? null,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  branchSeedData.unshift(branch);

  return branch;
}

export async function updateBranch({
  id,
  input,
  accessToken,
  tenantId,
  tenant,
}: {
  id: string;
  input: UpdateBranchInput;
  accessToken?: string;
  tenantId?: string;
  tenant?: TenantApiContext;
}) {
  if (isBackendEnabled()) {
    return apiRequest<BranchRecord>(`/api/v1/branches/${id}`, {
      method: "PATCH",
      accessToken,
      body: input,
      tenant,
    });
  }

  await sleep(180);

  const resolvedTenantId = getMockTenantId(tenantId);
  const index = branchSeedData.findIndex(
    (branch) => branch.id === id && branch.tenantId === resolvedTenantId,
  );

  if (index === -1) {
    throw new ApiError("Branch not found.", 404, {
      message: "Branch not found",
    });
  }

  if (input.slug) {
    ensureMockSlugAvailable(resolvedTenantId, input.slug, id);
  }

  const current = branchSeedData[index];
  const updated: BranchRecord = {
    ...current,
    ...input,
    description:
      input.description === undefined ? current.description : input.description ?? null,
    timezone: input.timezone === undefined ? current.timezone : input.timezone ?? null,
    addressLine1:
      input.addressLine1 === undefined
        ? current.addressLine1
        : input.addressLine1 ?? null,
    addressLine2:
      input.addressLine2 === undefined
        ? current.addressLine2
        : input.addressLine2 ?? null,
    city: input.city === undefined ? current.city : input.city ?? null,
    state: input.state === undefined ? current.state : input.state ?? null,
    country: input.country === undefined ? current.country : input.country ?? null,
    postalCode:
      input.postalCode === undefined
        ? current.postalCode
        : input.postalCode ?? null,
    updatedAt: new Date().toISOString(),
  };

  branchSeedData[index] = updated;

  return updated;
}
