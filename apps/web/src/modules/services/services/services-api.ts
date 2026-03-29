import { isBackendEnabled } from "@/config/env";
import { ApiError, apiRequest } from "@/lib/api/client";
import { sleep } from "@/lib/utils";
import { serviceSeedData } from "@/modules/services/constants/services.constants";
import type { TenantApiContext } from "@/modules/tenant/types/tenant.types";
import type {
  CreateServiceInput,
  ListServicesQuery,
  ServiceRecord,
  UpdateServiceInput,
} from "@/modules/services/types/service.types";

function buildServicesQueryParams(filters: ListServicesQuery = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.visibility) {
    params.set("visibility", filters.visibility);
  }

  if (filters.isActive !== undefined) {
    params.set("isActive", String(filters.isActive));
  }

  if (filters.categoryId?.trim()) {
    params.set("categoryId", filters.categoryId.trim());
  }

  if (filters.branchId?.trim()) {
    params.set("branchId", filters.branchId.trim());
  }

  return params;
}

function matchesServicesQuery(service: ServiceRecord, filters: ListServicesQuery = {}) {
  const normalizedSearch = filters.search?.trim().toLowerCase();

  return (
    (filters.isActive === undefined || service.isActive === filters.isActive) &&
    (!filters.visibility || service.visibility === filters.visibility) &&
    (!filters.categoryId || service.categoryId === filters.categoryId) &&
    (!filters.branchId || service.branchId === filters.branchId) &&
    (!normalizedSearch ||
      service.name.toLowerCase().includes(normalizedSearch) ||
      service.slug.toLowerCase().includes(normalizedSearch))
  );
}

function getMockTenantId(tenantId?: string) {
  return tenantId ?? "tenant_municipal_services";
}

function createMockServiceId() {
  return `svc_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureMockSlugAvailable(
  tenantId: string,
  slug: string,
  excludedServiceId?: string,
) {
  const existing = serviceSeedData.find(
    (service) =>
      service.tenantId === tenantId &&
      service.slug === slug &&
      service.id !== excludedServiceId,
  );

  if (existing) {
    throw new ApiError(
      `Request failed because slug "${slug}" already exists.`,
      409,
      {
        message: `A service with slug "${slug}" already exists in this tenant`,
      },
    );
  }
}

function sortServices(services: ServiceRecord[]) {
  return [...services].sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });
}

export async function getServices({
  accessToken,
  tenantId,
  filters,
  tenant,
}: {
  accessToken?: string;
  tenantId?: string;
  filters?: ListServicesQuery;
  tenant?: TenantApiContext;
} = {}) {
  if (isBackendEnabled()) {
    const params = buildServicesQueryParams(filters);

    return apiRequest<ServiceRecord[]>(
      `/api/v1/services${params.size ? `?${params.toString()}` : ""}`,
      {
        method: "GET",
        accessToken,
        tenant,
      },
    );
  }

  await sleep(120);

  return sortServices(
    serviceSeedData.filter((service) =>
      service.tenantId === getMockTenantId(tenantId)
        ? matchesServicesQuery(service, filters)
        : false,
    ),
  );
}

export async function getServiceById({
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
    return apiRequest<ServiceRecord>(`/api/v1/services/${id}`, {
      method: "GET",
      accessToken,
      tenant,
    });
  }

  await sleep(100);

  const service = serviceSeedData.find(
    (item) => item.id === id && item.tenantId === getMockTenantId(tenantId),
  );

  if (!service) {
    throw new ApiError("Service not found.", 404, {
      message: "Service not found",
    });
  }

  return service;
}

export async function createService({
  input,
  accessToken,
  tenantId,
  tenant,
}: {
  input: CreateServiceInput;
  accessToken?: string;
  tenantId?: string;
  tenant?: TenantApiContext;
}) {
  if (isBackendEnabled()) {
    return apiRequest<ServiceRecord>("/api/v1/services", {
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
  const service: ServiceRecord = {
    id: createMockServiceId(),
    tenantId: resolvedTenantId,
    categoryId: input.categoryId ?? null,
    branchId: input.branchId ?? null,
    slug: input.slug,
    name: input.name,
    description: input.description ?? null,
    visibility: input.visibility ?? "PUBLIC",
    mode: input.mode ?? "IN_PERSON",
    durationMinutes: input.durationMinutes,
    bufferBeforeMinutes: input.bufferBeforeMinutes ?? 0,
    bufferAfterMinutes: input.bufferAfterMinutes ?? 0,
    slotCapacity: input.slotCapacity ?? 1,
    allowOnlineBooking: input.allowOnlineBooking ?? true,
    requiresApproval: input.requiresApproval ?? false,
    requiresAuthentication: input.requiresAuthentication ?? false,
    allowsCancellation: input.allowsCancellation ?? true,
    allowsReschedule: input.allowsReschedule ?? true,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  serviceSeedData.unshift(service);

  return service;
}

export async function updateService({
  id,
  input,
  accessToken,
  tenantId,
  tenant,
}: {
  id: string;
  input: UpdateServiceInput;
  accessToken?: string;
  tenantId?: string;
  tenant?: TenantApiContext;
}) {
  if (isBackendEnabled()) {
    return apiRequest<ServiceRecord>(`/api/v1/services/${id}`, {
      method: "PATCH",
      accessToken,
      body: input,
      tenant,
    });
  }

  await sleep(180);

  const resolvedTenantId = getMockTenantId(tenantId);
  const index = serviceSeedData.findIndex(
    (service) => service.id === id && service.tenantId === resolvedTenantId,
  );

  if (index === -1) {
    throw new ApiError("Service not found.", 404, {
      message: "Service not found",
    });
  }

  if (input.slug) {
    ensureMockSlugAvailable(resolvedTenantId, input.slug, id);
  }

  const current = serviceSeedData[index];
  const updated: ServiceRecord = {
    ...current,
    ...input,
    categoryId:
      input.categoryId === undefined ? current.categoryId : input.categoryId ?? null,
    branchId:
      input.branchId === undefined ? current.branchId : input.branchId ?? null,
    description:
      input.description === undefined ? current.description : input.description ?? null,
    updatedAt: new Date().toISOString(),
  };

  serviceSeedData[index] = updated;

  return updated;
}
