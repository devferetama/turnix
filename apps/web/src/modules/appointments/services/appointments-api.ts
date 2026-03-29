import { isBackendEnabled } from "@/config/env";
import { ApiError, apiRequest } from "@/lib/api/client";
import { sleep } from "@/lib/utils";
import { branchSeedData } from "@/modules/branches/constants/branches.constants";
import {
  appointmentCitizenSeedData,
  appointmentSeedData,
  appointmentSlotSeedData,
} from "@/modules/appointments/constants/appointments.constants";
import type {
  AppointmentCancellationRecord,
  AppointmentCitizenInput,
  AppointmentRecord,
  AppointmentSlotLookupRecord,
  AppointmentSlotLookupResult,
  AppointmentStatusHistoryRecord,
  CancelAppointmentInput,
  CreateAppointmentInput,
  ListAppointmentsQuery,
  RescheduleAppointmentInput,
  UpdateAppointmentStatusInput,
} from "@/modules/appointments/types/appointment.types";
import type { TenantApiContext } from "@/modules/tenant/types/tenant.types";

function buildAppointmentsQueryParams(filters: ListAppointmentsQuery = {}) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.serviceId?.trim()) {
    params.set("serviceId", filters.serviceId.trim());
  }

  if (filters.branchId?.trim()) {
    params.set("branchId", filters.branchId.trim());
  }

  if (filters.citizenId?.trim()) {
    params.set("citizenId", filters.citizenId.trim());
  }

  if (filters.dateFrom?.trim()) {
    params.set("dateFrom", filters.dateFrom.trim());
  }

  if (filters.dateTo?.trim()) {
    params.set("dateTo", filters.dateTo.trim());
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  return params;
}

function getMockTenantId(tenantId?: string) {
  return tenantId ?? "tenant_municipal_services";
}

function createMockAppointmentId() {
  return `apt_${Math.random().toString(36).slice(2, 10)}`;
}

function createMockHistoryId() {
  return `history_${Math.random().toString(36).slice(2, 10)}`;
}

function createMockCancellationId() {
  return `cancel_${Math.random().toString(36).slice(2, 10)}`;
}

function createMockCitizenId() {
  return `cit_${Math.random().toString(36).slice(2, 10)}`;
}

function isAppointmentReschedulable(status: AppointmentRecord["status"]) {
  return status === "PENDING" || status === "CONFIRMED";
}

function generateMockAppointmentCode(now = new Date()) {
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `APT-${datePart}-${randomPart}`;
}

function matchesAppointmentsQuery(
  appointment: AppointmentRecord,
  filters: ListAppointmentsQuery = {},
) {
  const normalizedSearch = filters.search?.trim().toLowerCase();
  const scheduledStart = new Date(appointment.scheduledStart).getTime();
  const dateFrom = filters.dateFrom ? parseDateBoundary(filters.dateFrom, "start") : null;
  const dateTo = filters.dateTo ? parseDateBoundary(filters.dateTo, "end") : null;

  return (
    (!filters.status || appointment.status === filters.status) &&
    (!filters.serviceId || appointment.serviceId === filters.serviceId) &&
    (!filters.branchId || appointment.branchId === filters.branchId) &&
    (!filters.citizenId || appointment.citizenId === filters.citizenId) &&
    (!dateFrom || scheduledStart >= dateFrom.getTime()) &&
    (!dateTo || scheduledStart <= dateTo.getTime()) &&
    (!normalizedSearch ||
      appointment.code.toLowerCase().includes(normalizedSearch) ||
      `${appointment.citizen.firstName} ${appointment.citizen.lastName}`
        .toLowerCase()
        .includes(normalizedSearch) ||
      appointment.citizen.email?.toLowerCase().includes(normalizedSearch) === true)
  );
}

function sortAppointments(appointments: AppointmentRecord[]) {
  return [...appointments].sort(
    (left, right) =>
      new Date(left.scheduledStart).getTime() -
      new Date(right.scheduledStart).getTime(),
  );
}

function getMockAppointmentById(tenantId: string, id: string) {
  return appointmentSeedData.find(
    (appointment) => appointment.tenantId === tenantId && appointment.id === id,
  );
}

