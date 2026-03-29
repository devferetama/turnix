import { env, isBackendEnabled } from "@/config/env";
import { ApiError, apiRequest } from "@/lib/api/client";
import { sleep } from "@/lib/utils";
import {
  DEFAULT_PUBLIC_SERVICE_SLOTS_QUERY,
  DEFAULT_PUBLIC_SERVICES_QUERY,
} from "@/modules/public-booking/constants/public-booking.constants";
import { normalizePublicAppointmentCode } from "@/modules/public-booking/schemas/public-booking.schema";
import type {
  CancelPublicAppointmentInput,
  CreatePublicAppointmentInput,
  ListPublicServiceSlotsQuery,
  ListPublicServicesQuery,
  PublicAppointmentConfirmation,
  PublicAppointmentLookupRecord,
  PublicBranchSummary,
  PublicServiceRecord,
  PublicServiceSlotRecord,
  ReschedulePublicAppointmentInput,
} from "@/modules/public-booking/types/public-booking.types";
import { serviceSeedData } from "@/modules/services/constants/services.constants";
import type { TenantApiContext } from "@/modules/tenant/types/tenant.types";

const mockBranches: PublicBranchSummary[] = [
  {
    id: "branch_central_service_hall",
    slug: "central-service-hall",
    name: "Central Service Hall",
    description: "Main downtown branch for in-person citizen services.",
    timezone: "America/Santiago",
    city: "Santiago",
    state: "Metropolitana",
    country: "Chile",
    postalCode: "8320000",
  },
  {
    id: "branch_north_service_point",
    slug: "north-service-point",
    name: "North Service Point",
    description: "Neighborhood branch focused on guided support programs.",
    timezone: "America/Santiago",
    city: "Santiago",
    state: "Metropolitana",
    country: "Chile",
    postalCode: "8380000",
  },
];

const publicServiceSeedData: PublicServiceRecord[] = serviceSeedData
  .filter(
    (service) =>
      service.visibility === "PUBLIC" &&
      service.allowOnlineBooking &&
      service.isActive &&
      !service.requiresAuthentication,
  )
  .map((service) => ({
    id: service.id,
    categoryId: service.categoryId,
    branchId:
      service.id === "svc_civil_records" ? mockBranches[0].id : service.branchId,
    slug: service.slug,
    name: service.name,
    description: service.description,
    visibility: service.visibility,
    mode: service.mode,
    durationMinutes: service.durationMinutes,
    slotCapacity: service.slotCapacity,
    allowOnlineBooking: service.allowOnlineBooking,
    requiresApproval: service.requiresApproval,
    branch: service.id === "svc_civil_records" ? mockBranches[0] : null,
  }));

const publicSlotSeedData: PublicServiceSlotRecord[] = [
  {
    id: "slot_public_civil_0900",
    branchId: mockBranches[0].id,
    serviceId: "svc_civil_records",
    staffUserId: null,
    slotDate: "2026-03-31T00:00:00.000Z",
    startsAt: "2026-03-31T12:00:00.000Z",
    endsAt: "2026-03-31T12:20:00.000Z",
    capacity: 1,
    availableCapacity: 1,
    status: "OPEN",
    branch: mockBranches[0],
  },
  {
    id: "slot_public_civil_0940",
    branchId: mockBranches[0].id,
    serviceId: "svc_civil_records",
    staffUserId: null,
    slotDate: "2026-03-31T00:00:00.000Z",
    startsAt: "2026-03-31T12:40:00.000Z",
    endsAt: "2026-03-31T13:00:00.000Z",
    capacity: 1,
    availableCapacity: 1,
    status: "OPEN",
    branch: mockBranches[0],
  },
  {
    id: "slot_public_social_1130",
    branchId: mockBranches[0].id,
    serviceId: "svc_social_programs",
    staffUserId: null,
    slotDate: "2026-04-01T00:00:00.000Z",
    startsAt: "2026-04-01T14:30:00.000Z",
    endsAt: "2026-04-01T15:15:00.000Z",
    capacity: 3,
    availableCapacity: 2,
    status: "OPEN",
    branch: mockBranches[0],
  },
  {
    id: "slot_public_social_1430",
    branchId: mockBranches[1].id,
    serviceId: "svc_social_programs",
    staffUserId: null,
    slotDate: "2026-04-02T00:00:00.000Z",
    startsAt: "2026-04-02T17:30:00.000Z",
    endsAt: "2026-04-02T18:15:00.000Z",
    capacity: 3,
    availableCapacity: 1,
    status: "OPEN",
    branch: mockBranches[1],
  },
];