function findMockCitizenByInput(
  _tenantId: string,
  citizen?: AppointmentCitizenInput,
) {
  if (!citizen) {
    return undefined;
  }

  const byDocument =
    citizen.documentType && citizen.documentNumber
      ? appointmentCitizenSeedData.find(
          (candidate) =>
            candidate.documentType === citizen.documentType &&
            candidate.documentNumber === citizen.documentNumber,
        )
      : undefined;
  const byEmail = citizen.email
    ? appointmentCitizenSeedData.find(
        (candidate) => candidate.email?.toLowerCase() === citizen.email?.toLowerCase(),
      )
    : undefined;

  if (byDocument && byEmail && byDocument.id !== byEmail.id) {
    throw new ApiError("Citizen data is ambiguous.", 409, {
      message: "Citizen data matches multiple existing records in this tenant",
    });
  }

  return byDocument ?? byEmail;
}

function createMockCitizen(input: AppointmentCitizenInput) {
  const citizen = {
    id: createMockCitizenId(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email ?? null,
    phone: input.phone ?? null,
    documentType: input.documentType ?? null,
    documentNumber: input.documentNumber ?? null,
  };

  appointmentCitizenSeedData.unshift(citizen);

  return citizen;
}

function cloneAppointment<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createMockHistoryEntry(input: {
  appointmentId: string;
  fromStatus: AppointmentRecord["status"] | null;
  toStatus: AppointmentRecord["status"];
  note?: string | null;
  metadata?: Record<string, unknown> | null;
}): AppointmentStatusHistoryRecord {
  return {
    id: createMockHistoryId(),
    appointmentId: input.appointmentId,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    note: input.note ?? null,
    metadata: input.metadata ?? null,
    changedByStaffUserId: null,
    changedAt: new Date().toISOString(),
    changedByStaffUser: null,
  };
}

async function getApiSlotsFromSchedulingEndpoint({
  accessToken,
  branchId,
  serviceId,
  date,
  tenant,
}: {
  accessToken?: string;
  branchId: string;
  serviceId: string;
  date: string;
  tenant?: TenantApiContext;
}) {
  const params = new URLSearchParams();
  params.set("branchId", branchId);
  params.set("serviceId", serviceId);
  params.set("dateFrom", date);
  params.set("dateTo", date);

  return apiRequest<AppointmentSlotLookupRecord[]>(
    `/api/v1/scheduling/slots?${params.toString()}`,
    {
      method: "GET",
      accessToken,
      tenant,
    },
  );
}

export async function getAppointments({
  accessToken,
  tenantId,
  filters,
  tenant,
}: {
  accessToken?: string;
  tenantId?: string;
  filters?: ListAppointmentsQuery;
  tenant?: TenantApiContext;
} = {}) {
  if (isBackendEnabled()) {
    const params = buildAppointmentsQueryParams(filters);

    return apiRequest<AppointmentRecord[]>(
      `/api/v1/appointments${params.size ? `?${params.toString()}` : ""}`,
      {
        method: "GET",
        accessToken,
        tenant,
      },
    );
  }

  await sleep(140);

  return sortAppointments(
    appointmentSeedData
      .filter((appointment) => appointment.tenantId === getMockTenantId(tenantId))
      .filter((appointment) => matchesAppointmentsQuery(appointment, filters))
      .map((appointment) => cloneAppointment(appointment)),
  );
}

export async function getAppointmentById({
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
    return apiRequest<AppointmentRecord>(`/api/v1/appointments/${id}`, {
      method: "GET",
      accessToken,
      tenant,
    });
  }

  await sleep(120);

  const appointment = getMockAppointmentById(getMockTenantId(tenantId), id);

  if (!appointment) {
    throw new ApiError("Appointment not found.", 404, {
      message: "Appointment not found",
    });
  }

  return cloneAppointment(appointment);
}

export async function createAppointment({
  input,
  accessToken,
  tenantId,
  tenant,
}: {
  input: CreateAppointmentInput;
  accessToken?: string;
  tenantId?: string;
  tenant?: TenantApiContext;
}) {
  if (isBackendEnabled()) {
    return apiRequest<AppointmentRecord>("/api/v1/appointments", {
      method: "POST",
      accessToken,
      body: input,
      tenant,
    });
  }

  await sleep(180);

  const resolvedTenantId = getMockTenantId(tenantId);
  const slot = appointmentSlotSeedData.find((item) => item.id === input.slotId);

  if (!slot) {
    throw new ApiError("Time slot not found.", 404, {
      message: "Time slot not found",
    });
  }

  if (slot.status !== "OPEN" || slot.reservedCount >= slot.capacity) {
    throw new ApiError("Slot is full or unavailable.", 409, {
      message: "Slot is full or unavailable",
    });
  }

  const citizen =
    (input.citizenId
      ? appointmentCitizenSeedData.find((item) => item.id === input.citizenId)
      : undefined) ??
    findMockCitizenByInput(resolvedTenantId, input.citizen) ??
    (input.citizen ? createMockCitizen(input.citizen) : undefined);

  if (!citizen) {
    throw new ApiError("Citizen data is required.", 400, {
      message: "Either citizenId or citizen payload must be provided",
    });
  }

  slot.reservedCount += 1;
  if (slot.reservedCount >= slot.capacity) {
    slot.status = "FULL";
  }

  const now = new Date().toISOString();
  const appointment: AppointmentRecord = {
    id: createMockAppointmentId(),
    tenantId: resolvedTenantId,
    branchId: input.branchId,
    serviceId: input.serviceId,
    citizenId: citizen.id,
    staffUserId: input.staffUserId ?? slot.staffUserId,
    slotId: slot.id,
    code: generateMockAppointmentCode(),
    source: input.source ?? "STAFF",
    status: "CONFIRMED",
    scheduledStart: slot.startsAt,
    scheduledEnd: slot.endsAt,
    citizenNotes: input.citizenNotes ?? null,
    internalNotes: input.internalNotes ?? null,
    checkedInAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: now,
    updatedAt: now,
    branch:
      cloneAppointment(
        appointmentSeedData[0]?.branch,
      ) ??
      {
        id: input.branchId,
        slug: input.branchId,
        name: input.branchId,
      },
    service:
      cloneAppointment(
        appointmentSeedData.find((item) => item.serviceId === input.serviceId)?.service,
      ) ??
      {
        id: input.serviceId,
        slug: input.serviceId,
        name: input.serviceId,
        visibility: "PUBLIC",
        mode: "IN_PERSON",
        durationMinutes: Math.max(
          Math.round(
            (new Date(slot.endsAt).getTime() - new Date(slot.startsAt).getTime()) /
              60000,
          ),
          1,
        ),
      },
    citizen: cloneAppointment(citizen),
    slot: cloneAppointment(slot),
    staffUser: null,
    statusHistory: [
      createMockHistoryEntry({
        appointmentId: "temp",
        fromStatus: null,
        toStatus: "CONFIRMED",
        note: "Appointment created from backoffice.",
        metadata: {
          source: input.source ?? "STAFF",
        },
      }),
    ],
  };

  appointment.statusHistory = appointment.statusHistory?.map((history) => ({
    ...history,
    appointmentId: appointment.id,
  }));

  appointmentSeedData.unshift(appointment);

  return cloneAppointment(appointment);
}

export async function updateAppointmentStatus({
  id,
  input,
  accessToken,
  tenantId,
  tenant,
}: {
  id: string;
  input: UpdateAppointmentStatusInput;
  accessToken?: string;
  tenantId?: string;
  tenant?: TenantApiContext;
}) {
  if (isBackendEnabled()) {
    return apiRequest<AppointmentRecord>(`/api/v1/appointments/${id}/status`, {
      method: "PATCH",
      accessToken,
      body: input,
      tenant,
    });
  }

  await sleep(180);

  const appointment = getMockAppointmentById(getMockTenantId(tenantId), id);

  if (!appointment) {
    throw new ApiError("Appointment not found.", 404, {
      message: "Appointment not found",
    });
  }

  const nextAllowed: Record<
    AppointmentRecord["status"],
    AppointmentRecord["status"][]
  > = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["CHECKED_IN", "NO_SHOW", "CANCELLED"],
    CHECKED_IN: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
    RESCHEDULED: [],
  };

  if (appointment.status === input.status) {
    throw new ApiError("Invalid status transition.", 409, {
      message: `Appointment is already in status ${input.status}`,
    });
  }

  if (!nextAllowed[appointment.status].includes(input.status)) {
    throw new ApiError("Invalid status transition.", 409, {
      message: `Cannot transition appointment from ${appointment.status} to ${input.status}`,
    });
  }

  const now = new Date().toISOString();
  const previousStatus = appointment.status;
  appointment.status = input.status;
  appointment.updatedAt = now;

  if (input.status === "CHECKED_IN") {
    appointment.checkedInAt = now;
  }

  if (input.status === "COMPLETED") {
    appointment.completedAt = now;
  }

  appointment.statusHistory = [
    createMockHistoryEntry({
      appointmentId: appointment.id,
      fromStatus: previousStatus,
      toStatus: input.status,
      note: input.note,
    }),
    ...(appointment.statusHistory ?? []),
  ];

  return cloneAppointment(appointment);
}