type MockPublicAppointmentRecord = PublicAppointmentLookupRecord & {
  slotId: string;
};

const mockPublicAppointments: MockPublicAppointmentRecord[] = [
  {
    code: "APT-20260328-DEMO01",
    status: "CONFIRMED",
    scheduledStart: publicSlotSeedData[0].startsAt,
    scheduledEnd: publicSlotSeedData[0].endsAt,
    service: {
      id: "svc_civil_records",
      slug: "civil-records",
      name: "Civil Records Request",
      mode: "IN_PERSON",
      durationMinutes: 20,
    },
    branch: {
      id: mockBranches[0].id,
      slug: mockBranches[0].slug,
      name: mockBranches[0].name,
      description: mockBranches[0].description,
      timezone: mockBranches[0].timezone,
      city: mockBranches[0].city,
      state: mockBranches[0].state,
      country: mockBranches[0].country,
      postalCode: mockBranches[0].postalCode,
    },
    citizen: {
      firstName: "Ana",
      lastName: "Gonzalez",
      email: "ana.gonzalez@example.com",
      phone: "+56911112222",
    },
    cancellation: null,
    slotId: publicSlotSeedData[0].id,
  },
  {
    code: "APT-20260327-DEMO02",
    status: "CANCELLED",
    scheduledStart: publicSlotSeedData[2].startsAt,
    scheduledEnd: publicSlotSeedData[2].endsAt,
    service: {
      id: "svc_social_programs",
      slug: "social-programs",
      name: "Social Programs Guidance",
      mode: "IN_PERSON",
      durationMinutes: 45,
    },
    branch: {
      id: mockBranches[0].id,
      slug: mockBranches[0].slug,
      name: mockBranches[0].name,
      description: mockBranches[0].description,
      timezone: mockBranches[0].timezone,
      city: mockBranches[0].city,
      state: mockBranches[0].state,
      country: mockBranches[0].country,
      postalCode: mockBranches[0].postalCode,
    },
    citizen: {
      firstName: "Carlos",
      lastName: "Mendez",
      email: "carlos.mendez@example.com",
      phone: "+56933334444",
    },
    cancellation: {
      cancelledAt: new Date("2026-03-27T16:00:00.000Z").toISOString(),
    },
    slotId: publicSlotSeedData[2].id,
  },
];