export async function cancelAppointment({
  id,
  input,
  accessToken,
  tenantId,
  tenant,
}: {
  id: string;
  input: CancelAppointmentInput;
  accessToken?: string;
  tenantId?: string;
  tenant?: TenantApiContext;
}) {
  if (isBackendEnabled()) {
    return apiRequest<AppointmentRecord>(`/api/v1/appointments/${id}/cancel`, {
      method: "POST",
      accessToken,
      body: input,
      tenant,
    });
  }

  await sleep(180);

  const appointment = getMockAppointmentById(getMockTenantId(tenantId), id);

  if (!appointment) {
    throw new ApiError("Appointment not found.", 404, {
      message: "Appointment not found",
    });
  }

  if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
    throw new ApiError("Invalid appointment cancellation.", 409, {
      message: "The appointment cannot be cancelled in its current state",
    });
  }

  if (appointment.cancellation) {
    throw new ApiError("Invalid appointment cancellation.", 409, {
      message: "The appointment is already cancelled",
    });
  }

  const slot = appointmentSlotSeedData.find((item) => item.id === appointment.slotId);
  if (slot) {
    slot.reservedCount = Math.max(slot.reservedCount - 1, 0);
    if (slot.status === "FULL" && slot.reservedCount < slot.capacity) {
      slot.status = "OPEN";
    }
    appointment.slot = cloneAppointment(slot);
  }

  const previousStatus = appointment.status;
  const now = new Date().toISOString();
  appointment.status = "CANCELLED";
  appointment.cancelledAt = now;
  appointment.updatedAt = now;
  appointment.cancellation = {
    id: createMockCancellationId(),
    appointmentId: appointment.id,
    cancelledByStaffUserId: null,
    reason: input.reason ?? null,
    details: input.details ?? null,
    cancelledAt: now,
    cancelledByStaffUser: null,
  } satisfies AppointmentCancellationRecord;
  appointment.statusHistory = [
    createMockHistoryEntry({
      appointmentId: appointment.id,
      fromStatus: previousStatus,
      toStatus: "CANCELLED",
      note: input.reason ?? input.details,
    }),
    ...(appointment.statusHistory ?? []),
  ];

  return cloneAppointment(appointment);
}