function buildPublicServicesQueryParams(
  filters: ListPublicServicesQuery = DEFAULT_PUBLIC_SERVICES_QUERY,
) {
  const params = new URLSearchParams();

  if (filters.branchId?.trim()) {
    params.set("branchId", filters.branchId.trim());
  }

  if (filters.categoryId?.trim()) {
    params.set("categoryId", filters.categoryId.trim());
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  return params;
}

function buildPublicSlotsQueryParams(
  filters: ListPublicServiceSlotsQuery = DEFAULT_PUBLIC_SERVICE_SLOTS_QUERY,
) {
  const params = new URLSearchParams();

  if (filters.dateFrom?.trim()) {
    params.set("dateFrom", filters.dateFrom.trim());
  }

  if (filters.dateTo?.trim()) {
    params.set("dateTo", filters.dateTo.trim());
  }

  if (filters.branchId?.trim()) {
    params.set("branchId", filters.branchId.trim());
  }

  return params;
}

function matchesPublicServicesQuery(
  service: PublicServiceRecord,
  filters: ListPublicServicesQuery = DEFAULT_PUBLIC_SERVICES_QUERY,
) {
  const normalizedSearch = filters.search?.trim().toLowerCase();

  return (
    (!filters.branchId || service.branchId === filters.branchId) &&
    (!filters.categoryId || service.categoryId === filters.categoryId) &&
    (!normalizedSearch ||
      service.name.toLowerCase().includes(normalizedSearch) ||
      service.slug.toLowerCase().includes(normalizedSearch) ||
      service.description?.toLowerCase().includes(normalizedSearch) === true)
  );
}

function matchesPublicSlotsQuery(
  slot: PublicServiceSlotRecord,
  filters: ListPublicServiceSlotsQuery = DEFAULT_PUBLIC_SERVICE_SLOTS_QUERY,
) {
  const startsAt = new Date(slot.startsAt).getTime();
  const dateFrom = filters.dateFrom
    ? parseDateBoundary(filters.dateFrom, "start")
    : null;
  const dateTo = filters.dateTo ? parseDateBoundary(filters.dateTo, "end") : null;

  return (
    (!filters.branchId || slot.branchId === filters.branchId) &&
    (!dateFrom || startsAt >= dateFrom.getTime()) &&
    (!dateTo || startsAt <= dateTo.getTime())
  );
}

function isPublicAppointmentCancellable(
  appointment: Pick<PublicAppointmentLookupRecord, "status" | "cancellation">,
) {
  return (
    !appointment.cancellation &&
    (appointment.status === "PENDING" || appointment.status === "CONFIRMED")
  );
}

function isPublicAppointmentReschedulable(
  appointment: Pick<PublicAppointmentLookupRecord, "status" | "cancellation">,
) {
  return (
    !appointment.cancellation &&
    (appointment.status === "PENDING" || appointment.status === "CONFIRMED")
  );
}

function stripMockAppointmentRecord(
  appointment: MockPublicAppointmentRecord,
): PublicAppointmentLookupRecord {
  const { slotId, ...publicAppointment } = appointment;
  void slotId;

  return publicAppointment;
}

function findMockAppointmentByCode(code: string) {
  return mockPublicAppointments.find((appointment) => appointment.code === code);
}

function findMockServiceForAppointment(appointment: MockPublicAppointmentRecord) {
  return publicServiceSeedData.find(
    (service) =>
      service.id === appointment.service.id || service.slug === appointment.service.slug,
  );
}

function findMockBranchById(branchId: string) {
  return mockBranches.find((branch) => branch.id === branchId) ?? null;
}

function normalizeAppointmentCodeOrThrowApiError(rawCode: string) {
  try {
    return normalizePublicAppointmentCode(rawCode);
  } catch {
    throw new ApiError("Invalid appointment code.", 400, {
      message: "Enter a valid appointment code.",
    });
  }
}

export async function getPublicServices(
  filters: ListPublicServicesQuery = DEFAULT_PUBLIC_SERVICES_QUERY,
  tenant?: TenantApiContext,
) {
  if (isBackendEnabled() && !env.useMockData) {
    const params = buildPublicServicesQueryParams(filters);

    return apiRequest<PublicServiceRecord[]>(
      `/api/v1/public/services${params.size ? `?${params.toString()}` : ""}`,
      {
        method: "GET",
        tenant,
      },
    );
  }

  await sleep(120);

  return publicServiceSeedData
    .filter((service) => matchesPublicServicesQuery(service, filters))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function getPublicSlots(
  serviceId: string,
  filters: ListPublicServiceSlotsQuery = DEFAULT_PUBLIC_SERVICE_SLOTS_QUERY,
  tenant?: TenantApiContext,
) {
  if (isBackendEnabled() && !env.useMockData) {
    const params = buildPublicSlotsQueryParams(filters);

    return apiRequest<PublicServiceSlotRecord[]>(
      `/api/v1/public/services/${serviceId}/slots${
        params.size ? `?${params.toString()}` : ""
      }`,
      {
        method: "GET",
        tenant,
      },
    );
  }

  await sleep(120);

  return publicSlotSeedData
    .filter((slot) => slot.serviceId === serviceId)
    .filter((slot) => matchesPublicSlotsQuery(slot, filters))
    .filter((slot) => slot.availableCapacity > 0)
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );
}

export async function getPublicAppointmentByCode(
  rawCode: string,
  tenant?: TenantApiContext,
): Promise<PublicAppointmentLookupRecord> {
  const code = normalizeAppointmentCodeOrThrowApiError(rawCode);

  if (isBackendEnabled() && !env.useMockData) {
    return apiRequest<PublicAppointmentLookupRecord>(
      `/api/v1/public/appointments/${encodeURIComponent(code)}`,
      {
        method: "GET",
        tenant,
      },
    );
  }

  await sleep(120);

  const appointment = findMockAppointmentByCode(code);

  if (!appointment) {
    throw new ApiError("Appointment not found.", 404, {
      message: "No public appointment was found for that code.",
    });
  }

  return stripMockAppointmentRecord(appointment);
}

export async function cancelPublicAppointmentByCode(
  rawCode: string,
  input: CancelPublicAppointmentInput,
  tenant?: TenantApiContext,
): Promise<PublicAppointmentLookupRecord> {
  const code = normalizeAppointmentCodeOrThrowApiError(rawCode);

  if (isBackendEnabled() && !env.useMockData) {
    return apiRequest<PublicAppointmentLookupRecord>(
      `/api/v1/public/appointments/${encodeURIComponent(code)}/cancel`,
      {
        method: "POST",
        body: input,
        tenant,
      },
    );
  }

  await sleep(180);

  const appointment = findMockAppointmentByCode(code);

  if (!appointment) {
    throw new ApiError("Appointment not found.", 404, {
      message: "No public appointment was found for that code.",
    });
  }

  if (appointment.cancellation || appointment.status === "CANCELLED") {
    throw new ApiError("Appointment is already cancelled.", 409, {
      message: "This appointment has already been cancelled.",
    });
  }

  if (!isPublicAppointmentCancellable(appointment)) {
    throw new ApiError("Appointment cannot be cancelled.", 409, {
      message: "This appointment can no longer be cancelled online.",
    });
  }

  appointment.status = "CANCELLED";
  appointment.cancellation = {
    cancelledAt: new Date().toISOString(),
  };

  const slot = publicSlotSeedData.find((item) => item.id === appointment.slotId);

  if (slot) {
    slot.availableCapacity = Math.min(slot.availableCapacity + 1, slot.capacity);
    slot.status = slot.availableCapacity > 0 ? "OPEN" : slot.status;
  }

  return stripMockAppointmentRecord(appointment);
}

export async function reschedulePublicAppointmentByCode(
  rawCode: string,
  input: ReschedulePublicAppointmentInput,
  tenant?: TenantApiContext,
): Promise<PublicAppointmentLookupRecord> {
  const code = normalizeAppointmentCodeOrThrowApiError(rawCode);

  if (isBackendEnabled() && !env.useMockData) {
    return apiRequest<PublicAppointmentLookupRecord>(
      `/api/v1/public/appointments/${encodeURIComponent(code)}/reschedule`,
      {
        method: "POST",
        body: input,
        tenant,
      },
    );
  }

  await sleep(180);

  const appointment = findMockAppointmentByCode(code);

  if (!appointment) {
    throw new ApiError("Appointment not found.", 404, {
      message: "No public appointment was found for that code.",
    });
  }

  if (!isPublicAppointmentReschedulable(appointment)) {
    throw new ApiError("Appointment cannot be rescheduled.", 409, {
      message: "This appointment can no longer be rescheduled online.",
    });
  }

  if (appointment.slotId === input.newSlotId) {
    throw new ApiError("Invalid reschedule target.", 409, {
      message: "Choose a different time slot to reschedule this appointment.",
    });
  }

  const service = findMockServiceForAppointment(appointment);

  if (!service || !service.allowOnlineBooking || service.visibility !== "PUBLIC") {
    throw new ApiError("Service is not publicly bookable.", 409, {
      message: "This appointment can no longer be rescheduled online.",
    });
  }

  const nextSlot = publicSlotSeedData.find((slot) => slot.id === input.newSlotId);

  if (!nextSlot || nextSlot.serviceId !== service.id) {
    throw new ApiError("Time slot not found.", 404, {
      message: "The selected slot does not match this appointment service.",
    });
  }

  if (nextSlot.status !== "OPEN" || nextSlot.availableCapacity <= 0) {
    throw new ApiError("Public slot is unavailable.", 409, {
      message: "The selected slot is full or no longer available.",
    });
  }

  const currentSlot = publicSlotSeedData.find((slot) => slot.id === appointment.slotId);
  if (currentSlot) {
    currentSlot.availableCapacity = Math.min(
      currentSlot.availableCapacity + 1,
      currentSlot.capacity,
    );
    if (currentSlot.status === "FULL" && currentSlot.availableCapacity > 0) {
      currentSlot.status = "OPEN";
    }
  }

  nextSlot.availableCapacity -= 1;
  if (nextSlot.availableCapacity <= 0) {
    nextSlot.status = "FULL";
  }

  const nextBranch = findMockBranchById(nextSlot.branchId) ?? nextSlot.branch;

  appointment.slotId = nextSlot.id;
  appointment.scheduledStart = nextSlot.startsAt;
  appointment.scheduledEnd = nextSlot.endsAt;
  appointment.branch = {
    id: nextBranch.id,
    slug: nextBranch.slug,
    name: nextBranch.name,
    description: nextBranch.description,
    timezone: nextBranch.timezone,
    city: nextBranch.city,
    state: nextBranch.state,
    country: nextBranch.country,
    postalCode: nextBranch.postalCode,
  };

  return stripMockAppointmentRecord(appointment);
}

export async function createPublicBooking(
  input: CreatePublicAppointmentInput,
  tenant?: TenantApiContext,
): Promise<PublicAppointmentConfirmation> {
  if (isBackendEnabled() && !env.useMockData) {
    return apiRequest<PublicAppointmentConfirmation>("/api/v1/public/appointments", {
      method: "POST",
      body: input,
      tenant,
    });
  }

  await sleep(180);

  const selectedService = publicServiceSeedData.find(
    (service) => service.id === input.serviceId,
  );
  const selectedSlot = publicSlotSeedData.find((slot) => slot.id === input.slotId);

  if (!selectedService || !selectedSlot) {
    throw new ApiError("Public booking references are invalid.", 404, {
      message: "Service or slot not found in mock data",
    });
  }

  if (selectedSlot.availableCapacity <= 0 || selectedSlot.status !== "OPEN") {
    throw new ApiError("Public slot is unavailable.", 409, {
      message: "The selected slot is full or no longer available.",
    });
  }

  selectedSlot.availableCapacity -= 1;
  if (selectedSlot.availableCapacity <= 0) {
    selectedSlot.status = "FULL";
  }

  const code = `APT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const confirmation: PublicAppointmentConfirmation = {
    id: `apt_${Math.random().toString(36).slice(2, 10)}`,
    code,
    source: "WEB",
    status: selectedService.requiresApproval ? "PENDING" : "CONFIRMED",
    scheduledStart: selectedSlot.startsAt,
    scheduledEnd: selectedSlot.endsAt,
    citizenNotes: input.citizenNotes ?? null,
    createdAt: new Date().toISOString(),
    service: {
      id: selectedService.id,
      slug: selectedService.slug,
      name: selectedService.name,
      mode: selectedService.mode,
      durationMinutes: selectedService.durationMinutes,
    },
    branch: selectedSlot.branch,
    citizen: {
      id: `cit_${Math.random().toString(36).slice(2, 10)}`,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email ?? null,
      phone: input.phone ?? null,
      documentType: input.documentType ?? null,
      documentNumber: input.documentNumber ?? null,
    },
    slot: {
      id: selectedSlot.id,
      branchId: selectedSlot.branchId,
      serviceId: selectedSlot.serviceId,
      staffUserId: selectedSlot.staffUserId,
      slotDate: selectedSlot.slotDate,
      startsAt: selectedSlot.startsAt,
      endsAt: selectedSlot.endsAt,
    },
  };

  mockPublicAppointments.unshift({
    code,
    status: confirmation.status,
    scheduledStart: confirmation.scheduledStart,
    scheduledEnd: confirmation.scheduledEnd,
    service: {
      id: confirmation.service.id,
      slug: confirmation.service.slug,
      name: confirmation.service.name,
      mode: confirmation.service.mode,
      durationMinutes: confirmation.service.durationMinutes,
    },
    branch: {
      id: confirmation.branch.id,
      slug: confirmation.branch.slug,
      name: confirmation.branch.name,
      description: confirmation.branch.description,
      timezone: confirmation.branch.timezone,
      city: confirmation.branch.city,
      state: confirmation.branch.state,
      country: confirmation.branch.country,
      postalCode: confirmation.branch.postalCode,
    },
    citizen: {
      firstName: confirmation.citizen.firstName,
      lastName: confirmation.citizen.lastName,
      email: confirmation.citizen.email,
      phone: confirmation.citizen.phone,
    },
    cancellation: null,
    slotId: selectedSlot.id,
  });

  return confirmation;
}

function parseDateBoundary(input: string, boundary: "start" | "end") {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(
      boundary === "start"
        ? `${input}T00:00:00.000Z`
        : `${input}T23:59:59.999Z`,
    );
  }

  const parsed = new Date(input);

  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(`Invalid date value: ${input}`, 400, {
      message: `Invalid date value: ${input}`,
    });
  }

  return parsed;
}