export async function rescheduleAppointment({
  id,
  input,
  accessToken,
  tenantId,
  tenant,
}: {
  id: string;
  input: RescheduleAppointmentInput;
  accessToken?: string;
  tenantId?: string;
  tenant?: TenantApiContext;
}) {
  if (isBackendEnabled()) {
    return apiRequest<AppointmentRecord>(`/api/v1/appointments/${id}/reschedule`, {
      method: "POST",
      accessToken,
      body: input,
      tenant,
    });
  }

  await sleep(180);

  const appointment = getMockAppointmentById(getMockTenantId(tenantId), id);

  if (!appointment) {
    throw new ApiError("Appointment not found.", 404, {
      message: "Appointment not found",
    });
  }

  if (!isAppointmentReschedulable(appointment.status)) {
    throw new ApiError("Appointment cannot be rescheduled.", 409, {
      message: "The appointment cannot be rescheduled in its current state",
    });
  }

  if (appointment.slotId === input.newSlotId) {
    throw new ApiError("Invalid reschedule target.", 409, {
      message: "Choose a different slot to reschedule this appointment",
    });
  }

  const nextSlot = appointmentSlotSeedData.find((slot) => slot.id === input.newSlotId);

  if (!nextSlot) {
    throw new ApiError("Time slot not found.", 404, {
      message: "Time slot not found",
    });
  }

  if (nextSlot.serviceId !== appointment.serviceId) {
    throw new ApiError("Invalid time slot.", 409, {
      message: "The selected slot does not belong to this appointment service",
    });
  }

  if (nextSlot.status !== "OPEN" || nextSlot.reservedCount >= nextSlot.capacity) {
    throw new ApiError("Slot is full or unavailable.", 409, {
      message: "The selected slot is full or no longer available",
    });
  }

  const previousSlotId = appointment.slotId;
  const previousBranchId = appointment.branchId;
  const previousStatus = appointment.status;
  const previousSlot = appointmentSlotSeedData.find(
    (slot) => slot.id === previousSlotId,
  );

  if (previousSlot) {
    previousSlot.reservedCount = Math.max(previousSlot.reservedCount - 1, 0);
    if (previousSlot.status === "FULL" && previousSlot.reservedCount < previousSlot.capacity) {
      previousSlot.status = "OPEN";
    }
  }

  nextSlot.reservedCount += 1;
  if (nextSlot.reservedCount >= nextSlot.capacity) {
    nextSlot.status = "FULL";
  }

  const now = new Date().toISOString();
  const nextBranch =
    branchSeedData.find((branch) => branch.id === nextSlot.branchId) ?? null;

  appointment.slotId = nextSlot.id;
  appointment.branchId = nextSlot.branchId;
  appointment.staffUserId = nextSlot.staffUserId;
  appointment.scheduledStart = nextSlot.startsAt;
  appointment.scheduledEnd = nextSlot.endsAt;
  appointment.updatedAt = now;
  appointment.branch = nextBranch
    ? {
        id: nextBranch.id,
        slug: nextBranch.slug,
        name: nextBranch.name,
      }
    : {
        id: nextSlot.branchId,
        slug: nextSlot.branchId,
        name: nextSlot.branchId,
      };
  appointment.slot = cloneAppointment(nextSlot);
  appointment.statusHistory = [
    createMockHistoryEntry({
      appointmentId: appointment.id,
      fromStatus: previousStatus,
      toStatus: previousStatus,
      note: input.reason ?? input.details ?? "Appointment rescheduled.",
      metadata: {
        event: "rescheduled",
        fromSlotId: previousSlotId,
        toSlotId: nextSlot.id,
        fromBranchId: previousBranchId,
        toBranchId: nextSlot.branchId,
        details: input.details ?? null,
      },
    }),
    ...(appointment.statusHistory ?? []),
  ];

  return cloneAppointment(appointment);
}

export async function getAppointmentSlotOptions({
  branchId,
  serviceId,
  date,
  accessToken,
  tenantId: _tenantId,
  tenant,
}: {
  branchId?: string;
  serviceId?: string;
  date?: string;
  accessToken?: string;
  tenantId?: string;
  tenant?: TenantApiContext;
}): Promise<AppointmentSlotLookupResult> {
  void _tenantId;

  if (!branchId || !serviceId || !date) {
    return {
      items: [],
      mode: "manual",
    };
  }

  if (isBackendEnabled()) {
    try {
      const items = await getApiSlotsFromSchedulingEndpoint({
        branchId,
        serviceId,
        date,
        accessToken,
        tenant,
      });

      return {
        items,
        mode: "available",
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return {
          items: [],
          mode: "manual",
        };
      }

      throw error;
    }
  }

  await sleep(120);

  return {
    items: appointmentSlotSeedData.filter((slot) => {
      const sameDay = slot.slotDate.slice(0, 10) === date;

      return (
        sameDay &&
        slot.serviceId === serviceId &&
        slot.branchId === branchId &&
        slot.status === "OPEN"
      );
    }),
    mode: "available",
  };
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
    throw new ApiError("Invalid date.", 400, {
      message: `Invalid date value: ${input}`,
    });
  }

  return parsed;
}
